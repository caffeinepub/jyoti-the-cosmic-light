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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Loader2,
  Plus,
  Shield,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AvailableSlot, Booking } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddSlot,
  useAvailableSlots,
  useBookings,
  useCancelBooking,
  useIsAdmin,
  useRemoveSlot,
} from "../hooks/useQueries";

export function AdminPage() {
  const { identity, login, loginStatus, isInitializing } =
    useInternetIdentity();
  const { data: isAdminUser, isLoading: isAdminLoading } = useIsAdmin();

  // Not logged in
  if (isInitializing || isAdminLoading) {
    return <AdminLoading />;
  }

  if (!identity) {
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
  return (
    <div
      className="min-h-screen flex items-center justify-center pt-24 px-6"
      style={{ background: "oklch(0.09 0.025 260)" }}
      data-ocid="admin.error_state"
    >
      <div className="text-center max-w-sm w-full">
        <div className="w-16 h-16 border-2 border-destructive/40 rounded-sm flex items-center justify-center mx-auto mb-8">
          <XCircle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="font-display text-3xl text-cream mb-3">Access Denied</h1>
        <div className="gold-divider w-20 mx-auto mb-6" />
        <p className="font-body text-cream/60">
          This area is restricted to administrators only.
        </p>
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
          <TabsList className="bg-card border border-gold/20 rounded-sm mb-8 p-1 gap-1">
            <TabsTrigger
              value="availability"
              data-ocid="admin.availability.tab"
              className="data-[state=active]:bg-gold data-[state=active]:text-navy-deep font-body tracking-wider rounded-sm px-6 py-2 text-cream/60"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Availability
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              data-ocid="admin.bookings.tab"
              className="data-[state=active]:bg-gold data-[state=active]:text-navy-deep font-body tracking-wider rounded-sm px-6 py-2 text-cream/60"
            >
              <Users className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="availability">
            <AvailabilityTab />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

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
                              <AlertDialogCancel className="btn-gold-outline rounded-sm font-body">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
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
