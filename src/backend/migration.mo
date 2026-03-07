import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import List "mo:core/List";

module {
  type UserProfile = { name : Text };
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

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    slots : Map.Map<Nat, AvailableSlot>;
    bookings : Map.Map<Nat, Booking>;
    serviceFees : Map.Map<Text, ServiceFee>;
    coupons : Map.Map<Text, Coupon>;
    remedies : Map.Map<Nat, Remedy>;
    nextSlotId : Nat;
    nextBookingId : Nat;
    nextRemedyId : Nat;
    adminAssigned : Bool;
    firstAdminPrincipal : ?Principal;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    slots : Map.Map<Nat, AvailableSlot>;
    bookings : Map.Map<Nat, Booking>;
    serviceFees : Map.Map<Text, ServiceFee>;
    coupons : Map.Map<Text, Coupon>;
    remedies : Map.Map<Nat, Remedy>;
    nextSlotId : Nat;
    nextBookingId : Nat;
    nextRemedyId : Nat;
    adminAssigned : Bool;
    firstAdminPrincipal : ?Principal;
  };

  public func run(old : OldActor) : NewActor {
    {
      userProfiles = old.userProfiles;
      slots = old.slots;
      bookings = old.bookings;
      serviceFees = old.serviceFees;
      coupons = old.coupons;
      remedies = old.remedies;
      nextSlotId = old.nextSlotId;
      nextBookingId = old.nextBookingId;
      nextRemedyId = old.nextRemedyId;
      adminAssigned = old.adminAssigned;
      firstAdminPrincipal = old.firstAdminPrincipal;
    };
  };
};
