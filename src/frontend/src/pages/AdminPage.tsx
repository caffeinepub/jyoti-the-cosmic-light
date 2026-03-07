import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Check,
  Edit2,
  IndianRupee,
  Loader2,
  Plus,
  Shield,
  Sparkles,
  Tag,
  Ticket,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AvailableSlot, Booking, Coupon, Remedy } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddRemedy,
  useAddSlot,
  useAllRemedies,
  useAvailableSlots,
  useBookings,
  useCancelBooking,
  useClaimFirstAdmin,
  useCreateCoupon,
  useDeleteCoupon,
  useDeleteRemedy,
  useIsAdmin,
  useListCoupons,
  useRemoveServiceFee,
  useRemoveSlot,
  useServiceFees,
  useSetServiceFee,
  useToggleCouponStatus,
  useUpdateRemedy,
} from "../hooks/useQueries";

const ADMIN_TAB_CLS =
  "data-[state=active]:bg-gold data-[state=active]:text-navy-deep font-body tracking-wider rounded-sm px-4 py-2 text-cream/60 text-sm";

export function AdminPage() {
  const { identity, login, loginStatus, isInitializing } =
    useInternetIdentity();
  const { isFetching: isActorFetching } = useActor();
  const { data: isAdminUser, isLoading: isAdminLoading } = useIsAdmin();

  // Determine if identity is a genuine authenticated (non-anonymous) principal
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Show loading while initializing auth, building the actor, or checking admin status.
  // Also keep loading if we have an authenticated identity but the actor hasn't
  // finished refreshing yet — prevents a flash of the "Access Denied" screen while
  // the actor is transitioning from anonymous to authenticated.
  if (
    isInitializing ||
    isAdminLoading ||
    (isAuthenticated && isActorFetching)
  ) {
    return <AdminLoading />;
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} loginStatus={loginStatus} />;
  }

  if (!isAdminUser) {
    return <AdminUnauthorized />;
  }

  return <AdminDashboard />;
}

// ── Sub-components ──────────────────────────────────────────────────

function AdminLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "oklch(0.09 0.025 260)" }}
      data-ocid="admin.loading_state"
    >
      <Loader2 className="w-8 h-8 text-gold animate-spin" />
    </div>
  );
}

function AdminLogin({
  onLogin,
  loginStatus,
}: {
  onLogin: () => void;
  loginStatus: string;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center pt-24 px-6"
      style={{ background: "oklch(0.09 0.025 260)" }}
    >
      <div className="text-center max-w-sm w-full">
        <div className="w-16 h-16 border-2 border-gold/40 rounded-sm flex items-center justify-center mx-auto mb-8">
          <Shield className="w-8 h-8 text-gold" />
        </div>
        <h1 className="font-display text-3xl text-cream mb-3">Admin Access</h1>
        <div className="gold-divider w-20 mx-auto mb-6" />
        <p className="font-body text-cream/60 mb-8">
          Please sign in with your Internet Identity to access the admin panel.
        </p>
        <Button
          onClick={onLogin}
          disabled={loginStatus === "logging-in"}
          data-ocid="admin.login.primary_button"
          className="btn-gold w-full py-3 tracking-widest uppercase text-sm rounded-none"
        >
          {loginStatus === "logging-in" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Signing in…
            </>
          ) : (
            "Sign In with Internet Identity"
          )}
        </Button>
      </div>
    </div>
  );
}

function AdminUnauthorized() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const claimFirstAdmin = useClaimFirstAdmin();
  const [claimed, setClaimed] = useState(false);
  const [claimFailed, setClaimFailed] = useState(false);

  // Check if the current identity is genuinely authenticated (non-anonymous)
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const handleClaim = async () => {
    if (!isAuthenticated) return;
    setClaimFailed(false);
    try {
      await claimFirstAdmin.mutateAsync();
      setClaimed(true);
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setClaimFailed(true);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center pt-24 px-6"
      style={{ background: "oklch(0.09 0.025 260)" }}
      data-ocid="admin.error_state"
    >
      <div className="text-center max-w-sm w-full">
        {isAuthenticated ? (
          <>
            <div className="w-16 h-16 border-2 border-gold/40 rounded-sm flex items-center justify-center mx-auto mb-8">
              <Shield className="w-8 h-8 text-gold" />
            </div>
            <h1 className="font-display text-3xl text-cream mb-3">
              Claim Admin Access
            </h1>
            <div className="gold-divider w-20 mx-auto mb-6" />
            <p className="font-body text-cream/60 mb-8">
              You are signed in. Click below to become the admin of this site.
              This only works if no admin has been set yet.
            </p>
            {claimed ? (
              <p
                className="font-body text-gold text-sm"
                data-ocid="admin.claim.success_state"
              >
                Admin access claimed! Reloading…
              </p>
            ) : (
              <>
                <Button
                  onClick={handleClaim}
                  disabled={claimFirstAdmin.isPending}
                  data-ocid="admin.claim.primary_button"
                  className="btn-gold w-full py-3 tracking-widest uppercase text-sm rounded-none"
                >
                  {claimFirstAdmin.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Claiming…
                    </>
                  ) : (
                    "Set Me As Admin"
                  )}
                </Button>
                {claimFailed && (
                  <p
                    className="font-body text-destructive text-sm mt-4"
                    data-ocid="admin.claim.error_state"
                  >
                    Could not claim admin. An admin may already be assigned.
                    Please contact support.
                  </p>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div className="w-16 h-16 border-2 border-gold/40 rounded-sm flex items-center justify-center mx-auto mb-8">
              <Shield className="w-8 h-8 text-gold" />
            </div>
            <h1 className="font-display text-3xl text-cream mb-3">
              Sign In Required
            </h1>
            <div className="gold-divider w-20 mx-auto mb-6" />
            <p className="font-body text-cream/60 mb-8">
              Sign in with Internet Identity to access the admin panel.
            </p>
            <Button
              onClick={login}
              disabled={loginStatus === "logging-in"}
              data-ocid="admin.login.primary_button"
              className="btn-gold w-full py-3 tracking-widest uppercase text-sm rounded-none"
            >
              {loginStatus === "logging-in" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing in…
                </>
              ) : (
                "Sign In with Internet Identity"
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div
      className="min-h-screen pt-24 px-4 sm:px-6"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.09 0.025 260) 0%, oklch(0.12 0.04 268) 100%)",
      }}
    >
      <div className="container mx-auto max-w-6xl py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-gold" />
            <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-body">
              Admin Panel
            </span>
          </div>
          <h1 className="font-display text-4xl text-cream">दूjyoti Dashboard</h1>
          <div className="gold-divider w-24 mt-4" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="availability">
          <TabsList className="bg-card border border-gold/20 rounded-sm mb-8 p-1 gap-1 flex-wrap h-auto">
            <TabsTrigger
              value="availability"
              data-ocid="admin.availability.tab"
              className={ADMIN_TAB_CLS}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Availability
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              data-ocid="admin.bookings.tab"
              className={ADMIN_TAB_CLS}
            >
              <Users className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger
              value="fees"
              data-ocid="admin.fees.tab"
              className={ADMIN_TAB_CLS}
            >
              <IndianRupee className="w-4 h-4 mr-2" />
              Fees
            </TabsTrigger>
            <TabsTrigger
              value="coupons"
              data-ocid="admin.coupons.tab"
              className={ADMIN_TAB_CLS}
            >
              <Ticket className="w-4 h-4 mr-2" />
              Coupons
            </TabsTrigger>
            <TabsTrigger
              value="remedies"
              data-ocid="admin.remedies.tab"
              className={ADMIN_TAB_CLS}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Remedies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="availability">
            <AvailabilityTab />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsTab />
          </TabsContent>

          <TabsContent value="fees">
            <FeesTab />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponsTab />
          </TabsContent>

          <TabsContent value="remedies">
            <RemediesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ── Availability Tab ────────────────────────────────────────────

function AvailabilityTab() {
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const { data: slots, isLoading } = useAvailableSlots();
  const addSlot = useAddSlot();
  const removeSlot = useRemoveSlot();

  const handleAddSlot = async () => {
    if (!newDate || !newTime) return;
    try {
      await addSlot.mutateAsync({ date: newDate, time: newTime });
      setNewDate("");
      setNewTime("");
      toast.success("Slot added successfully.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add slot.");
    }
  };

  const handleRemoveSlot = async (slot: AvailableSlot) => {
    try {
      await removeSlot.mutateAsync(slot.id);
      toast.success("Slot removed.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to remove slot.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Add slot form */}
      <div className="card-cosmic rounded-sm p-6">
        <h2 className="font-display text-xl text-cream mb-6">
          Add Availability Slot
        </h2>
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 space-y-2">
            <Label
              className="text-cream/70 font-body text-sm tracking-wide"
              htmlFor="slotDate"
            >
              Date
            </Label>
            <Input
              id="slotDate"
              type="date"
              data-ocid="admin.slot.date.input"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="bg-card/60 border-gold/25 text-cream focus:border-gold rounded-sm font-body [color-scheme:dark]"
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label
              className="text-cream/70 font-body text-sm tracking-wide"
              htmlFor="slotTime"
            >
              Time
            </Label>
            <Input
              id="slotTime"
              type="time"
              data-ocid="admin.slot.time.input"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="bg-card/60 border-gold/25 text-cream focus:border-gold rounded-sm font-body [color-scheme:dark]"
            />
          </div>
          <Button
            data-ocid="admin.add_slot.button"
            onClick={handleAddSlot}
            disabled={!newDate || !newTime || addSlot.isPending}
            className="btn-gold px-6 py-2.5 tracking-widest uppercase text-sm rounded-none inline-flex items-center gap-2"
          >
            {addSlot.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Slot
          </Button>
        </div>
      </div>

      {/* Slots list */}
      <div className="card-cosmic rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gold/15">
          <h2 className="font-display text-xl text-cream">
            Available Slots
            {slots && (
              <span className="ml-3 text-sm text-gold/50 font-body">
                ({slots.filter((s) => !s.isBooked).length} available,{" "}
                {slots.filter((s) => s.isBooked).length} booked)
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div
            className="flex items-center justify-center py-12"
            data-ocid="admin.loading_state"
          >
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : !slots || slots.length === 0 ? (
          <div
            className="text-center py-16 text-cream/40 font-body"
            data-ocid="admin.empty_state"
          >
            No slots added yet. Add your first availability slot above.
          </div>
        ) : (
          <ScrollArea className="max-h-[420px]">
            <Table>
              <TableHeader>
                <TableRow className="border-gold/15 hover:bg-transparent">
                  <TableHead className="text-gold/60 font-body text-xs tracking-wider uppercase">
                    Date
                  </TableHead>
                  <TableHead className="text-gold/60 font-body text-xs tracking-wider uppercase">
                    Time
                  </TableHead>
                  <TableHead className="text-gold/60 font-body text-xs tracking-wider uppercase">
                    Status
                  </TableHead>
                  <TableHead className="text-gold/60 font-body text-xs tracking-wider uppercase text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot, idx) => (
                  <TableRow
                    key={slot.id.toString()}
                    data-ocid={`admin.slot.item.${idx + 1}`}
                    className="border-gold/10 hover:bg-gold/5"
                  >
                    <TableCell className="font-body text-cream/80">
                      {new Date(`${slot.date}T00:00:00`).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </TableCell>
                    <TableCell className="font-body text-cream/80">
                      {slot.time}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={slot.isBooked ? "secondary" : "default"}
                        className={
                          slot.isBooked
                            ? "bg-muted text-muted-foreground border-0 font-body text-xs"
                            : "bg-gold/15 text-gold border border-gold/30 font-body text-xs"
                        }
                      >
                        {slot.isBooked ? "Booked" : "Available"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!slot.isBooked && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              data-ocid={`admin.slot.delete_button.${idx + 1}`}
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-cream/40 hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-gold/25">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-display text-cream">
                                Remove this slot?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="font-body text-cream/60">
                                This will permanently remove the slot on{" "}
                                {slot.date} at {slot.time}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                data-ocid={`admin.slot.cancel_button.${idx + 1}`}
                                className="btn-gold-outline rounded-sm font-body"
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                data-ocid={`admin.slot.confirm_button.${idx + 1}`}
                                onClick={() => handleRemoveSlot(slot)}
                                className="bg-destructive text-destructive-foreground rounded-sm font-body"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

// ── Bookings Tab ─────────────────────────────────────────────────

function BookingsTab() {
  const { data: bookings, isLoading, isError } = useBookings();
  const cancelBooking = useCancelBooking();

  const handleCancel = async (booking: Booking) => {
    try {
      await cancelBooking.mutateAsync(booking.id);
      toast.success("Booking cancelled.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to cancel booking.");
    }
  };

  return (
    <div className="card-cosmic rounded-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gold/15 flex items-center justify-between">
        <h2 className="font-display text-xl text-cream">
          All Bookings
          {bookings && (
            <span className="ml-3 text-sm text-gold/50 font-body">
              ({bookings.length} total)
            </span>
          )}
        </h2>
        <div className="text-xs text-cream/40 font-body">
          Notification email: dujyoti.minnakshi@gmail.com
        </div>
      </div>

      {isLoading && (
        <div
          className="flex items-center justify-center py-12"
          data-ocid="admin.loading_state"
        >
          <Loader2 className="w-6 h-6 text-gold animate-spin" />
        </div>
      )}

      {isError && (
        <div
          className="text-center py-12 text-destructive font-body"
          data-ocid="admin.bookings.error_state"
        >
          Failed to load bookings. Please refresh.
        </div>
      )}

      {!isLoading && !isError && (!bookings || bookings.length === 0) && (
        <div
          className="text-center py-16 text-cream/40 font-body"
          data-ocid="admin.bookings.empty_state"
        >
          <div className="w-12 h-12 border border-gold/15 rounded-sm flex items-center justify-center mx-auto mb-4">
            <Users className="w-5 h-5 text-gold/30" />
          </div>
          No bookings yet.
        </div>
      )}

      {!isLoading && bookings && bookings.length > 0 && (
        <ScrollArea className="max-h-[600px]">
          <div data-ocid="admin.bookings.table">
            <Table>
              <TableHeader>
                <TableRow className="border-gold/15 hover:bg-transparent">
                  {[
                    "Client",
                    "Email",
                    "Service",
                    "Session",
                    "DOB",
                    "TOB",
                    "Birth Place",
                    "Lat",
                    "Lng",
                    "Gender",
                    "Question",
                    "Fee",
                    "Coupon",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="text-gold/60 font-body text-xs tracking-wider uppercase whitespace-nowrap"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking, idx) => (
                  <TableRow
                    key={booking.id.toString()}
                    data-ocid={`admin.booking.row.${idx + 1}`}
                    className="border-gold/10 hover:bg-gold/5 align-top"
                  >
                    <TableCell className="font-body text-cream/90 whitespace-nowrap font-medium">
                      {booking.clientName}
                    </TableCell>
                    <TableCell className="font-body text-cream/65 text-sm whitespace-nowrap">
                      {booking.email}
                    </TableCell>
                    <TableCell className="font-body text-cream/80 text-sm whitespace-nowrap max-w-[120px]">
                      <span className="line-clamp-2">{booking.service}</span>
                    </TableCell>
                    <TableCell className="font-body text-cream/70 text-sm whitespace-nowrap">
                      <div>{booking.slotDate}</div>
                      <div className="text-cream/45 text-xs">
                        {booking.slotTime}
                      </div>
                    </TableCell>
                    <TableCell className="font-body text-cream/70 text-sm whitespace-nowrap">
                      {booking.dob}
                    </TableCell>
                    <TableCell className="font-body text-cream/70 text-sm">
                      {booking.tob}
                    </TableCell>
                    <TableCell className="font-body text-cream/70 text-sm max-w-[100px]">
                      <span className="line-clamp-2">{booking.birthPlace}</span>
                    </TableCell>
                    <TableCell className="font-body text-cream/65 text-sm">
                      {booking.lat.toFixed(4)}
                    </TableCell>
                    <TableCell className="font-body text-cream/65 text-sm">
                      {booking.lng.toFixed(4)}
                    </TableCell>
                    <TableCell className="font-body text-cream/70 text-sm capitalize">
                      {booking.gender}
                    </TableCell>
                    <TableCell className="font-body text-cream/60 text-sm max-w-[140px]">
                      <span className="line-clamp-2 text-xs">
                        {booking.question || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="font-body text-gold text-sm whitespace-nowrap">
                      {booking.feeApplied > 0n
                        ? `₹${Number(booking.feeApplied).toLocaleString("en-IN")}`
                        : "—"}
                    </TableCell>
                    <TableCell className="font-body text-gold/70 text-sm whitespace-nowrap">
                      {booking.couponUsed || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          booking.status === "cancelled"
                            ? "bg-destructive/15 text-destructive border-0 font-body text-xs"
                            : "bg-gold/15 text-gold border border-gold/30 font-body text-xs"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {booking.status !== "cancelled" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              data-ocid={`admin.booking.cancel_button.${idx + 1}`}
                              variant="ghost"
                              size="sm"
                              className="text-cream/40 hover:text-destructive hover:bg-destructive/10 text-xs font-body rounded-sm"
                            >
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-gold/25">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-display text-cream">
                                Cancel this booking?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="font-body text-cream/60">
                                This will cancel {booking.clientName}'s booking
                                for {booking.slotDate} at {booking.slotTime}.
                                This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="btn-gold-outline rounded-sm font-body">
                                Keep Booking
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancel(booking)}
                                className="bg-destructive text-destructive-foreground rounded-sm font-body"
                              >
                                Cancel Booking
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ── Fees Tab ─────────────────────────────────────────────────────

const SERVICE_NAMES = [
  "Birth Chart Reading",
  "Life Guidance Session",
  "Psychological Astrology",
];

function FeesTab() {
  const { data: fees, isLoading } = useServiceFees();
  const setServiceFee = useSetServiceFee();
  const removeServiceFee = useRemoveServiceFee();

  const [feeService, setFeeService] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [feeCurrency, setFeeCurrency] = useState("INR");

  const handleSaveFee = async () => {
    if (!feeService || !feeAmount) return;
    const amount = Number.parseInt(feeAmount, 10);
    if (Number.isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    try {
      await setServiceFee.mutateAsync({
        serviceName: feeService,
        amount: BigInt(amount),
        currency: feeCurrency || "INR",
      });
      toast.success("Fee saved.");
      setFeeService("");
      setFeeAmount("");
      setFeeCurrency("INR");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save fee.");
    }
  };

  const handleDeleteFee = async (serviceName: string) => {
    try {
      await removeServiceFee.mutateAsync(serviceName);
      toast.success("Fee removed.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to remove fee.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Add/Update fee form */}
      <div className="card-cosmic rounded-sm p-6">
        <h2 className="font-display text-xl text-cream mb-6">
          Add / Update Service Fee
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label className="text-cream/70 font-body text-sm tracking-wide">
              Service
            </Label>
            <Select value={feeService} onValueChange={setFeeService}>
              <SelectTrigger
                data-ocid="admin.fee.service.select"
                className="bg-card/60 border-gold/25 text-cream font-body focus:border-gold rounded-sm"
              >
                <SelectValue placeholder="Select service…" />
              </SelectTrigger>
              <SelectContent className="bg-card border-gold/25 text-cream">
                {SERVICE_NAMES.map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                    className="font-body focus:bg-gold/15 focus:text-cream"
                  >
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label
              className="text-cream/70 font-body text-sm tracking-wide"
              htmlFor="feeAmount"
            >
              Amount
            </Label>
            <Input
              id="feeAmount"
              type="number"
              min="0"
              data-ocid="admin.fee.amount.input"
              placeholder="e.g. 1500"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              className="bg-card/60 border-gold/25 text-cream placeholder:text-cream/30 focus:border-gold rounded-sm font-body"
            />
          </div>
          <div className="space-y-2">
            <Label
              className="text-cream/70 font-body text-sm tracking-wide"
              htmlFor="feeCurrency"
            >
              Currency
            </Label>
            <Input
              id="feeCurrency"
              data-ocid="admin.fee.currency.input"
              placeholder="INR"
              value={feeCurrency}
              onChange={(e) => setFeeCurrency(e.target.value.toUpperCase())}
              className="bg-card/60 border-gold/25 text-cream placeholder:text-cream/30 focus:border-gold rounded-sm font-body uppercase"
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button
            data-ocid="admin.fee.save_button"
            onClick={handleSaveFee}
            disabled={!feeService || !feeAmount || setServiceFee.isPending}
            className="btn-gold px-6 py-2.5 tracking-widest uppercase text-sm rounded-none inline-flex items-center gap-2"
          >
            {setServiceFee.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <IndianRupee className="w-4 h-4" />
            )}
            Save Fee
          </Button>
        </div>
      </div>

      {/* Fees list */}
      <div className="card-cosmic rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gold/15">
          <h2 className="font-display text-xl text-cream">
            Current Service Fees
          </h2>
        </div>

        {isLoading ? (
          <div
            className="flex items-center justify-center py-12"
            data-ocid="admin.fees.loading_state"
          >
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : !fees || fees.length === 0 ? (
          <div
            className="text-center py-16 text-cream/40 font-body"
            data-ocid="admin.fees.empty_state"
          >
            <Tag className="w-10 h-10 text-gold/20 mx-auto mb-3" />
            No fees set yet. Add a fee above.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gold/15 hover:bg-transparent">
                <TableHead className="text-gold/60 font-body text-xs tracking-wider uppercase">
                  Service
                </TableHead>
                <TableHead className="text-gold/60 font-body text-xs tracking-wider uppercase">
                  Amount
                </TableHead>
                <TableHead className="text-gold/60 font-body text-xs tracking-wider uppercase">
                  Currency
                </TableHead>
                <TableHead className="text-gold/60 font-body text-xs tracking-wider uppercase text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee, idx) => (
                <TableRow
                  key={fee.serviceName}
                  data-ocid={`admin.fee.row.${idx + 1}`}
                  className="border-gold/10 hover:bg-gold/5"
                >
                  <TableCell className="font-body text-cream/90">
                    {fee.serviceName}
                  </TableCell>
                  <TableCell className="font-body text-gold font-medium">
                    {fee.currency === "INR" ? "₹" : fee.currency}
                    {Number(fee.amount).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="font-body text-cream/60 text-sm">
                    {fee.currency}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          data-ocid={`admin.fee.delete_button.${idx + 1}`}
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-cream/40 hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-gold/25">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-display text-cream">
                            Remove this fee?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="font-body text-cream/60">
                            This will remove the fee for "{fee.serviceName}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            data-ocid={`admin.fee.cancel_button.${idx + 1}`}
                            className="btn-gold-outline rounded-sm font-body"
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            data-ocid={`admin.fee.confirm_button.${idx + 1}`}
                            onClick={() => handleDeleteFee(fee.serviceName)}
                            className="bg-destructive text-destructive-foreground rounded-sm font-body"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

// ── Coupons Tab ──────────────────────────────────────────────────

function CouponsTab() {
  const { data: coupons, isLoading } = useListCoupons();
  const createCoupon = useCreateCoupon();
  const toggleCouponStatus = useToggleCouponStatus();
  const deleteCoupon = useDeleteCoupon();

  const [couponCode, setCouponCode] = useState("");
  const [discountPct, setDiscountPct] = useState("");
  const [maxUsage, setMaxUsage] = useState("");

  const handleCreateCoupon = async () => {
    if (!couponCode || !discountPct || !maxUsage) return;
    const pct = Number.parseInt(discountPct, 10);
    const max = Number.parseInt(maxUsage, 10);
    if (
      Number.isNaN(pct) ||
      pct < 0 ||
      pct > 100 ||
      Number.isNaN(max) ||
      max < 1
    ) {
      toast.error("Please enter valid discount (0–100) and max usage (≥1).");
      return;
    }
    try {
      await createCoupon.mutateAsync({
        code: couponCode.trim().toUpperCase(),
        discountPercent: BigInt(pct),
        maxUsage: BigInt(max),
      });
      toast.success("Coupon created.");
      setCouponCode("");
      setDiscountPct("");
      setMaxUsage("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create coupon.");
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    try {
      await toggleCouponStatus.mutateAsync({
        code: coupon.code,
        isActive: !coupon.active,
      });
      toast.success(`Coupon ${coupon.active ? "deactivated" : "activated"}.`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to toggle coupon.");
    }
  };

  const handleDelete = async (code: string) => {
    try {
      await deleteCoupon.mutateAsync(code);
      toast.success("Coupon deleted.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete coupon.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Create coupon form */}
      <div className="card-cosmic rounded-sm p-6">
        <h2 className="font-display text-xl text-cream mb-6">Create Coupon</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label
              className="text-cream/70 font-body text-sm tracking-wide"
              htmlFor="couponCode"
            >
              Coupon Code
            </Label>
            <Input
              id="couponCode"
              data-ocid="admin.coupon.code.input"
              placeholder="e.g. JYOTI20"
              value={couponCode}
              onChange={(e) =>
                setCouponCode(e.target.value.toUpperCase().replace(/\s/g, ""))
              }
              className="bg-card/60 border-gold/25 text-cream placeholder:text-cream/30 focus:border-gold rounded-sm font-body uppercase tracking-widest"
            />
          </div>
          <div className="space-y-2">
            <Label
              className="text-cream/70 font-body text-sm tracking-wide"
              htmlFor="discountPct"
            >
              Discount %
            </Label>
            <Input
              id="discountPct"
              type="number"
              min="0"
              max="100"
              data-ocid="admin.coupon.discount.input"
              placeholder="e.g. 20"
              value={discountPct}
              onChange={(e) => setDiscountPct(e.target.value)}
              className="bg-card/60 border-gold/25 text-cream placeholder:text-cream/30 focus:border-gold rounded-sm font-body"
            />
          </div>
          <div className="space-y-2">
            <Label
              className="text-cream/70 font-body text-sm tracking-wide"
              htmlFor="maxUsage"
            >
              Max Usage
            </Label>
            <Input
              id="maxUsage"
              type="number"
              min="1"
              data-ocid="admin.coupon.maxusage.input"
              placeholder="e.g. 50"
              value={maxUsage}
              onChange={(e) => setMaxUsage(e.target.value)}
              className="bg-card/60 border-gold/25 text-cream placeholder:text-cream/30 focus:border-gold rounded-sm font-body"
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button
            data-ocid="admin.coupon.create.primary_button"
            onClick={handleCreateCoupon}
            disabled={
              !couponCode || !discountPct || !maxUsage || createCoupon.isPending
            }
            className="btn-gold px-6 py-2.5 tracking-widest uppercase text-sm rounded-none inline-flex items-center gap-2"
          >
            {createCoupon.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Coupons list */}
      <div className="card-cosmic rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gold/15">
          <h2 className="font-display text-xl text-cream">
            All Coupons
            {coupons && (
              <span className="ml-3 text-sm text-gold/50 font-body">
                ({coupons.length} total)
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div
            className="flex items-center justify-center py-12"
            data-ocid="admin.coupons.loading_state"
          >
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : !coupons || coupons.length === 0 ? (
          <div
            className="text-center py-16 text-cream/40 font-body"
            data-ocid="admin.coupons.empty_state"
          >
            <Ticket className="w-10 h-10 text-gold/20 mx-auto mb-3" />
            No coupons yet. Create your first coupon above.
          </div>
        ) : (
          <ScrollArea className="max-h-[420px]">
            <Table>
              <TableHeader>
                <TableRow className="border-gold/15 hover:bg-transparent">
                  <TableHead className="text-gold/60 font-body text-xs tracking-wider uppercase">
                    Code
                  </TableHead>
                  <TableHead className="text-gold/60 font-body text-xs tracking-wider uppercase">
                    Discount
                  </TableHead>
                  <TableHead className="text-gold/60 font-body text-xs tracking-wider uppercase">
                    Usage
                  </TableHead>
                  <TableHead className="text-gold/60 font-body text-xs tracking-wider uppercase">
                    Status
                  </TableHead>
                  <TableHead className="text-gold/60 font-body text-xs tracking-wider uppercase text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon, idx) => (
                  <TableRow
                    key={coupon.code}
                    data-ocid={`admin.coupon.row.${idx + 1}`}
                    className="border-gold/10 hover:bg-gold/5"
                  >
                    <TableCell className="font-body text-cream/90 font-medium tracking-widest">
                      {coupon.code}
                    </TableCell>
                    <TableCell className="font-body text-gold font-medium">
                      {Number(coupon.discountPercent)}%
                    </TableCell>
                    <TableCell className="font-body text-cream/70 text-sm">
                      {Number(coupon.usageCount)} / {Number(coupon.maxUsage)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          coupon.active
                            ? "bg-gold/15 text-gold border border-gold/30 font-body text-xs"
                            : "bg-muted text-muted-foreground border-0 font-body text-xs"
                        }
                      >
                        {coupon.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          data-ocid={`admin.coupon.toggle.${idx + 1}`}
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggle(coupon)}
                          disabled={toggleCouponStatus.isPending}
                          className={`w-8 h-8 ${
                            coupon.active
                              ? "text-gold/60 hover:text-gold hover:bg-gold/10"
                              : "text-cream/40 hover:text-cream hover:bg-cream/10"
                          }`}
                          title={coupon.active ? "Deactivate" : "Activate"}
                        >
                          {coupon.active ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              data-ocid={`admin.coupon.delete_button.${idx + 1}`}
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-cream/40 hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-gold/25">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-display text-cream">
                                Delete coupon "{coupon.code}"?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="font-body text-cream/60">
                                This will permanently delete the coupon. This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                data-ocid={`admin.coupon.cancel_button.${idx + 1}`}
                                className="btn-gold-outline rounded-sm font-body"
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                data-ocid={`admin.coupon.confirm_button.${idx + 1}`}
                                onClick={() => handleDelete(coupon.code)}
                                className="bg-destructive text-destructive-foreground rounded-sm font-body"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

// ── Remedies Tab ─────────────────────────────────────────────────

function RemediesTab() {
  const { data: bookings } = useBookings();
  const { data: allRemedies, isLoading: remediesLoading } = useAllRemedies();
  const addRemedy = useAddRemedy();
  const updateRemedy = useUpdateRemedy();
  const deleteRemedy = useDeleteRemedy();

  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const selectedBooking = bookings?.find(
    (b) => b.id.toString() === selectedBookingId,
  );

  const remediesForBooking = selectedBookingId
    ? (allRemedies ?? []).filter(
        (r) => r.bookingId.toString() === selectedBookingId,
      )
    : [];

  const handleAddRemedy = async () => {
    if (!selectedBooking || !newTitle.trim() || !newContent.trim()) return;
    try {
      await addRemedy.mutateAsync({
        bookingId: selectedBooking.id,
        clientName: selectedBooking.clientName,
        title: newTitle.trim(),
        content: newContent.trim(),
      });
      toast.success("Remedy added.");
      setNewTitle("");
      setNewContent("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add remedy.");
    }
  };

  const handleStartEdit = (remedy: Remedy) => {
    setEditingId(remedy.id);
    setEditTitle(remedy.title);
    setEditContent(remedy.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      await updateRemedy.mutateAsync({
        id: editingId,
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      toast.success("Remedy updated.");
      setEditingId(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update remedy.");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteRemedy.mutateAsync(id);
      toast.success("Remedy deleted.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete remedy.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Booking selector */}
      <div className="card-cosmic rounded-sm p-6">
        <h2 className="font-display text-xl text-cream mb-6">
          Client Remedies
        </h2>
        <div className="space-y-2">
          <Label className="text-cream/70 font-body text-sm tracking-wide">
            Select Client / Booking
          </Label>
          <Select
            value={selectedBookingId}
            onValueChange={(v) => {
              setSelectedBookingId(v);
              setEditingId(null);
              setNewTitle("");
              setNewContent("");
            }}
          >
            <SelectTrigger
              data-ocid="admin.remedy.booking.select"
              className="bg-card/60 border-gold/25 text-cream font-body focus:border-gold rounded-sm"
            >
              <SelectValue placeholder="Choose a booking…" />
            </SelectTrigger>
            <SelectContent className="bg-card border-gold/25 text-cream max-h-60">
              {!bookings || bookings.length === 0 ? (
                <div className="px-4 py-3 text-cream/40 font-body text-sm">
                  No bookings found.
                </div>
              ) : (
                bookings.map((b) => (
                  <SelectItem
                    key={b.id.toString()}
                    value={b.id.toString()}
                    className="font-body focus:bg-gold/15 focus:text-cream"
                  >
                    #{b.id.toString()} — {b.clientName} ({b.service},{" "}
                    {b.slotDate})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Remedies list for selected booking */}
      {selectedBookingId && (
        <>
          <div className="card-cosmic rounded-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gold/15">
              <h2 className="font-display text-xl text-cream">
                Remedies for {selectedBooking?.clientName ?? "Selected Client"}
                {remediesForBooking.length > 0 && (
                  <span className="ml-3 text-sm text-gold/50 font-body">
                    ({remediesForBooking.length})
                  </span>
                )}
              </h2>
            </div>

            {remediesLoading ? (
              <div
                className="flex items-center justify-center py-12"
                data-ocid="admin.remedies.loading_state"
              >
                <Loader2 className="w-6 h-6 text-gold animate-spin" />
              </div>
            ) : remediesForBooking.length === 0 ? (
              <div
                className="text-center py-16 text-cream/40 font-body"
                data-ocid="admin.remedies.empty_state"
              >
                <Sparkles className="w-10 h-10 text-gold/20 mx-auto mb-3" />
                No remedies added for this client yet.
              </div>
            ) : (
              <div className="divide-y divide-gold/10">
                {remediesForBooking.map((remedy, idx) => (
                  <div
                    key={remedy.id.toString()}
                    data-ocid={`admin.remedy.item.${idx + 1}`}
                    className="p-6"
                  >
                    {editingId === remedy.id ? (
                      /* Edit mode */
                      <div className="space-y-4">
                        <Input
                          data-ocid="admin.remedy.edit.title.input"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-card/60 border-gold/25 text-cream focus:border-gold rounded-sm font-body"
                          placeholder="Remedy title"
                        />
                        <Textarea
                          data-ocid="admin.remedy.edit.content.textarea"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={4}
                          className="bg-card/60 border-gold/25 text-cream focus:border-gold rounded-sm font-body resize-none"
                          placeholder="Remedy content…"
                        />
                        <div className="flex gap-3">
                          <Button
                            data-ocid="admin.remedy.save_button"
                            onClick={handleSaveEdit}
                            disabled={
                              !editTitle.trim() ||
                              !editContent.trim() ||
                              updateRemedy.isPending
                            }
                            className="btn-gold px-5 py-2 tracking-widest uppercase text-sm rounded-none inline-flex items-center gap-2"
                          >
                            {updateRemedy.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Save
                          </Button>
                          <Button
                            data-ocid="admin.remedy.cancel_button"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            className="text-cream/50 hover:text-cream font-body"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* View mode */
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="font-display text-lg text-gold mb-1">
                              {remedy.title}
                            </h3>
                            <span className="text-cream/35 text-xs font-body">
                              Added{" "}
                              {new Date(
                                Number(remedy.createdAt) / 1_000_000,
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              data-ocid={`admin.remedy.edit_button.${idx + 1}`}
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStartEdit(remedy)}
                              className="w-8 h-8 text-cream/40 hover:text-gold hover:bg-gold/10"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  data-ocid={`admin.remedy.delete_button.${idx + 1}`}
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 text-cream/40 hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-gold/25">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-display text-cream">
                                    Delete this remedy?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="font-body text-cream/60">
                                    "{remedy.title}" will be permanently
                                    deleted.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    data-ocid={`admin.remedy.cancel_button.${idx + 1}`}
                                    className="btn-gold-outline rounded-sm font-body"
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    data-ocid={`admin.remedy.confirm_button.${idx + 1}`}
                                    onClick={() => handleDelete(remedy.id)}
                                    className="bg-destructive text-destructive-foreground rounded-sm font-body"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <p className="font-body text-cream/70 text-sm leading-relaxed whitespace-pre-wrap">
                          {remedy.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add remedy form */}
          <div className="card-cosmic rounded-sm p-6">
            <h2 className="font-display text-xl text-cream mb-6">
              Add New Remedy
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  className="text-cream/70 font-body text-sm tracking-wide"
                  htmlFor="remedyTitle"
                >
                  Title
                </Label>
                <Input
                  id="remedyTitle"
                  data-ocid="admin.remedy.title.input"
                  placeholder="e.g. Wear Ruby on Sunday"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-card/60 border-gold/25 text-cream placeholder:text-cream/30 focus:border-gold rounded-sm font-body"
                />
              </div>
              <div className="space-y-2">
                <Label
                  className="text-cream/70 font-body text-sm tracking-wide"
                  htmlFor="remedyContent"
                >
                  Description / Instructions
                </Label>
                <Textarea
                  id="remedyContent"
                  data-ocid="admin.remedy.content.textarea"
                  placeholder="Detailed remedy instructions…"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={5}
                  className="bg-card/60 border-gold/25 text-cream placeholder:text-cream/30 focus:border-gold rounded-sm font-body resize-none"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  data-ocid="admin.remedy.add.primary_button"
                  onClick={handleAddRemedy}
                  disabled={
                    !newTitle.trim() ||
                    !newContent.trim() ||
                    addRemedy.isPending
                  }
                  className="btn-gold px-6 py-2.5 tracking-widest uppercase text-sm rounded-none inline-flex items-center gap-2"
                >
                  {addRemedy.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add Remedy
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
