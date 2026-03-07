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
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { useState } from "react";
import { ZodiacWheel } from "../components/ZodiacWheel";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  type LocalReview,
  REVIEWS_KEY,
  loadLocalReviews,
  saveLocalReview,
} from "../utils/reviewsStore";

const SERVICES = [
  "Birth Chart Reading",
  "Life Guidance Session",
  "Psychological Astrology",
];

function StarSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <fieldset className="flex items-center gap-1 border-0 p-0 m-0">
      <legend className="sr-only">Star rating</legend>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          data-ocid={`reviews.star.${n}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              n <= (hovered || value)
                ? "text-gold fill-gold"
                : "text-cream/25 fill-transparent"
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 font-body text-sm text-gold/70">
          {["", "Poor", "Fair", "Good", "Great", "Excellent"][value]}
        </span>
      )}
    </fieldset>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${
            n <= rating
              ? "text-gold fill-gold"
              : "text-cream/20 fill-transparent"
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewsPage() {
  const { identity, login, loginStatus, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [service, setService] = useState("");
  const [text, setText] = useState("");
  const [isPastClient, setIsPastClient] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = () => {
    if (!isAuthenticated) return;
    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (rating === 0) {
      setErrorMsg("Please select a star rating.");
      return;
    }
    if (!service) {
      setErrorMsg("Please select a service.");
      return;
    }
    if (text.trim().length < 20) {
      setErrorMsg("Please write at least 20 characters.");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);

    const review: LocalReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      authorName: name.trim(),
      rating,
      text: text.trim(),
      service,
      createdAt: new Date().toISOString(),
      approved: false,
      principalId: identity?.getPrincipal().toString() ?? "",
      bookingRef: bookingRef.trim() || undefined,
      isPastClient,
    };

    saveLocalReview(review);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const allMyReviews = (() => {
    try {
      const raw = localStorage.getItem(REVIEWS_KEY);
      if (!raw) return [];
      const arr: LocalReview[] = JSON.parse(raw);
      const principal = identity?.getPrincipal().toString() ?? "";
      return principal ? arr.filter((r) => r.principalId === principal) : [];
    } catch {
      return [];
    }
  })();

  return (
    <div
      className="min-h-screen relative overflow-hidden pt-24"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.09 0.025 260) 0%, oklch(0.12 0.04 268) 100%)",
      }}
    >
      {/* Zodiac background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <ZodiacWheel className="w-[min(90vw,800px)] text-gold" />
      </div>

      <div className="relative z-10 container mx-auto max-w-2xl px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-body block mb-4">
            Client Voices
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-cream mb-4">
            Share Your Experience
          </h1>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="font-body text-cream/60 text-lg">
            Your experience matters. Help others find clarity on their path.
          </p>
        </div>

        {/* Not signed in */}
        {!isInitializing && !isAuthenticated && (
          <div
            className="card-cosmic rounded-sm p-10 text-center"
            data-ocid="reviews.signin.panel"
          >
            <div className="flex justify-center mb-6">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className="w-6 h-6 text-gold/30 fill-transparent mx-0.5"
                />
              ))}
            </div>
            <h2 className="font-display text-2xl text-cream mb-3">
              Sign In to Share a Review
            </h2>
            <p className="font-body text-cream/60 mb-8">
              Please sign in with Internet Identity to share your experience.
            </p>
            <Button
              onClick={login}
              disabled={loginStatus === "logging-in"}
              data-ocid="reviews.signin.primary_button"
              className="btn-gold px-10 py-3 tracking-widest uppercase text-sm rounded-none"
            >
              {loginStatus === "logging-in" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        )}

        {/* Loading */}
        {isInitializing && (
          <div
            className="flex justify-center py-20"
            data-ocid="reviews.loading_state"
          >
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
        )}

        {/* Authenticated — submission form or success */}
        {!isInitializing && isAuthenticated && (
          <>
            {submitted ? (
              <div
                className="card-cosmic rounded-sm p-10 text-center"
                data-ocid="reviews.form.success_state"
              >
                <div className="w-14 h-14 border-2 border-gold rounded-sm flex items-center justify-center mx-auto mb-6 glow-gold-sm">
                  <CheckCircle2 className="w-7 h-7 text-gold" />
                </div>
                <h2 className="font-display text-2xl text-cream mb-3">
                  Thank You
                </h2>
                <div className="gold-divider w-16 mx-auto mb-5" />
                <p className="font-body text-cream/70 mb-8">
                  Your review has been submitted and will appear after it is
                  approved.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setName("");
                      setRating(0);
                      setService("");
                      setText("");
                      setIsPastClient(false);
                      setBookingRef("");
                    }}
                    data-ocid="reviews.submit_another.button"
                    variant="ghost"
                    className="text-cream/60 hover:text-cream font-body tracking-wide"
                  >
                    Submit Another Review
                  </Button>
                  <Link to="/">
                    <Button
                      data-ocid="reviews.home.link"
                      className="btn-gold px-8 py-2.5 tracking-widest uppercase text-sm rounded-none"
                    >
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div
                className="card-cosmic rounded-sm p-8 space-y-6"
                data-ocid="reviews.form.panel"
              >
                <h2 className="font-display text-2xl text-cream">
                  Your Review
                </h2>
                <div className="gold-divider" />

                {/* Approval note */}
                <div className="flex items-start gap-3 bg-gold/5 border border-gold/15 rounded-sm px-4 py-3">
                  <Star className="w-4 h-4 text-gold/60 mt-0.5 flex-shrink-0" />
                  <p className="font-body text-cream/60 text-sm">
                    Your review will appear publicly after it is approved.
                  </p>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="reviewName"
                    className="text-cream/70 font-body text-sm tracking-wide"
                  >
                    Your Name *
                  </Label>
                  <Input
                    id="reviewName"
                    data-ocid="reviews.name.input"
                    placeholder="How should we display your name?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-card/60 border-gold/25 text-cream placeholder:text-cream/30 focus:border-gold rounded-sm font-body"
                  />
                </div>

                {/* Star rating */}
                <div className="space-y-2">
                  <Label className="text-cream/70 font-body text-sm tracking-wide">
                    Rating *
                  </Label>
                  <StarSelector value={rating} onChange={setRating} />
                </div>

                {/* Service */}
                <div className="space-y-2">
                  <Label className="text-cream/70 font-body text-sm tracking-wide">
                    Service *
                  </Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger
                      data-ocid="reviews.service.select"
                      className="bg-card/60 border-gold/25 text-cream font-body focus:border-gold rounded-sm"
                    >
                      <SelectValue placeholder="Which service did you receive?" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-gold/25 text-cream">
                      {SERVICES.map((s) => (
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

                {/* Review text */}
                <div className="space-y-2">
                  <Label
                    htmlFor="reviewText"
                    className="text-cream/70 font-body text-sm tracking-wide"
                  >
                    Your Experience *
                    <span className="text-cream/35 ml-2 text-xs">
                      (min. 20 characters)
                    </span>
                  </Label>
                  <Textarea
                    id="reviewText"
                    data-ocid="reviews.text.textarea"
                    placeholder="Share what resonated most about your session…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                    className="bg-card/60 border-gold/25 text-cream placeholder:text-cream/30 focus:border-gold rounded-sm font-body resize-none"
                  />
                  <div className="text-right">
                    <span
                      className={`text-xs font-body ${
                        text.length < 20 ? "text-cream/30" : "text-gold/60"
                      }`}
                    >
                      {text.length} chars
                    </span>
                  </div>
                </div>

                {/* Past client checkbox */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 border rounded-sm flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                      isPastClient
                        ? "bg-gold border-gold"
                        : "border-gold/30 bg-transparent hover:border-gold/60"
                    }`}
                    onClick={() => setIsPastClient((p) => !p)}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        setIsPastClient((p) => !p);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      id="pastClient"
                      data-ocid="reviews.past_client.checkbox"
                      checked={isPastClient}
                      onChange={(e) => setIsPastClient(e.target.checked)}
                      className="sr-only"
                    />
                    {isPastClient && (
                      <span className="text-navy-deep text-xs font-bold pointer-events-none">
                        ✓
                      </span>
                    )}
                  </div>
                  <label
                    htmlFor="pastClient"
                    className="font-body text-cream/60 text-sm cursor-pointer select-none"
                  >
                    I have consulted with Minakshi
                  </label>
                </div>

                {/* Optional booking reference */}
                {isPastClient && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="bookingRef"
                      className="text-cream/70 font-body text-sm tracking-wide"
                    >
                      Booking Reference
                      <span className="text-cream/35 ml-2 text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="bookingRef"
                      data-ocid="reviews.booking_ref.input"
                      placeholder="Your booking ID or session date"
                      value={bookingRef}
                      onChange={(e) => setBookingRef(e.target.value)}
                      className="bg-card/60 border-gold/25 text-cream placeholder:text-cream/30 focus:border-gold rounded-sm font-body"
                    />
                  </div>
                )}

                {/* Error message */}
                {errorMsg && (
                  <p
                    className="font-body text-destructive text-sm"
                    data-ocid="reviews.form.error_state"
                  >
                    {errorMsg}
                  </p>
                )}

                {/* Submit */}
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    data-ocid="reviews.form.submit_button"
                    className="btn-gold px-8 py-3 tracking-widest uppercase text-sm rounded-none inline-flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* My submitted reviews */}
            {allMyReviews.length > 0 && (
              <div className="mt-12">
                <h2 className="font-display text-2xl text-cream mb-2">
                  Your Submitted Reviews
                </h2>
                <div className="gold-divider w-32 mb-6" />
                <div className="space-y-4">
                  {allMyReviews.map((review, idx) => (
                    <div
                      key={review.id}
                      data-ocid={`reviews.my_review.item.${idx + 1}`}
                      className="card-cosmic rounded-sm p-5"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <StarDisplay rating={review.rating} />
                          <p className="font-body text-gold/60 text-xs mt-1">
                            {review.service}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-body px-2 py-1 rounded-sm border ${
                            review.approved
                              ? "text-gold border-gold/30 bg-gold/10"
                              : "text-cream/40 border-cream/15 bg-cream/5"
                          }`}
                        >
                          {review.approved ? "Approved" : "Pending approval"}
                        </span>
                      </div>
                      <p className="font-body text-cream/75 text-sm leading-relaxed">
                        "{review.text}"
                      </p>
                      <p className="font-body text-cream/35 text-xs mt-3">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer nav */}
        <div className="mt-16 text-center">
          <Link
            to="/"
            className="font-body text-cream/40 hover:text-gold transition-colors text-sm tracking-wide"
            data-ocid="reviews.home.link"
          >
            ← Return to दूjyoti
          </Link>
        </div>
      </div>
    </div>
  );
}

// Re-export for use in other components
export { StarDisplay, type LocalReview };
