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
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Result_13 = {
    __kind__: "ok";
    ok: AvailableSlot;
} | {
    __kind__: "err";
    err: string;
};
export type Result_5 = {
    __kind__: "ok";
    ok: Array<Coupon>;
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
export type Result_4 = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: string;
};
export type Result_11 = {
    __kind__: "ok";
    ok: Array<Referral>;
} | {
    __kind__: "err";
    err: string;
};
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Referral {
    owner: Principal;
    code: string;
    createdAt: bigint;
    timesUsed: bigint;
    coinsEarned: bigint;
}
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
export type Result_7 = {
    __kind__: "ok";
    ok: Array<Booking>;
} | {
    __kind__: "err";
    err: string;
};
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface AvailableSlot {
    id: bigint;
    date: string;
    time: string;
    isBooked: boolean;
}
export type Result_6 = {
    __kind__: "ok";
    ok: Array<Remedy>;
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
export type Result_12 = {
    __kind__: "ok";
    ok: Array<[Principal, bigint]>;
} | {
    __kind__: "err";
    err: string;
};
export type Result_9 = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export interface ServiceFee {
    serviceName: string;
    currency: string;
    amount: bigint;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface Remedy {
    id: bigint;
    title: string;
    content: string;
    bookingId: bigint;
    clientName: string;
    createdAt: bigint;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export type Result_3 = {
    __kind__: "ok";
    ok: ServiceFee;
} | {
    __kind__: "err";
    err: string;
};
export type Result_10 = {
    __kind__: "ok";
    ok: Booking;
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
export type Result_8 = {
    __kind__: "ok";
    ok: Array<AvailableSlot>;
} | {
    __kind__: "err";
    err: string;
};
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
    addSlot(date: string, time: string): Promise<Result_13>;
    adminGetAllCoinBalances(): Promise<Result_12>;
    adminGetAllReferrals(): Promise<Result_11>;
    applyReferralCode(code: string): Promise<Result_9>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookAppointment(clientName: string, email: string, service: string, slotId: bigint, dob: string, tob: string, birthPlace: string, lat: number, lng: number, gender: string, question: string, couponCode: string | null): Promise<Result_10>;
    cancelBooking(id: bigint): Promise<Result_2>;
    claimFirstAdmin(): Promise<boolean>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createCoupon(code: string, discountPercent: bigint, maxUsage: bigint): Promise<Result>;
    deleteBooking(id: bigint): Promise<Result_2>;
    deleteCoupon(code: string): Promise<Result_2>;
    deleteRemedy(id: bigint): Promise<Result_2>;
    forceClaimAdmin(_userSecret: string): Promise<boolean>;
    generateReferralCode(): Promise<Result_9>;
    getAllRemedies(): Promise<Result_6>;
    getAllSlots(): Promise<Result_8>;
    getAvailableSlots(): Promise<Array<AvailableSlot>>;
    getBookings(): Promise<Result_7>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoinBalance(): Promise<bigint>;
    getReferralCode(): Promise<string | null>;
    getRemediesForBooking(bookingId: bigint): Promise<Result_6>;
    getServiceFees(): Promise<Array<ServiceFee>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listCoupons(): Promise<Result_5>;
    redeemCoins(userPrincipal: Principal, amount: bigint): Promise<Result_4>;
    removeServiceFee(serviceName: string): Promise<Result_2>;
    removeSlot(id: bigint): Promise<Result_2>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setServiceFee(serviceName: string, amount: bigint, currency: string): Promise<Result_3>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    toggleCouponStatus(code: string, isActive: boolean): Promise<Result_2>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateRemedy(id: bigint, title: string, content: string): Promise<Result_1>;
    validateCoupon(code: string): Promise<Result>;
}
