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
    ok: Booking;
} | {
    __kind__: "err";
    err: string;
};
export type Result = {
    __kind__: "ok";
    ok: boolean;
} | {
    __kind__: "err";
    err: string;
};
export type Result_3 = {
    __kind__: "ok";
    ok: AvailableSlot;
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
export interface Booking {
    id: bigint;
    dob: string;
    lat: number;
    lng: number;
    tob: string;
    service: string;
    status: string;
    question: string;
    clientName: string;
    createdAt: bigint;
    birthPlace: string;
    email: string;
    slotId: bigint;
    slotDate: string;
    gender: string;
    slotTime: string;
}
export type Result_1 = {
    __kind__: "ok";
    ok: Array<Booking>;
} | {
    __kind__: "err";
    err: string;
};
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSlot(date: string, time: string): Promise<Result_3>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookAppointment(clientName: string, email: string, service: string, slotId: bigint, dob: string, tob: string, birthPlace: string, lat: number, lng: number, gender: string, question: string): Promise<Result_2>;
    cancelBooking(id: bigint): Promise<Result>;
    getAvailableSlots(): Promise<Array<AvailableSlot>>;
    getBookings(): Promise<Result_1>;
    getCallerUserRole(): Promise<UserRole>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    removeSlot(id: bigint): Promise<Result>;
}
