import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Char "mo:core/Char";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();

  public type UserProfile = { name : Text };

  type AvailableSlot = {
    id : Nat;
    date : Text;
    time : Text;
    isBooked : Bool;
  };

  type Booking = {
    id : Nat;
    clientName : Text;
    email : Text;
    service : Text;
    slotId : Nat;
    slotDate : Text;
    slotTime : Text;
    dob : Text;
    tob : Text;
    birthPlace : Text;
    lat : Float;
    lng : Float;
    gender : Text;
    question : Text;
    status : Text;
    createdAt : Int;
    feeApplied : Nat;
    couponUsed : Text;
  };

  type ServiceFee = {
    serviceName : Text;
    amount : Nat;
    currency : Text;
  };

  type Coupon = {
    code : Text;
    discountPercent : Nat;
    maxUsage : Nat;
    usageCount : Nat;
    active : Bool;
  };

  type Remedy = {
    id : Nat;
    bookingId : Nat;
    clientName : Text;
    title : Text;
    content : Text;
    createdAt : Int;
  };

  public type Referral = {
    owner : Principal;
    code : Text;
    coinsEarned : Nat;
    timesUsed : Nat;
    createdAt : Int;
  };

  type Result<T, E> = {
    #ok : T;
    #err : E;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  let slots = Map.empty<Nat, AvailableSlot>();
  let bookings = Map.empty<Nat, Booking>();
  let serviceFees = Map.empty<Text, ServiceFee>();
  let coupons = Map.empty<Text, Coupon>();
  let remedies = Map.empty<Nat, Remedy>();
  let referrals = Map.empty<Text, Referral>();
  let userCoinBalances = Map.empty<Principal, Nat>();
  let userReferralCode = Map.empty<Principal, Text>();
  let userAppliedReferral = Map.empty<Principal, Bool>();

  var firstAdminClaimed = false;

  var nextSlotId = 1;
  var nextBookingId = 1;
  var nextRemedyId = 1;
  var nextReferralId = 1;

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getAvailableSlots() : async [AvailableSlot] {
    let availableList = List.empty<AvailableSlot>();
    for ((_, slot) in slots.entries()) {
      if (not slot.isBooked) {
        availableList.add(slot);
      };
    };
    availableList.toArray();
  };

  public query ({ caller }) func getAllSlots() : async Result<[AvailableSlot], Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can access all slots");
    };
    let slotsList = List.empty<AvailableSlot>();
    for ((_, slot) in slots.entries()) {
      slotsList.add(slot);
    };
    #ok(slotsList.toArray());
  };

  public query ({ caller }) func getServiceFees() : async [ServiceFee] {
    let feeList = List.empty<ServiceFee>();
    for ((_, fee) in serviceFees.entries()) {
      feeList.add(fee);
    };
    feeList.toArray();
  };

  public query ({ caller }) func validateCoupon(code : Text) : async Result<Coupon, Text> {
    switch (coupons.get(code)) {
      case (null) { #err("Coupon not found") };
      case (?coupon) {
        if (not coupon.active) {
          #err("Coupon is not active");
        } else if (coupon.usageCount >= coupon.maxUsage) {
          #err("Coupon usage limit reached");
        } else {
          #ok(coupon);
        };
      };
    };
  };

  public shared ({ caller }) func bookAppointment(
    clientName : Text,
    email : Text,
    service : Text,
    slotId : Nat,
    dob : Text,
    tob : Text,
    birthPlace : Text,
    lat : Float,
    lng : Float,
    gender : Text,
    question : Text,
    couponCode : ?Text
  ) : async Result<Booking, Text> {
    switch (slots.get(slotId)) {
      case (null) { #err("Slot not found") };
      case (?slot) {
        if (slot.isBooked) {
          return #err("Slot already booked");
        };

        let fee = switch (serviceFees.get(service)) {
          case (null) { 0 };
          case (?fee) { fee.amount };
        };

        let (feeApplied, couponUsed) = switch (couponCode) {
          case (null) { (fee, "") };
          case (?code) {
            switch (coupons.get(code)) {
              case (null) { (fee, "") };
              case (?coupon) {
                if (not coupon.active or coupon.usageCount >= coupon.maxUsage) {
                  (fee, "");
                } else {
                  let discountedFee = fee.toInt() - ((fee.toInt() * coupon.discountPercent.toInt()) / 100);
                  let updatedCoupon = {
                    coupon with
                    usageCount = coupon.usageCount + 1;
                  };
                  coupons.add(code, updatedCoupon);
                  (discountedFee.toNat(), code);
                };
              };
            };
          };
        };

        let booking : Booking = {
          id = nextBookingId;
          clientName;
          email;
          service;
          slotId;
          slotDate = slot.date;
          slotTime = slot.time;
          dob;
          tob;
          birthPlace;
          lat;
          lng;
          gender;
          question;
          status = "confirmed";
          createdAt = Time.now();
          feeApplied;
          couponUsed;
        };

        bookings.add(nextBookingId, booking);
        slots.add(slotId, { slot with isBooked = true });
        nextBookingId += 1;
        #ok(booking);
      };
    };
  };

  public query ({ caller }) func getBookings() : async Result<[Booking], Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can access bookings");
    };
    let bookingsList = List.empty<Booking>();
    for ((_, booking) in bookings.entries()) {
      bookingsList.add(booking);
    };
    #ok(bookingsList.toArray());
  };

  public shared ({ caller }) func addSlot(date : Text, time : Text) : async Result<AvailableSlot, Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can add slots");
    };

    let newSlot : AvailableSlot = {
      id = nextSlotId;
      date;
      time;
      isBooked = false;
    };

    slots.add(nextSlotId, newSlot);
    nextSlotId += 1;
    #ok(newSlot);
  };

  public shared ({ caller }) func removeSlot(id : Nat) : async Result<Bool, Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can remove slots");
    };

    switch (slots.get(id)) {
      case (null) { #err("Slot not found") };
      case (?slot) {
        if (slot.isBooked) {
          return #err("Cannot remove booked slot");
        };
        slots.remove(id);
        #ok(true);
      };
    };
  };

  public shared ({ caller }) func cancelBooking(id : Nat) : async Result<Bool, Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can cancel bookings");
    };

    switch (bookings.get(id)) {
      case (null) { #err("Booking not found") };
      case (?booking) {
        bookings.add(id, { booking with status = "cancelled" });

        switch (slots.get(booking.slotId)) {
          case (null) {};
          case (?slot) {
            slots.add(booking.slotId, { slot with isBooked = false });
          };
        };
        #ok(true);
      };
    };
  };

  public shared ({ caller }) func deleteBooking(id : Nat) : async Result<Bool, Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can delete bookings");
    };

    switch (bookings.get(id)) {
      case (null) { #err("Booking not found") };
      case (?_) {
        bookings.remove(id);
        #ok(true);
      };
    };
  };

  public shared ({ caller }) func setServiceFee(serviceName : Text, amount : Nat, currency : Text) : async Result<ServiceFee, Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can set service fees");
    };

    let fee : ServiceFee = { serviceName; amount; currency };
    serviceFees.add(serviceName, fee);
    #ok(fee);
  };

  public shared ({ caller }) func removeServiceFee(serviceName : Text) : async Result<Bool, Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can remove service fees");
    };

    switch (serviceFees.get(serviceName)) {
      case (null) { #err("Service fee not found") };
      case (?_) {
        serviceFees.remove(serviceName);
        #ok(true);
      };
    };
  };

  public shared ({ caller }) func createCoupon(code : Text, discountPercent : Nat, maxUsage : Nat) : async Result<Coupon, Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can create coupons");
    };

    let coupon : Coupon = { code; discountPercent; maxUsage; usageCount = 0; active = true };
    coupons.add(code, coupon);
    #ok(coupon);
  };

  public query ({ caller }) func listCoupons() : async Result<[Coupon], Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can list coupons");
    };

    let couponList = List.empty<Coupon>();
    for ((_, coupon) in coupons.entries()) {
      couponList.add(coupon);
    };
    #ok(couponList.toArray());
  };

  public shared ({ caller }) func toggleCouponStatus(code : Text, isActive : Bool) : async Result<Bool, Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can toggle coupons");
    };

    switch (coupons.get(code)) {
      case (null) { #err("Coupon not found") };
      case (?coupon) {
        coupons.add(code, { coupon with active = isActive });
        #ok(true);
      };
    };
  };

  public shared ({ caller }) func deleteCoupon(code : Text) : async Result<Bool, Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can delete coupons");
    };

    switch (coupons.get(code)) {
      case (null) { #err("Coupon not found") };
      case (?_) {
        coupons.remove(code);
        #ok(true);
      };
    };
  };

  public shared ({ caller }) func addRemedy(bookingId : Nat, clientName : Text, title : Text, content : Text) : async Result<Remedy, Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can add remedies");
    };

    let remedy : Remedy = {
      id = nextRemedyId;
      bookingId;
      clientName;
      title;
      content;
      createdAt = Time.now();
    };

    remedies.add(nextRemedyId, remedy);
    nextRemedyId += 1;
    #ok(remedy);
  };

  public query ({ caller }) func getRemediesForBooking(bookingId : Nat) : async Result<[Remedy], Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can access remedies");
    };

    let remedyList = List.empty<Remedy>();
    for ((_, remedy) in remedies.entries()) {
      if (remedy.bookingId == bookingId) {
        remedyList.add(remedy);
      };
    };
    #ok(remedyList.toArray());
  };

  public query ({ caller }) func getAllRemedies() : async Result<[Remedy], Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can access remedies");
    };

    let remedyList = List.empty<Remedy>();
    for ((_, remedy) in remedies.entries()) {
      remedyList.add(remedy);
    };
    #ok(remedyList.toArray());
  };

  public shared ({ caller }) func updateRemedy(id : Nat, title : Text, content : Text) : async Result<Remedy, Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can update remedies");
    };

    switch (remedies.get(id)) {
      case (null) { #err("Remedy not found") };
      case (?remedy) {
        let updatedRemedy = { remedy with title; content };
        remedies.add(id, updatedRemedy);
        #ok(updatedRemedy);
      };
    };
  };

  public shared ({ caller }) func deleteRemedy(id : Nat) : async Result<Bool, Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can delete remedies");
    };

    switch (remedies.get(id)) {
      case (null) { #err("Remedy not found") };
      case (?_) {
        remedies.remove(id);
        #ok(true);
      };
    };
  };

  public query ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public shared ({ caller }) func claimFirstAdmin() : async Bool {
    if (caller.isAnonymous()) { return false };

    if (firstAdminClaimed) {
      return false;
    };

    firstAdminClaimed := true;

    accessControlState.userRoles.add(caller, #admin);

    true;
  };

  public shared ({ caller = _ }) func forceClaimAdmin(_userSecret : Text) : async Bool { 
    false;
  };

  func sanitizeText(text : Text, maxLength : Nat) : Text {
    let sanitized = Text.fromIter(
      text.chars().map(
        func(c) {
          if ((c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or (c >= '0' and c <= '9') or c == '_' or c == '-') {
            c;
          } else { '_' };
        }
      )
    );
    let length = sanitized.size();
    if (length > maxLength) {
      Text.fromIter(sanitized.chars().take(maxLength));
    } else {
      sanitized;
    };
  };

  public shared ({ caller }) func generateReferralCode() : async Result<Text, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err("Unauthorized: Only users can generate referral codes");
    };

    if (caller.isAnonymous()) {
      return #err("Anonymous callers cannot generate referral codes");
    };

    switch (userReferralCode.get(caller)) {
      case (?existingCode) { #ok(existingCode) };
      case (null) {
        let principalText = caller.toText();
        let cleanPrincipal = sanitizeText(principalText, 20);
        let code = cleanPrincipal # "-" # nextReferralId.toText() # "-" # Time.now().toText();
        let referral : Referral = {
          owner = caller;
          code;
          coinsEarned = 0;
          timesUsed = 0;
          createdAt = Time.now();
        };
        referrals.add(code, referral);
        userReferralCode.add(caller, code);
        nextReferralId += 1;
        #ok(code);
      };
    };
  };

  public query ({ caller }) func getReferralCode() : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access referral codes");
    };
    userReferralCode.get(caller);
  };

  public query ({ caller }) func getCoinBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access coin balance");
    };
    switch (userCoinBalances.get(caller)) {
      case (?balance) { balance };
      case (null) { 0 };
    };
  };

  public shared ({ caller }) func applyReferralCode(code : Text) : async Result<Text, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err("Unauthorized: Only users can apply referral codes");
    };

    if (caller.isAnonymous()) {
      return #err("Anonymous callers cannot apply referral codes");
    };

    switch (userAppliedReferral.get(caller)) {
      case (?true) { return #err("You have already applied a referral code") };
      case (_) {};
    };

    switch (referrals.get(code)) {
      case (null) { return #err("Referral code not found") };
      case (?referral) {
        if (referral.owner == caller) {
          return #err("Cannot apply your own referral code");
        };

        switch (userCoinBalances.get(referral.owner)) {
          case (?balance) {
            let newBalance = balance + 50;
            userCoinBalances.add(referral.owner, newBalance);
          };
          case (null) {
            userCoinBalances.add(referral.owner, 50);
          };
        };

        switch (userCoinBalances.get(caller)) {
          case (?balance) {
            let newBalance = balance + 20;
            userCoinBalances.add(caller, newBalance);
          };
          case (null) {
            userCoinBalances.add(caller, 20);
          };
        };

        userAppliedReferral.add(caller, true);
        let updatedReferral = {
          referral with
          timesUsed = referral.timesUsed + 1;
          coinsEarned = referral.coinsEarned + 50;
        };
        referrals.add(code, updatedReferral);

        #ok("Successfully applied referral code. You have earned 20 coins");
      };
    };
  };

  public shared ({ caller }) func redeemCoins(userPrincipal : Principal, amount : Nat) : async Result<Nat, Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can redeem coins");
    };

    switch (userCoinBalances.get(userPrincipal)) {
      case (null) { return #err("User has no coins") };
      case (?currentBalance) {
        if (amount > currentBalance) {
          return #err("Insufficient coins");
        };
        let newBalance = currentBalance - amount;
        userCoinBalances.add(userPrincipal, newBalance);
        #ok(newBalance);
      };
    };
  };

  public query ({ caller }) func adminGetAllReferrals() : async Result<[Referral], Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can access referrals");
    };

    let referralList = List.empty<Referral>();
    for ((_, referral) in referrals.entries()) {
      referralList.add(referral);
    };
    #ok(referralList.toArray());
  };

  public query ({ caller }) func adminGetAllCoinBalances() : async Result<[(Principal, Nat)], Text> {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      return #err("Unauthorized: Only admins can access coin balances");
    };

    let balancesList = List.empty<(Principal, Nat)>();
    for ((principal, coins) in userCoinBalances.entries()) {
      balancesList.add((principal, coins));
    };
    #ok(balancesList.toArray());
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
