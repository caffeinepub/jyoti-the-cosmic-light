import Int "mo:core/Int";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = { name : Text };
  type AvailableSlot = { id : Nat; date : Text; time : Text; isBooked : Bool };
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
  type ServiceFee = { serviceName : Text; amount : Nat; currency : Text };
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
  type Result<T, E> = { #ok : T; #err : E };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let slots = Map.empty<Nat, AvailableSlot>();
  let bookings = Map.empty<Nat, Booking>();
  let serviceFees = Map.empty<Text, ServiceFee>();
  let coupons = Map.empty<Text, Coupon>();
  let remedies = Map.empty<Nat, Remedy>();

  var nextSlotId = 1;
  var nextBookingId = 1;
  var nextRemedyId = 1;
  var adminAssigned = false : Bool;
  var firstAdminPrincipal : ?Principal = null;

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

  public query ({ caller = _ }) func getAvailableSlots() : async [AvailableSlot] {
    let availableList = List.empty<AvailableSlot>();
    for ((_, slot) in slots.entries()) {
      if (not slot.isBooked) {
        availableList.add(slot);
      };
    };
    availableList.toArray();
  };

  public query ({ caller = _ }) func getServiceFees() : async [ServiceFee] {
    let feeList = List.empty<ServiceFee>();
    for ((_, fee) in serviceFees.entries()) {
      feeList.add(fee);
    };
    feeList.toArray();
  };

  public query ({ caller = _ }) func validateCoupon(code : Text) : async Result<Coupon, Text> {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err("Unauthorized: Only users can book appointments");
    };

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
    if (adminAssigned) { return false };

    accessControlState.adminAssigned := true;
    adminAssigned := true;
    true;
  };

  public shared ({ caller }) func forceClaimAdmin(userSecret : Text) : async Bool {
    false;
  };

  private func isFirstAdmin(principal : Principal) : Bool {
    switch (firstAdminPrincipal) {
      case (?adminPrincipal) { principal == adminPrincipal };
      case (null) { false };
    };
  };
};
