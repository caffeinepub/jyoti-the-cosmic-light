import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AvailableSlot,
  Booking,
  Coupon,
  Referral,
  Remedy,
  ServiceFee,
} from "../backend.d";
import { useActor } from "./useActor";

export function useAvailableSlots() {
  const { actor } = useActor();
  return useQuery<AvailableSlot[]>({
    queryKey: ["availableSlots"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableSlots();
    },
    // getAvailableSlots is a public query — no auth needed, use actor as soon as it exists
    enabled: !!actor,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useAllSlots() {
  const { actor, isFetching } = useActor();
  return useQuery<AvailableSlot[]>({
    queryKey: ["allSlots"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllSlots();
      if (result.__kind__ === "ok") return result.ok;
      return [];
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: true,
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
      try {
        return await actor.isAdmin();
      } catch {
        // If the backend throws (e.g. unregistered caller), treat as non-admin
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: true,
    retry: 2,
  });
}

// ── Service Fees ───────────────────────────────────────────────────

export function useServiceFees() {
  const { actor, isFetching } = useActor();
  return useQuery<ServiceFee[]>({
    queryKey: ["serviceFees"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getServiceFees();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useSetServiceFee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      serviceName: string;
      amount: bigint;
      currency: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.setServiceFee(
        params.serviceName,
        params.amount,
        params.currency,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceFees"] });
    },
  });
}

export function useRemoveServiceFee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (serviceName: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.removeServiceFee(serviceName);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceFees"] });
    },
  });
}

// ── Coupons ───────────────────────────────────────────────────────

export function useListCoupons() {
  const { actor, isFetching } = useActor();
  return useQuery<Coupon[]>({
    queryKey: ["coupons"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.listCoupons();
      if (result.__kind__ === "ok") return result.ok;
      throw new Error(result.err);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useValidateCoupon() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.validateCoupon(code);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
  });
}

export function useCreateCoupon() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      code: string;
      discountPercent: bigint;
      maxUsage: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.createCoupon(
        params.code,
        params.discountPercent,
        params.maxUsage,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

export function useToggleCouponStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { code: string; isActive: boolean }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.toggleCouponStatus(
        params.code,
        params.isActive,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

export function useDeleteCoupon() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.deleteCoupon(code);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

// ── Remedies ──────────────────────────────────────────────────────

export function useAllRemedies() {
  const { actor, isFetching } = useActor();
  return useQuery<Remedy[]>({
    queryKey: ["remedies"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllRemedies();
      if (result.__kind__ === "ok") return result.ok;
      throw new Error(result.err);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRemediesForBooking(bookingId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Remedy[]>({
    queryKey: ["remedies", bookingId?.toString()],
    queryFn: async () => {
      if (!actor || bookingId === null) return [];
      const result = await actor.getRemediesForBooking(bookingId);
      if (result.__kind__ === "ok") return result.ok;
      throw new Error(result.err);
    },
    enabled: !!actor && !isFetching && bookingId !== null,
  });
}

export function useAddRemedy() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      bookingId: bigint;
      clientName: string;
      title: string;
      content: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.addRemedy(
        params.bookingId,
        params.clientName,
        params.title,
        params.content,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["remedies"] });
      queryClient.invalidateQueries({
        queryKey: ["remedies", variables.bookingId.toString()],
      });
    },
  });
}

export function useUpdateRemedy() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      title: string;
      content: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.updateRemedy(
        params.id,
        params.title,
        params.content,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["remedies"] });
    },
  });
}

export function useDeleteRemedy() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.deleteRemedy(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["remedies"] });
    },
  });
}

// ── Booking ───────────────────────────────────────────────────────

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
      couponCode?: string;
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
        params.couponCode ?? null,
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
      queryClient.invalidateQueries({ queryKey: ["allSlots"] });
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
      queryClient.invalidateQueries({ queryKey: ["allSlots"] });
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

export function useForceClaimAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const { getSecretParameter } = await import("../utils/urlParams");
      const adminToken = getSecretParameter("caffeineAdminToken") || "";
      const success = await actor.forceClaimAdmin(adminToken);
      if (!success)
        throw new Error(
          "Failed to claim admin — token mismatch or anonymous caller",
        );
      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["actor"] });
    },
  });
}

export function useClaimFirstAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      // Call the backend claimFirstAdmin — works only when no admin has been assigned yet
      const success = await actor.claimFirstAdmin();
      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

// ── Refer Coins ───────────────────────────────────────────────────

export function useGenerateReferralCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.generateReferralCode();
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referralCode"] });
      queryClient.invalidateQueries({ queryKey: ["coinBalance"] });
    },
  });
}

export function useGetReferralCode() {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["referralCode"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getReferralCode();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCoinBalance() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["coinBalance"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getCoinBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApplyReferralCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.applyReferralCode(code);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coinBalance"] });
    },
  });
}

export function useRedeemCoins() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userPrincipal: import("@icp-sdk/core/principal").Principal;
      amount: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.redeemCoins(
        params.userPrincipal,
        params.amount,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCoinBalances"] });
    },
  });
}

export function useAdminGetAllReferrals() {
  const { actor, isFetching } = useActor();
  return useQuery<Referral[]>({
    queryKey: ["adminReferrals"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.adminGetAllReferrals();
      if (result.__kind__ === "ok") return result.ok;
      throw new Error(result.err);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminGetAllCoinBalances() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[import("@icp-sdk/core/principal").Principal, bigint]>>(
    {
      queryKey: ["adminCoinBalances"],
      queryFn: async () => {
        if (!actor) return [];
        const result = await actor.adminGetAllCoinBalances();
        if (result.__kind__ === "ok") return result.ok;
        throw new Error(result.err);
      },
      enabled: !!actor && !isFetching,
    },
  );
}
