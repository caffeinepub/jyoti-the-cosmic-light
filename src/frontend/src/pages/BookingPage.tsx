import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  Loader2,
  MapPin,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { AvailableSlot, Booking, Coupon } from "../backend.d";
import { ZodiacWheel } from "../components/ZodiacWheel";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useApplyReferralCode,
  useAvailableSlots,
  useBookAppointment,
  useGenerateReferralCode,
  useGetCoinBalance,
  useGetReferralCode,
  useServiceFees,
  useValidateCoupon,
} from "../hooks/useQueries";

const SERVICES = [
  {
    id: "birth-chart",
    name: "Birth Chart Reading",
    duration: "45–60 min",
    defaultPrice: "₹1,500",
    desc: "A comprehensive reading of your natal chart — personality, strengths, and life direction.",
  },
  {
    id: "life-guidance",
    name: "Life Guidance Session",
    duration: "45–60 min",
    defaultPrice: "₹2,000",
    desc: "Focused consultation on career, relationships, or major life decisions.",
  },
  {
    id: "psychological",
    name: "Psychological Astrology",
    duration: "45–60 min",
    defaultPrice: "₹2,500",
    desc: "Deep exploration of mind patterns and recurring behavioral tendencies.",
  },
];

const SERVICE_NAMES: Record<string, string> = {
  "birth-chart": "Birth Chart Reading",
  "life-guidance": "Life Guidance Session",
  psychological: "Psychological Astrology",
};

const STEPS = ["Service", "Date & Time", "Your Details"];

interface BookingForm {
  clientName: string;
  email: string;
  dob: string;
  tob: string;
  birthPlace: string;
  lat: string;
  lng: string;
  gender: string;
  question: string;
}

const EMPTY_FORM: BookingForm = {
  clientName: "",
  email: "",
  dob: "",
  tob: "",
  birthPlace: "",
  lat: "",
  lng: "",
  gender: "",
  question: "",
};

// ── Place Search Component ───────────────────────────────────────

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

function formatPlaceName(result: NominatimResult): string {
  const { address } = result;
  if (!address) return result.display_name;
  const parts: string[] = [];
  const city = address.city ?? address.town ?? address.village;
  if (city) parts.push(city);
  if (address.state) parts.push(address.state);
  if (address.country) parts.push(address.country);
  return parts.length > 0 ? parts.join(", ") : result.display_name;
}

function PlaceSearch({
  onSelect,
  value,
  onClear,
}: {
  onSelect: (place: string, lat: string, lng: string) => void;
  value: string;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [noResults, setNoResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Debounced fetch
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsOpen(false);
      setNoResults(false);
      return;
    }

    setNoResults(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
          {
            headers: {
              "User-Agent": "dujyoti-astrology/1.0",
              "Accept-Language": "en",
            },
          },
        );
        const data: NominatimResult[] = await res.json();
        setResults(data);
        setIsOpen(true);
        setActiveIndex(-1);
        setNoResults(data.length === 0);
      } catch {
        setResults([]);
        setNoResults(true);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (result: NominatimResult) => {
    const place = formatPlaceName(result);
    onSelect(place, result.lat, result.lon);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
    setNoResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && e.key !== "Escape") return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  if (value) {
    // Show selected state
    return (
      <div className="flex items-center gap-2 bg-card border border-gold/35 rounded-sm px-4 py-2.5">
        <MapPin className="w-4 h-4 text-gold/70 flex-shrink-0" />
        <span className="font-body text-cream/90 text-sm flex-1 truncate">
          {value}
        </span>
        <button
          type="button"
          onClick={onClear}
          data-ocid="booking.birthplace.delete_button"
          className="text-cream/40 hover:text-cream transition-colors p-0.5 flex-shrink-0"
          aria-label="Clear birth place"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50 pointer-events-none" />
        <Input
          ref={inputRef}
          data-ocid="booking.birthplace.search_input"
          placeholder="Type a city name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => setIsOpen(false), 200);
          }}
          autoComplete="off"
          className="bg-card border-gold/25 text-cream placeholder:text-cream/30 focus:border-gold rounded-sm font-body pl-9 pr-9"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/60 animate-spin" />
        )}
        {!isLoading && query && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
              setNoResults(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/30 hover:text-cream/70 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (results.length > 0 || noResults) && (
        <div
          ref={listRef as React.RefObject<HTMLDivElement>}
          aria-label="Place suggestions"
          className="absolute z-50 w-full mt-1 bg-card border border-gold/20 rounded-sm shadow-lg max-h-52 overflow-y-auto"
        >
          {noResults ? (
            <div className="px-4 py-3 font-body text-cream/40 text-sm italic">
              No places found
            </div>
          ) : (
            results.map((result, i) => (
              <button
                type="button"
                key={result.place_id}
                data-active={activeIndex === i ? "true" : undefined}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(result)}
                className={`w-full text-left px-4 py-2.5 font-body text-sm cursor-pointer transition-colors flex items-start gap-2.5 ${
                  activeIndex === i
                    ? "bg-gold/15 text-cream"
                    : "text-cream/80 hover:bg-gold/10 hover:text-cream"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-gold/50 flex-shrink-0 mt-0.5" />
                <span className="truncate">{formatPlaceName(result)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function BookingPage() {
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null,
  );

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");

  const { data: slots, isLoading: slotsLoading } = useAvailableSlots();
  const { data: serviceFees } = useServiceFees();
  const bookAppointment = useBookAppointment();
  const validateCoupon = useValidateCoupon();

  // Group available slots by date
  const slotsByDate = (slots ?? [])
    .filter((s) => !s.isBooked)
    .reduce<Record<string, AvailableSlot[]>>((acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(slot);
      return acc;
    }, {});

  const availableDates = Object.keys(slotsByDate).sort();
  const timeSlotsForDate = selectedDate
    ? (slotsByDate[selectedDate] ?? [])
    : [];

  const handleFormChange = (field: keyof BookingForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const getFeeForService = (serviceId: string) => {
    const serviceName = SERVICE_NAMES[serviceId];
    if (!serviceName || !serviceFees) return null;
    return serviceFees.find((f) => f.serviceName === serviceName) ?? null;
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError("");
    const code = couponInput.trim().toUpperCase();

    // Check 1-per-person restriction (stored in localStorage by admin when creating coupon)
    try {
      const perPersonCoupons: string[] = JSON.parse(
        localStorage.getItem("dujyoti_per_person_coupons") ?? "[]",
      );
      if (perPersonCoupons.includes(code)) {
        // Check if this email already used it (checked after email is filled)
        if (form.email.trim()) {
          const usedKey = `dujyoti_used_coupon_${code}_${form.email.trim().toLowerCase()}`;
          if (localStorage.getItem(usedKey)) {
            setCouponError(
              "This coupon code has already been used for this email address.",
            );
            setAppliedCoupon(null);
            return;
          }
        }
      }
    } catch {}

    try {
      const coupon = await validateCoupon.mutateAsync(code);
      setAppliedCoupon(coupon);
      toast.success(`${coupon.discountPercent}% discount applied!`);
    } catch (e: unknown) {
      setCouponError(e instanceof Error ? e.message : "Invalid coupon code.");
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const canProceedStep0 = !!selectedService;
  const canProceedStep1 = !!selectedSlot;
  const canSubmit =
    form.clientName.trim() &&
    form.email.trim() &&
    form.dob &&
    form.tob &&
    form.birthPlace.trim() &&
    form.lat.trim() &&
    form.lng.trim() &&
    form.gender;

  const handleSubmit = async () => {
    if (!selectedSlot || !selectedService) return;
    try {
      const booking = await bookAppointment.mutateAsync({
        clientName: form.clientName,
        email: form.email,
        service: SERVICE_NAMES[selectedService] ?? selectedService,
        slotId: selectedSlot.id,
        dob: form.dob,
        tob: form.tob,
        birthPlace: form.birthPlace,
        lat: Number.parseFloat(form.lat),
        lng: Number.parseFloat(form.lng),
        gender: form.gender,
        question: form.question,
        couponCode: appliedCoupon?.code,
      });

      // Mark 1-per-person coupon as used for this email
      if (appliedCoupon?.code && form.email.trim()) {
        try {
          const perPersonCoupons: string[] = JSON.parse(
            localStorage.getItem("dujyoti_per_person_coupons") ?? "[]",
          );
          if (perPersonCoupons.includes(appliedCoupon.code)) {
            const usedKey = `dujyoti_used_coupon_${appliedCoupon.code}_${form.email.trim().toLowerCase()}`;
            localStorage.setItem(usedKey, "1");
          }
        } catch {}
      }

      setConfirmedBooking(booking);
      toast.success("Booking confirmed!");
    } catch (e: unknown) {
      toast.error(
        e instanceof Error ? e.message : "Booking failed. Please try again.",
      );
    }
  };

  // ── Confirmation Screen ──────────────────────────────────────────
  if (confirmedBooking) {
    return (
      <ConfirmationScreen
        booking={confirmedBooking}
        onReset={() => {
          setConfirmedBooking(null);
          setStep(0);
          setSelectedService("");
          setSelectedDate("");
          setSelectedSlot(null);
          setForm(EMPTY_FORM);
          setAppliedCoupon(null);
          setCouponInput("");
          setCouponError("");
        }}
      />
    );
  }

  const serviceLabel =
    SERVICES.find((s) => s.id === selectedService)?.name ?? "";

  return (
    <div
      className="min-h-screen relative overflow-hidden pt-24"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.09 0.025 260) 0%, oklch(0.12 0.04 268) 100%)",
      }}
    >
      {/* Zodiac background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <ZodiacWheel className="w-[min(90vw,800px)] text-gold opacity-5" />
      </div>

      <div className="relative z-10 container mx-auto max-w-2xl px-6 py-16">
        {/* Page header */}
        <div className="text-center mb-12">
          <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-body block mb-4">
            Consultation
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-cream mb-4">
            Book a Reading
          </h1>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="font-body text-cream/60 text-lg">
            Each consultation is a sacred space of reflection and understanding.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-12">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-sm flex items-center justify-center text-sm font-display transition-all duration-300 ${
                    i < step
                      ? "bg-gold text-navy-deep"
                      : i === step
                        ? "border-2 border-gold text-gold"
                        : "border border-gold/25 text-gold/30"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  className={`text-xs font-body tracking-wider transition-colors ${
                    i === step ? "text-gold" : "text-cream/35"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-16 h-px mx-2 mb-6 transition-all duration-300 ${
                    i < step ? "bg-gold/60" : "bg-gold/15"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 0: Choose Service ─── */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-cream mb-6">
              Choose Your Consultation
            </h2>
            {SERVICES.map((service) => {
              const fee = getFeeForService(service.id);
              return (
                <button
                  type="button"
                  key={service.id}
                  data-ocid="booking.service.select"
                  onClick={() => setSelectedService(service.id)}
                  className={`w-full text-left p-6 border transition-all duration-300 rounded-sm group ${
                    selectedService === service.id
                      ? "border-gold bg-gold/8 shadow-gold-sm"
                      : "border-gold/20 hover:border-gold/45 card-cosmic"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-display text-xl text-cream group-hover:text-gold transition-colors">
                          {service.name}
                        </h3>
                        <span className="text-gold/50 text-xs font-body tracking-wider border border-gold/20 px-2 py-0.5 rounded-sm">
                          {service.duration}
                        </span>
                        {fee ? (
                          <span className="text-gold text-sm font-body font-medium border border-gold/30 bg-gold/10 px-2.5 py-0.5 rounded-sm">
                            {fee.currency === "INR" ? "₹" : fee.currency}
                            {Number(fee.amount).toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-gold text-sm font-body font-medium border border-gold/30 bg-gold/10 px-2.5 py-0.5 rounded-sm">
                            {service.defaultPrice}
                          </span>
                        )}
                      </div>
                      <p className="font-body text-cream/65 text-base">
                        {service.desc}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-sm border-2 flex-shrink-0 mt-1 transition-all ${
                        selectedService === service.id
                          ? "border-gold bg-gold"
                          : "border-gold/30"
                      }`}
                    />
                  </div>
                </button>
              );
            })}

            <div className="pt-4 flex justify-end">
              <Button
                onClick={() => setStep(1)}
                disabled={!canProceedStep0}
                data-ocid="booking.service.primary_button"
                className="btn-gold px-8 py-3 tracking-widest uppercase text-sm rounded-none inline-flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 1: Date & Time ─── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-gold/50 text-sm font-body">
                {serviceLabel}
              </div>
            </div>
            <h2 className="font-display text-2xl text-cream">
              Choose a Date & Time
            </h2>
            <p className="font-body text-cream/45 text-sm -mt-2">
              Available: Mon–Fri · 8:00 pm – 10:00 pm &nbsp;|&nbsp; Sat–Sun ·
              10:00 am – 10:00 pm
            </p>

            {slotsLoading ? (
              <div
                className="flex items-center justify-center py-16"
                data-ocid="booking.loading_state"
              >
                <Loader2 className="w-8 h-8 text-gold animate-spin" />
                <span className="ml-3 text-cream/60 font-body">
                  Loading available slots…
                </span>
              </div>
            ) : availableDates.length === 0 ? (
              <div
                className="text-center py-16 border border-gold/15 rounded-sm"
                data-ocid="booking.error_state"
              >
                <div className="w-12 h-12 border border-gold/25 rounded-sm flex items-center justify-center mx-auto mb-4">
                  <span className="text-gold text-xl">☽</span>
                </div>
                <p className="font-body text-cream/60 text-lg mb-2">
                  No slots are currently available.
                </p>
                <p className="font-body text-cream/40 text-sm">
                  Please check back soon, or write to us directly at{" "}
                  <a
                    href="mailto:dujyoti.minnakshi@gmail.com"
                    className="text-gold underline"
                  >
                    dujyoti.minnakshi@gmail.com
                  </a>
                </p>
              </div>
            ) : (
              <>
                {/* Date select */}
                <div>
                  <Label className="text-cream/70 font-body mb-2 block text-sm tracking-wider uppercase">
                    Select Date
                  </Label>
                  <Select
                    value={selectedDate}
                    onValueChange={(v) => {
                      setSelectedDate(v);
                      setSelectedSlot(null);
                    }}
                  >
                    <SelectTrigger
                      data-ocid="booking.date.select"
                      className="bg-card border-gold/25 text-cream font-body focus:border-gold rounded-sm"
                    >
                      <SelectValue placeholder="Choose a date…" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-gold/25 text-cream">
                      {availableDates.map((date) => (
                        <SelectItem
                          key={date}
                          value={date}
                          className="font-body focus:bg-gold/15 focus:text-cream"
                        >
                          {new Date(`${date}T00:00:00`).toLocaleDateString(
                            "en-IN",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time slots */}
                {selectedDate && (
                  <div>
                    <Label className="text-cream/70 font-body mb-3 block text-sm tracking-wider uppercase">
                      Available Times
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {timeSlotsForDate.map((slot, idx) => (
                        <button
                          type="button"
                          key={slot.id.toString()}
                          data-ocid={`booking.slot.item.${idx + 1}`}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 px-4 text-sm font-body border rounded-sm transition-all duration-200 ${
                            selectedSlot?.id === slot.id
                              ? "bg-gold text-navy-deep border-gold font-medium"
                              : "border-gold/25 text-cream/70 hover:border-gold/50 hover:text-cream"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="pt-4 flex justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(0)}
                data-ocid="booking.back.button"
                className="text-cream/50 hover:text-cream font-body"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                data-ocid="booking.date.primary_button"
                className="btn-gold px-8 py-3 tracking-widest uppercase text-sm rounded-none inline-flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Details ─── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-gold/50 text-sm font-body">
                {serviceLabel} · {selectedSlot?.date} at {selectedSlot?.time}
              </div>
            </div>
            <h2 className="font-display text-2xl text-cream mb-6">
              Your Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label
                  className="text-cream/70 font-body text-sm tracking-wide"
                  htmlFor="clientName"
                >
                  Full Name *
                </Label>
                <Input
                  id="clientName"
                  data-ocid="booking.name.input"
                  placeholder="Your full name"
                  value={form.clientName}
                  onChange={(e) =>
                    handleFormChange("clientName", e.target.value)
                  }
                  className="bg-card border-gold/25 text-cream placeholder:text-cream/30 focus:border-gold rounded-sm font-body"
                />
              </div>

              <div className="space-y-2">
                <Label
                  className="text-cream/70 font-body text-sm tracking-wide"
                  htmlFor="email"
                >
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  data-ocid="booking.email.input"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  className="bg-card border-gold/25 text-cream placeholder:text-cream/30 focus:border-gold rounded-sm font-body"
                />
              </div>

              <div className="space-y-2">
                <Label
                  className="text-cream/70 font-body text-sm tracking-wide"
                  htmlFor="dob"
                >
                  Date of Birth *
                </Label>
                <Input
                  id="dob"
                  type="date"
                  data-ocid="booking.dob.input"
                  value={form.dob}
                  onChange={(e) => handleFormChange("dob", e.target.value)}
                  className="bg-card border-gold/25 text-cream focus:border-gold rounded-sm font-body [color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <Label
                  className="text-cream/70 font-body text-sm tracking-wide"
                  htmlFor="tob"
                >
                  Time of Birth *
                </Label>
                <Input
                  id="tob"
                  type="time"
                  data-ocid="booking.tob.input"
                  value={form.tob}
                  onChange={(e) => handleFormChange("tob", e.target.value)}
                  className="bg-card border-gold/25 text-cream focus:border-gold rounded-sm font-body [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-cream/70 font-body text-sm tracking-wide">
                Birth Place *
              </Label>
              <PlaceSearch
                value={form.birthPlace}
                onSelect={(place, lat, lng) => {
                  handleFormChange("birthPlace", place);
                  handleFormChange("lat", lat);
                  handleFormChange("lng", lng);
                }}
                onClear={() => {
                  handleFormChange("birthPlace", "");
                  handleFormChange("lat", "");
                  handleFormChange("lng", "");
                }}
              />
              <p className="text-cream/35 font-body text-xs">
                Select your birth city from the suggestions — coordinates are
                filled automatically.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                className="text-cream/70 font-body text-sm tracking-wide"
                htmlFor="gender"
              >
                Gender *
              </Label>
              <Select
                value={form.gender}
                onValueChange={(v) => handleFormChange("gender", v)}
              >
                <SelectTrigger
                  data-ocid="booking.gender.select"
                  className="bg-card border-gold/25 text-cream font-body focus:border-gold rounded-sm"
                >
                  <SelectValue placeholder="Select gender…" />
                </SelectTrigger>
                <SelectContent className="bg-card border-gold/25 text-cream">
                  <SelectItem
                    value="female"
                    className="font-body focus:bg-gold/15 focus:text-cream"
                  >
                    Female
                  </SelectItem>
                  <SelectItem
                    value="male"
                    className="font-body focus:bg-gold/15 focus:text-cream"
                  >
                    Male
                  </SelectItem>
                  <SelectItem
                    value="other"
                    className="font-body focus:bg-gold/15 focus:text-cream"
                  >
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                className="text-cream/70 font-body text-sm tracking-wide"
                htmlFor="question"
              >
                Your Question or Intention
                <span className="text-cream/35 ml-2 text-xs">(optional)</span>
              </Label>
              <Textarea
                id="question"
                data-ocid="booking.question.textarea"
                placeholder="What brings you here? What would you like clarity on…"
                value={form.question}
                onChange={(e) => handleFormChange("question", e.target.value)}
                rows={4}
                className="bg-card border-gold/25 text-cream placeholder:text-cream/30 focus:border-gold rounded-sm font-body resize-none"
              />
            </div>

            {/* ── Coupon Code ─── */}
            <div className="space-y-3">
              <Label className="text-cream/70 font-body text-sm tracking-wide">
                Coupon Code
                <span className="text-cream/35 ml-2 text-xs">(optional)</span>
              </Label>

              {appliedCoupon ? (
                <div
                  className="flex items-center gap-3 p-3 border border-gold/40 bg-gold/8 rounded-sm"
                  data-ocid="booking.coupon.success_state"
                >
                  <Tag className="w-4 h-4 text-gold flex-shrink-0" />
                  <span className="font-body text-gold text-sm flex-1">
                    <span className="font-medium">{appliedCoupon.code}</span>
                    {" — "}
                    {Number(appliedCoupon.discountPercent)}% discount applied
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    data-ocid="booking.coupon.delete_button"
                    className="text-cream/40 hover:text-cream transition-colors p-1"
                    aria-label="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Input
                    data-ocid="booking.coupon.input"
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApplyCoupon();
                    }}
                    className="bg-card border-gold/25 text-cream placeholder:text-cream/30 focus:border-gold rounded-sm font-body uppercase tracking-widest"
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponInput.trim() || validateCoupon.isPending}
                    data-ocid="booking.coupon.primary_button"
                    className="btn-gold px-5 rounded-none tracking-wider uppercase text-sm whitespace-nowrap"
                  >
                    {validateCoupon.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>
              )}

              {couponError && (
                <p
                  className="text-destructive text-sm font-body"
                  data-ocid="booking.coupon.error_state"
                >
                  {couponError}
                </p>
              )}
            </div>

            {/* Fee summary */}
            {selectedService && (
              <FeeSummary
                serviceId={selectedService}
                appliedCoupon={appliedCoupon}
                serviceFees={serviceFees ?? []}
              />
            )}

            {/* Refer a Friend */}
            <ReferFriendSection />

            <div className="pt-2 flex justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                data-ocid="booking.details.back.button"
                className="text-cream/50 hover:text-cream font-body"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || bookAppointment.isPending}
                data-ocid="booking.submit_button"
                className="btn-gold px-8 py-3 tracking-widest uppercase text-sm rounded-none inline-flex items-center gap-2"
              >
                {bookAppointment.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Confirming…
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Fee Summary Component ────────────────────────────────────────

const DEFAULT_FEES: Record<string, number> = {
  "birth-chart": 1500,
  "life-guidance": 2000,
  psychological: 2500,
};

function FeeSummary({
  serviceId,
  appliedCoupon,
  serviceFees,
}: {
  serviceId: string;
  appliedCoupon: Coupon | null;
  serviceFees: import("../backend.d").ServiceFee[];
}) {
  const serviceName = SERVICE_NAMES[serviceId];
  const fee = serviceFees.find((f) => f.serviceName === serviceName);

  const originalAmount = fee
    ? Number(fee.amount)
    : (DEFAULT_FEES[serviceId] ?? 0);
  const symbol = fee ? (fee.currency === "INR" ? "₹" : fee.currency) : "₹";
  const discount = appliedCoupon ? Number(appliedCoupon.discountPercent) : 0;
  const discountedAmount = Math.round(originalAmount * (1 - discount / 100));

  return (
    <div className="p-4 border border-gold/20 rounded-sm bg-gold/5 space-y-2">
      <h3 className="font-body text-cream/70 text-xs tracking-wider uppercase mb-3">
        Fee Summary
      </h3>
      <div className="flex justify-between font-body text-sm">
        <span className="text-cream/60">Consultation Fee</span>
        <span className="text-cream/90">
          {symbol}
          {originalAmount.toLocaleString("en-IN")}
        </span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between font-body text-sm">
          <span className="text-gold/70">Discount ({discount}%)</span>
          <span className="text-gold">
            −{symbol}
            {(originalAmount - discountedAmount).toLocaleString("en-IN")}
          </span>
        </div>
      )}
      <div className="border-t border-gold/15 pt-2 flex justify-between font-body">
        <span className="text-cream/80 text-sm font-medium">Total</span>
        <span className="text-gold font-medium">
          {symbol}
          {discountedAmount.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}

// ── Refer a Friend Section ───────────────────────────────────────

function ReferFriendSection() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const [expanded, setExpanded] = useState(false);
  const [referInput, setReferInput] = useState("");
  const [referSuccess, setReferSuccess] = useState("");
  const [referError, setReferError] = useState("");

  const { data: referralCode, isLoading: codeLoading } = useGetReferralCode();
  const { data: coinBalance } = useGetCoinBalance();
  const generateCode = useGenerateReferralCode();
  const applyCode = useApplyReferralCode();

  if (!isAuthenticated) return null;

  const handleGenerate = async () => {
    try {
      await generateCode.mutateAsync();
      toast.success("Referral code generated!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to generate code.");
    }
  };

  const handleApply = async () => {
    if (!referInput.trim()) return;
    setReferError("");
    setReferSuccess("");
    try {
      await applyCode.mutateAsync(referInput.trim().toUpperCase());
      setReferSuccess("Code applied! 20 coins added to your balance.");
      setReferInput("");
      toast.success("Referral code applied — 20 coins earned!");
    } catch (e: unknown) {
      setReferError(e instanceof Error ? e.message : "Invalid referral code.");
    }
  };

  const handleCopy = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast.success("Referral code copied!");
    }
  };

  return (
    <div className="border border-gold/20 rounded-sm overflow-hidden mt-6">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        data-ocid="booking.refer.toggle"
        className="w-full flex items-center justify-between px-5 py-4 bg-gold/5 hover:bg-gold/10 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-gold flex-shrink-0" />
          <span className="font-body text-cream/80 text-sm tracking-wide">
            Refer a Friend · Earn Coins
          </span>
          {coinBalance !== undefined && coinBalance > 0n && (
            <span className="text-gold text-xs font-body border border-gold/30 bg-gold/10 px-2 py-0.5 rounded-sm">
              {Number(coinBalance)} ✦ coins
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gold/50" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gold/50" />
        )}
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-5 py-5 space-y-6 bg-card/30">
          {/* How it works */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            {[
              {
                icon: "✦",
                title: "Share Your Code",
                desc: "Earn 50 coins per friend who books",
              },
              {
                icon: "✧",
                title: "Apply a Code",
                desc: "Get 20 coins when you enter a friend's code",
              },
              {
                icon: "◈",
                title: "Redeem Coins",
                desc: "Coins unlock discounts on future sessions",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="p-3 border border-gold/15 rounded-sm bg-gold/3 space-y-1"
              >
                <div className="text-gold text-lg">{icon}</div>
                <p className="font-body text-cream/80 text-xs font-medium tracking-wide">
                  {title}
                </p>
                <p className="font-body text-cream/45 text-xs">{desc}</p>
              </div>
            ))}
          </div>

          {/* Your referral code */}
          <div className="space-y-2">
            <Label className="text-cream/70 font-body text-xs tracking-wider uppercase">
              Your Referral Code
            </Label>
            {codeLoading ? (
              <div
                className="flex items-center gap-2 text-cream/40 font-body text-sm"
                data-ocid="booking.refer.loading_state"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading…
              </div>
            ) : referralCode ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gold/8 border border-gold/30 rounded-sm px-4 py-2.5 font-body text-gold font-medium tracking-[0.2em] text-sm">
                  {referralCode}
                </div>
                <Button
                  type="button"
                  onClick={handleCopy}
                  data-ocid="booking.refer.code.button"
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 text-gold/60 hover:text-gold hover:bg-gold/10 border border-gold/20 rounded-sm"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={generateCode.isPending}
                data-ocid="booking.refer.generate.button"
                className="btn-gold px-5 py-2 tracking-widest uppercase text-xs rounded-none inline-flex items-center gap-2"
              >
                {generateCode.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                Generate My Code
              </Button>
            )}
          </div>

          {/* Apply referral code */}
          <div className="space-y-2">
            <Label className="text-cream/70 font-body text-xs tracking-wider uppercase">
              Apply a Friend's Code
            </Label>
            <div className="flex gap-2">
              <Input
                data-ocid="booking.refer.apply.input"
                placeholder="Enter referral code"
                value={referInput}
                onChange={(e) => {
                  setReferInput(
                    e.target.value.toUpperCase().replace(/\s/g, ""),
                  );
                  setReferError("");
                  setReferSuccess("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApply();
                }}
                className="bg-card/60 border-gold/25 text-cream placeholder:text-cream/30 focus:border-gold rounded-sm font-body tracking-widest text-sm uppercase"
              />
              <Button
                type="button"
                onClick={handleApply}
                disabled={!referInput.trim() || applyCode.isPending}
                data-ocid="booking.refer.apply.button"
                className="btn-gold px-4 rounded-none tracking-wider uppercase text-xs whitespace-nowrap"
              >
                {applyCode.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
            {referSuccess && (
              <p
                className="font-body text-gold text-xs"
                data-ocid="booking.refer.success_state"
              >
                {referSuccess}
              </p>
            )}
            {referError && (
              <p
                className="font-body text-destructive text-xs"
                data-ocid="booking.refer.error_state"
              >
                {referError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Confirmation Screen ───────────────────────────────────────────

function ConfirmationScreen({
  booking,
  onReset,
}: {
  booking: Booking;
  onReset: () => void;
}) {
  return (
    <div
      className="min-h-screen relative overflow-hidden pt-24"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.09 0.025 260) 0%, oklch(0.12 0.04 268) 100%)",
      }}
      data-ocid="booking.success_state"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <ZodiacWheel className="w-[min(90vw,700px)] text-gold opacity-5" />
      </div>

      <div className="relative z-10 container mx-auto max-w-xl px-6 py-16 text-center">
        <div className="w-16 h-16 border-2 border-gold rounded-sm flex items-center justify-center mx-auto mb-8 glow-gold-sm">
          <CheckCircle2 className="w-8 h-8 text-gold" />
        </div>

        <h1 className="font-display text-4xl text-cream mb-4">
          Booking Confirmed
        </h1>
        <div className="gold-divider w-24 mx-auto mb-8" />
        <p className="font-body text-cream/70 text-lg mb-12">
          Thank you, {booking.clientName}. Your consultation has been confirmed.
          Minakshi will reach out to you at{" "}
          <span className="text-gold">{booking.email}</span> to prepare for your
          session.
        </p>

        <div className="card-cosmic rounded-sm p-8 text-left space-y-4 mb-10">
          <h2 className="font-display text-xl text-gold mb-4">
            Session Details
          </h2>
          <div className="grid grid-cols-2 gap-4 font-body text-sm">
            <div>
              <span className="text-cream/45 block text-xs tracking-wider uppercase mb-1">
                Service
              </span>
              <span className="text-cream/90">{booking.service}</span>
            </div>
            <div>
              <span className="text-cream/45 block text-xs tracking-wider uppercase mb-1">
                Date
              </span>
              <span className="text-cream/90">{booking.slotDate}</span>
            </div>
            <div>
              <span className="text-cream/45 block text-xs tracking-wider uppercase mb-1">
                Time
              </span>
              <span className="text-cream/90">{booking.slotTime}</span>
            </div>
            <div>
              <span className="text-cream/45 block text-xs tracking-wider uppercase mb-1">
                Birth Place
              </span>
              <span className="text-cream/90">{booking.birthPlace}</span>
            </div>
            <div>
              <span className="text-cream/45 block text-xs tracking-wider uppercase mb-1">
                Date of Birth
              </span>
              <span className="text-cream/90">{booking.dob}</span>
            </div>
            <div>
              <span className="text-cream/45 block text-xs tracking-wider uppercase mb-1">
                Time of Birth
              </span>
              <span className="text-cream/90">{booking.tob}</span>
            </div>
            {booking.feeApplied > 0n && (
              <div>
                <span className="text-cream/45 block text-xs tracking-wider uppercase mb-1">
                  Fee Applied
                </span>
                <span className="text-gold font-medium">
                  ₹{Number(booking.feeApplied).toLocaleString("en-IN")}
                </span>
              </div>
            )}
            {booking.couponUsed && (
              <div>
                <span className="text-cream/45 block text-xs tracking-wider uppercase mb-1">
                  Coupon Used
                </span>
                <span className="text-gold">{booking.couponUsed}</span>
              </div>
            )}
          </div>
        </div>

        {/* Refer a Friend on confirmation screen */}
        <div className="mb-10 text-left">
          <ReferFriendSection />
        </div>

        {/* Payment + Screenshot Section */}
        <div
          className="card-cosmic rounded-sm p-6 mb-8 border border-gold/30 text-left space-y-6"
          data-ocid="booking.screenshot.panel"
        >
          {/* Payment via UPI */}
          <div>
            <h3 className="font-display text-lg text-gold mb-1">
              Complete Your Payment
            </h3>
            <p className="font-body text-cream/60 text-sm mb-4">
              Scan the QR code below or pay directly via UPI to confirm your
              session.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* QR Code */}
              <div className="flex-shrink-0 bg-white rounded-sm p-2 shadow-lg">
                <img
                  src="/assets/generated/upi-qr-code.dim_300x350.png"
                  alt="UPI QR Code for iamminakshi007@oksbi"
                  className="w-40 h-auto block"
                  data-ocid="booking.upi.qr_image"
                />
              </div>
              {/* UPI Details */}
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div>
                  <p className="font-body text-cream/50 text-xs tracking-wider uppercase mb-1">
                    UPI ID
                  </p>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="font-body text-gold font-medium text-base tracking-wide">
                      iamminakshi007@oksbi
                    </span>
                    <button
                      type="button"
                      data-ocid="booking.upi.copy_button"
                      onClick={() => {
                        navigator.clipboard.writeText("iamminakshi007@oksbi");
                        toast.success("UPI ID copied!");
                      }}
                      className="text-cream/40 hover:text-gold transition-colors p-1"
                      aria-label="Copy UPI ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="font-body text-cream/50 text-xs tracking-wider uppercase mb-1">
                    Pay To
                  </p>
                  <p className="font-body text-cream/80 text-sm">
                    Minakshi (दूjyoti)
                  </p>
                </div>
                {booking.feeApplied > 0n && (
                  <div>
                    <p className="font-body text-cream/50 text-xs tracking-wider uppercase mb-1">
                      Amount
                    </p>
                    <p className="font-display text-gold text-xl font-medium">
                      ₹{Number(booking.feeApplied).toLocaleString("en-IN")}
                    </p>
                  </div>
                )}
                <p className="font-body text-cream/40 text-xs leading-relaxed">
                  Open any UPI app (GPay, PhonePe, Paytm, BHIM) and scan the QR
                  or enter the UPI ID above.
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gold/15" />

          {/* Screenshot instruction */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 border border-gold/40 rounded-sm flex items-center justify-center flex-shrink-0 bg-gold/5">
              <Camera className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="font-display text-lg text-gold mb-2">
                After Payment — Send Your Screenshot
              </h3>
              <p className="font-body text-cream/70 text-sm leading-relaxed mb-3">
                Once payment is done, take a screenshot of this page (or your
                payment confirmation) and send it to Minakshi at:
              </p>
              <a
                href="mailto:dujyoti.minakshi@gmail.com"
                className="font-body text-gold font-medium text-sm hover:underline"
              >
                dujyoti.minakshi@gmail.com
              </a>
              <p className="font-body text-cream/50 text-xs mt-2">
                This confirms your payment and helps Minakshi prepare for your
                session.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={onReset}
          variant="outline"
          data-ocid="booking.reset.button"
          className="btn-gold-outline px-8 py-3 tracking-widest uppercase text-sm rounded-none"
        >
          Book Another Session
        </Button>
      </div>
    </div>
  );
}
