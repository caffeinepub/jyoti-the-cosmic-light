import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AvailableSlot, Booking } from "../backend.d";
import { useActor } from "./useActor";

export function useAvailableSlots() {
  const { actor, isFetching } = useActor();
  return useQuery<AvailableSlot[]>({
    queryKey: ["availableSlots"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableSlots();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getBookings();
      if (result.__kind__ === "ok") return result.ok;
      throw new Error(result.err);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBookAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      clientName: string;
      email: string;
      service: string;
      slotId: bigint;
      dob: string;
      tob: string;
      birthPlace: string;
      lat: number;
      lng: number;
      gender: string;
      question: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.bookAppointment(
        params.clientName,
        params.email,
        params.service,
        params.slotId,
        params.dob,
        params.tob,
        params.birthPlace,
        params.lat,
        params.lng,
        params.gender,
        params.question,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useAddSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { date: string; time: string }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.addSlot(params.date, params.time);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
    },
  });
}

export function useRemoveSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.removeSlot(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
    },
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.cancelBooking(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
    },
  });
}
