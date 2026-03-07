import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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
  };

  type Result<T, E> = {
    #ok : T;
    #err : E;
  };

  let slots = Map.empty<Nat, AvailableSlot>();
  let bookings = Map.empty<Nat, Booking>();
  var nextSlotId = 1;
  var nextBookingId = 1;

  // Get available slots
  public query ({ caller = _ }) func getAvailableSlots() : async [AvailableSlot] {
    let availableList = List.empty<AvailableSlot>();
    for ((_, slot) in slots.entries()) {
      if (not slot.isBooked) {
        availableList.add(slot);
      };
    };
    availableList.toArray();
  };

  // Book appointment
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
    question : Text
  ) : async Result<Booking, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can book appointments");
    };

    switch (slots.get(slotId)) {
      case (null) { #err("Slot not found") };
      case (?slot) {
        if (slot.isBooked) {
          return #err("Slot already booked");
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
        };

        bookings.add(nextBookingId, booking);
        slots.add(slotId, { slot with isBooked = true });
        nextBookingId += 1;
        #ok(booking);
      };
    };
  };

  // Get all bookings (admin only)
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

  // Add new slot (admin only)
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

  // Remove slot (admin only)
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

  // Cancel booking (admin only)
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

  // Check if caller is admin
  public query ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };
};
