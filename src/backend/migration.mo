import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";

module {
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

  type Referral = {
    owner : Principal;
    code : Text;
    coinsEarned : Nat;
    timesUsed : Nat;
    createdAt : Int;
  };

  type OldUserProfile = { name : Text };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    slots : Map.Map<Nat, AvailableSlot>;
    bookings : Map.Map<Nat, Booking>;
    serviceFees : Map.Map<Text, ServiceFee>;
    coupons : Map.Map<Text, Coupon>;
    remedies : Map.Map<Nat, Remedy>;
    referrals : Map.Map<Text, Referral>;
    userCoinBalances : Map.Map<Principal, Nat>;
    userReferralCode : Map.Map<Principal, Text>;
    userAppliedReferral : Map.Map<Principal, Bool>;
    firstAdminClaimed : Bool;
    nextSlotId : Nat;
    nextBookingId : Nat;
    nextRemedyId : Nat;
    nextReferralId : Nat;
  };

  type NewUserProfile = { name : Text };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    slots : Map.Map<Nat, AvailableSlot>;
    bookings : Map.Map<Nat, Booking>;
    serviceFees : Map.Map<Text, ServiceFee>;
    coupons : Map.Map<Text, Coupon>;
    remedies : Map.Map<Nat, Remedy>;
    referrals : Map.Map<Text, Referral>;
    userCoinBalances : Map.Map<Principal, Nat>;
    userReferralCode : Map.Map<Principal, Text>;
    userAppliedReferral : Map.Map<Principal, Bool>;
    firstAdminClaimed : Bool;
    nextSlotId : Nat;
    nextBookingId : Nat;
    nextRemedyId : Nat;
    nextReferralId : Nat;
    stripeConfiguration : ?Stripe.StripeConfiguration;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      stripeConfiguration = null;
    };
  };
};
