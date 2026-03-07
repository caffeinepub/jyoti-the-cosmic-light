import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Result_2 = {
    __kind__: "ok";
    ok: boolean;
} | {
    __kind__: "err";
    err: string;
};
export interface AvailableSlot {
    id: bigint;
    date: string;
    time: string;
    isBooked: boolean;
}
export type Result_6 = {
    __kind__: "ok";
    ok: Array<Booking>;
} | {
    __kind__: "err";
    err: string;
};
export interface Coupon {
    active: boolean;
    code: string;
    usageCount: bigint;
    maxUsage: bigint;
    discountPercent: bigint;
}
export type Result_5 = {
    __kind__: "ok";
    ok: Array<Remedy>;
} | {
    __kind__: "err";
    err: string;
};
export type Result_1 = {
    __kind__: "ok";
    ok: Remedy;
} | {
    __kind__: "err";
    err: string;
};
export interface Remedy {
    id: bigint;
    title: string;
    content: string;
    bookingId: bigint;
    clientName: string;
    createdAt: bigint;
}
export interface ServiceFee {
    serviceName: string;
    currency: string;
    amount: bigint;
}
export type Result_4 = {
    __kind__: "ok";
    ok: Array<Coupon>;
} | {
    __kind__: "err";
    err: string;
};
export type Result = {
    __kind__: "ok";
    ok: Coupon;
} | {
    __kind__: "err";
    err: string;
};
export type Result_3 = {
    __kind__: "ok";
    ok: ServiceFee;
} | {
    __kind__: "err";
    err: string;
};
export type Result_8 = {
    __kind__: "ok";
    ok: AvailableSlot;
} | {
    __kind__: "err";
    err: string;
};
export type Result_7 = {
    __kind__: "ok";
    ok: Booking;
} | {
    __kind__: "err";
    err: string;
};
export interface Booking {
    id: bigint;
    dob: string;
    lat: number;
    lng: number;
    tob: string;
    service: string;
    status: string;
    couponUsed: string;
    question: string;
    clientName: string;
    createdAt: bigint;
    birthPlace: string;
    email: string;
    slotId: bigint;
    feeApplied: bigint;
    slotDate: string;
    gender: string;
    slotTime: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addRemedy(bookingId: bigint, clientName: string, title: string, content: string): Promise<Result_1>;
    addSlot(date: string, time: string): Promise<Result_8>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookAppointment(clientName: string, email: string, service: string, slotId: bigint, dob: string, tob: string, birthPlace: string, lat: number, lng: number, gender: string, question: string, couponCode: string | null): Promise<Result_7>;
    cancelBooking(id: bigint): Promise<Result_2>;
    claimFirstAdmin(): Promise<boolean>;
    createCoupon(code: string, discountPercent: bigint, maxUsage: bigint): Promise<Result>;
    deleteCoupon(code: string): Promise<Result_2>;
    deleteRemedy(id: bigint): Promise<Result_2>;
    forceClaimAdmin(userSecret: string): Promise<boolean>;
    getAllRemedies(): Promise<Result_5>;
    getAvailableSlots(): Promise<Array<AvailableSlot>>;
    getBookings(): Promise<Result_6>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRemediesForBooking(bookingId: bigint): Promise<Result_5>;
    getServiceFees(): Promise<Array<ServiceFee>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listCoupons(): Promise<Result_4>;
    removeServiceFee(serviceName: string): Promise<Result_2>;
    removeSlot(id: bigint): Promise<Result_2>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setServiceFee(serviceName: string, amount: bigint, currency: string): Promise<Result_3>;
    toggleCouponStatus(code: string, isActive: boolean): Promise<Result_2>;
    updateRemedy(id: bigint, title: string, content: string): Promise<Result_1>;
    validateCoupon(code: string): Promise<Result>;
}
