import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Compass,
  Instagram,
  Mail,
  MessageSquare,
  Moon,
  Star,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ZodiacWheel } from "../components/ZodiacWheel";

import { type LocalReview, loadLocalReviews } from "../utils/reviewsStore";

const INSTAGRAM_POSTS = [
  {
    img: "/assets/generated/insta-post-1.dim_400x400.jpg",
    caption:
      "The rising sign reveals the mask we wear — and the doorway through which we meet the world.",
  },
  {
    img: "/assets/generated/insta-post-2.dim_400x400.jpg",
    caption:
      "Saturn teaches through limitation. In its discipline lies the seed of lasting structure.",
  },
  {
    img: "/assets/generated/insta-post-3.dim_400x400.jpg",
    caption:
      "Dharma is the path the soul already knows. Jyotiṣa simply illuminates what was always there.",
  },
  {
    img: "/assets/generated/insta-post-4.dim_400x400.jpg",
    caption:
      "The moon in Scorpio feels deeply, transforms silently, and rises stronger than before.",
  },
  {
    img: "/assets/generated/insta-post-5.dim_400x400.jpg",
    caption:
      "The Navamsa chart reveals the soul's deepest calling — beyond circumstance, beyond time.",
  },
  {
    img: "/assets/generated/insta-post-6.dim_400x400.jpg",
    caption:
      "The Sun in your chart is where you must become yourself. It asks for nothing less.",
  },
];

// ── Seed Reviews ─────────────────────────────────────────────────

interface SeedReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  service: string;
  date: string;
  approved: true;
}

const SEED_REVIEWS: SeedReview[] = [
  {
    id: "seed_1",
    authorName: "Priya S.",
    rating: 5,
    service: "Birth Chart Reading",
    text: "Minakshi's reading was deeply insightful. She helped me see patterns I had been blind to for years. Her understanding of Vedic astrology is truly profound.",
    date: "February 2026",
    approved: true,
  },
  {
    id: "seed_2",
    authorName: "Arjun M.",
    rating: 5,
    service: "Psychological Astrology",
    text: "I came with a lot of confusion about my career direction. The session brought so much clarity. The way she connected my chart to my inner patterns was remarkable.",
    date: "January 2026",
    approved: true,
  },
  {
    id: "seed_3",
    authorName: "Sneha R.",
    rating: 5,
    service: "Life Guidance Session",
    text: "A calm, reflective space to explore life's questions. Minakshi listens deeply and offers guidance that feels rooted in both wisdom and practicality.",
    date: "March 2026",
    approved: true,
  },
  {
    id: "seed_4",
    authorName: "Karthik V.",
    rating: 4,
    service: "Birth Chart Reading",
    text: "Very thoughtful analysis of my chart. I appreciated the focus on self-understanding rather than predictions. Will definitely book again.",
    date: "February 2026",
    approved: true,
  },
];

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 flex-shrink-0 ${
            n <= rating
              ? "text-gold fill-gold"
              : "text-cream/20 fill-transparent"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewsSection() {
  const [localReviews, setLocalReviews] = useState<LocalReview[]>([]);

  useEffect(() => {
    const approved = loadLocalReviews().filter((r) => r.approved);
    setLocalReviews(approved);
  }, []);

  // Combine seed + approved local reviews
  type DisplayReview = {
    id: string;
    authorName: string;
    rating: number;
    text: string;
    service: string;
    displayDate: string;
  };

  const reviews: DisplayReview[] = [
    ...SEED_REVIEWS.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      text: r.text,
      service: r.service,
      displayDate: r.date,
    })),
    ...localReviews.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      text: r.text,
      service: r.service,
      displayDate: new Date(r.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
    })),
  ];

  return (
    <section
      id="reviews"
      className="py-28 px-6"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.14 0.05 272) 0%, oklch(0.11 0.04 265) 100%)",
      }}
    >
      <div className="container mx-auto max-w-5xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-body block mb-4">
            Testimonials
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-cream mb-6">
            What Clients Say
          </h2>
          <div className="gold-divider w-24 mx-auto mb-8" />
          <p className="font-body text-lg text-cream/65 max-w-xl mx-auto">
            Each session opens a doorway. Here is what others have found on the
            other side.
          </p>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {reviews.map((review, idx) => (
            <div
              key={review.id}
              data-ocid={`reviews.item.${idx + 1}`}
              className="card-cosmic rounded-sm p-7 flex flex-col"
            >
              {/* Stars + service */}
              <div className="flex items-start justify-between mb-4">
                <StarDisplay rating={review.rating} />
                <span className="font-body text-gold/50 text-xs tracking-wide border border-gold/15 px-2 py-0.5 rounded-sm">
                  {review.service}
                </span>
              </div>

              {/* Review text */}
              <p className="font-body text-cream/80 text-base leading-relaxed italic mb-6 flex-1">
                "{review.text}"
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-gold/10 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-sm bg-gold/15 border border-gold/25 flex items-center justify-center">
                    <span className="font-display text-gold text-xs">
                      {review.authorName.charAt(0)}
                    </span>
                  </div>
                  <span className="font-body text-cream/70 text-sm font-medium">
                    {review.authorName}
                  </span>
                </div>
                <span className="font-body text-cream/35 text-xs">
                  {review.displayDate}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-5">
            <p className="font-body text-cream/55 text-base">
              Had a session with Minakshi? We'd love to hear your story.
            </p>
            <Link to="/reviews">
              <Button
                data-ocid="reviews.share.primary_button"
                className="btn-gold px-10 py-3 tracking-widest uppercase text-sm rounded-none inline-flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Share Your Experience
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const PURUSHARTHAS = [
  {
    icon: Compass,
    name: "Dharma",
    subtitle: "Living in alignment with one's nature",
    desc: "The first pillar — understanding your inherent purpose and the path that is uniquely yours. Dharma is not a rule but a recognition.",
  },
  {
    icon: Star,
    name: "Artha",
    subtitle: "Creating stability and rightful abundance",
    desc: "Material foundation aligned with values. Artha shows us how to build, sustain, and create in ways that serve our deeper nature.",
  },
  {
    icon: Moon,
    name: "Kama",
    subtitle: "Experiencing fulfillment and joy",
    desc: "The pursuit of beauty, connection, and desire — not as distraction but as a sacred dimension of a complete life.",
  },
  {
    icon: Sun,
    name: "Moksha",
    subtitle: "The path toward inner freedom",
    desc: "Liberation from unconscious patterns. Moksha is the awareness that watches all — the stillness beneath every movement of the mind.",
  },
];

const SERVICES = [
  {
    title: "Birth Chart Reading",
    desc: "A deep exploration of your natal chart — your personality, core strengths, emotional tendencies, karmic patterns, and the overall direction of your life as written in the sky at your birth.",
    highlights: [
      "Personality & soul nature",
      "Strengths & dharmic gifts",
      "Emotional patterns",
      "Life direction & timing",
    ],
  },
  {
    title: "Life Guidance Session",
    desc: "A focused consultation on a specific life area — career transitions, relationship dynamics, important decisions. Bring your question; the chart will speak.",
    highlights: [
      "Career & purpose alignment",
      "Relationship compatibility",
      "Timing of major decisions",
      "Transit guidance",
    ],
  },
  {
    title: "Psychological Astrology",
    desc: "An introspective session exploring the recurring patterns of the mind and behavior encoded in your birth chart — a bridge between classical Jyotiṣa and the inner landscape.",
    highlights: [
      "Behavioral & mental patterns",
      "Unconscious tendencies",
      "Inner child & early conditioning",
      "Path to self-understanding",
    ],
  },
];

export function HomePage() {
  return (
    <main className="relative overflow-hidden">
      {/* ─── Hero Section ──────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.09 0.025 260) 0%, oklch(0.12 0.04 268) 60%, oklch(0.10 0.03 262) 100%)",
        }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(/assets/generated/cosmic-hero-bg.dim_1920x1080.jpg)",
            opacity: 0.35,
          }}
        />

        {/* Zodiac wheel */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ZodiacWheel
            className="w-[min(90vw,700px)] text-gold animate-spin-slow"
            opacity={0.12}
          />
        </div>

        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.25 0.08 280 / 0.25) 0%, transparent 65%)",
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-24">
          {/* Small ornament */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-16 bg-gold/40" />
            <span className="text-gold/70 text-sm tracking-[0.3em] uppercase font-body">
              Vedic Astrology
            </span>
            <div className="h-px w-16 bg-gold/40" />
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-cream mb-6 leading-tight">
            दूjyoti
            <span className="block text-gold mt-2 text-4xl sm:text-5xl lg:text-6xl italic">
              The Cosmic Light
            </span>
          </h1>

          <p className="font-body text-xl sm:text-2xl text-cream/85 mb-6 leading-relaxed max-w-2xl mx-auto">
            Astrology as a path to understand the mind and align with one's true
            nature.
          </p>

          <p className="font-body text-base sm:text-lg text-cream/65 mb-12 leading-relaxed max-w-xl mx-auto">
            दूjyoti a space rooted in Vedic wisdom where astrology is approached
            as a tool for self-understanding, inner clarity, and alignment with
            life.
          </p>

          <Link to="/book">
            <Button
              data-ocid="hero.primary_button"
              size="lg"
              className="btn-gold px-10 py-4 text-base tracking-widest uppercase rounded-none"
            >
              Book a Reading
            </Button>
          </Link>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
            <div className="w-px h-12 bg-gold/40" />
            <span className="text-gold/50 text-xs tracking-widest">SCROLL</span>
          </div>
        </div>
      </section>

      {/* ─── Gold Divider ──────────────────────────────────────────── */}
      <div className="section-divider" />

      {/* ─── About Section ─────────────────────────────────────────── */}
      <section
        id="about"
        className="py-28 px-6"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.10 0.03 262) 0%, oklch(0.13 0.045 270) 100%)",
        }}
      >
        <div className="container mx-auto max-w-3xl text-center">
          <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-body block mb-4">
            The Essence
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-cream mb-8">
            About दूjyoti
          </h2>
          <div className="gold-divider w-24 mx-auto mb-12" />

          <div className="space-y-6 font-body text-lg sm:text-xl text-cream/80 leading-relaxed text-left">
            <p>
              Astrology, at its deepest, is not about prediction — it is a
              mirror. A mirror that reflects our inner patterns, emotional
              tendencies, and the recurring themes of our lives. When we look at
              the sky at the moment of birth, we see a map of the soul's
              particular expression in this lifetime.
            </p>
            <p>
              दूjyoti is grounded in the{" "}
              <span className="text-gold italic">
                Vedic astrology tradition
              </span>{" "}
              — a system developed over millennia in India to understand the
              relationship between the cosmos and the inner life. It is a
              tradition that sees the chart not as fate, but as a compass.
            </p>
            <p>
              The work here centers on understanding{" "}
              <span className="text-gold italic">psychological tendencies</span>{" "}
              — why we respond as we do, where our fears originate, what our
              strengths truly are — and on guiding each person toward their
              unique <span className="text-gold italic">Dharma</span>: the path
              of living in alignment with one's deepest nature.
            </p>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── Philosophy Section ────────────────────────────────────── */}
      <section
        id="philosophy"
        className="py-28 px-6"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.13 0.045 270) 0%, oklch(0.11 0.04 265) 100%)",
        }}
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-body block mb-4">
              The Foundation
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-cream mb-6">
              The Four Purusharthas
            </h2>
            <div className="gold-divider w-24 mx-auto mb-8" />
            <p className="font-body text-lg text-cream/70 max-w-2xl mx-auto">
              Vedic philosophy speaks of four dimensions of a complete human
              life. Astrology illuminates how each of us is called to navigate
              these paths with awareness and clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PURUSHARTHAS.map((p) => (
              <div
                key={p.name}
                className="card-cosmic rounded-sm p-8 transition-all duration-300 group"
              >
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 flex items-center justify-center border border-gold/30 rounded-sm flex-shrink-0 group-hover:border-gold/60 transition-colors">
                    <p.icon className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-gold mb-1">
                      {p.name}
                    </h3>
                    <p className="font-body text-sm text-gold/60 italic mb-3">
                      {p.subtitle}
                    </p>
                    <p className="font-body text-cream/75 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── Services Section ──────────────────────────────────────── */}
      <section
        id="services"
        className="py-28 px-6"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.11 0.04 265) 0%, oklch(0.14 0.05 272) 100%)",
        }}
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-body block mb-4">
              Consultations
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-cream mb-6">
              Offerings
            </h2>
            <div className="gold-divider w-24 mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, i) => (
              <div
                key={service.title}
                data-ocid={`services.item.${i + 1}`}
                className="card-cosmic rounded-sm p-8 flex flex-col transition-all duration-300 group"
              >
                <div className="mb-auto">
                  <div className="flex items-center mb-4">
                    <span className="text-gold/40 font-display text-4xl leading-none">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl text-cream mb-4 group-hover:text-gold transition-colors">
                    {service.title}
                  </h3>
                  <p className="font-body text-cream/70 mb-6 leading-relaxed">
                    {service.desc}
                  </p>
                  <ul className="space-y-2 mb-8">
                    {service.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-center gap-3 text-cream/60 text-sm font-body"
                      >
                        <span className="w-1 h-1 rounded-full bg-gold/60 flex-shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/book">
                  <Button
                    data-ocid={`services.book_button.${i + 1}`}
                    variant="outline"
                    className="btn-gold-outline w-full tracking-widest uppercase text-xs rounded-none"
                  >
                    Book Session
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/book">
              <Button className="btn-gold px-12 py-3 tracking-widest uppercase text-sm rounded-none">
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── Reviews Section ───────────────────────────────────────── */}
      <ReviewsSection />

      <div className="section-divider" />

      {/* ─── Astrologer Section ────────────────────────────────────── */}
      <section
        id="astrologer"
        className="py-28 px-6"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.14 0.05 272) 0%, oklch(0.10 0.03 262) 100%)",
        }}
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-body block mb-4">
              The Guide
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-cream mb-6">
              Meet Minakshi
            </h2>
            <div className="gold-divider w-24 mx-auto" />
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Portrait */}
            <div className="flex-shrink-0">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 rounded-full border-2 border-gold/40 animate-pulse-gold" />
                <div className="absolute inset-2 rounded-full border border-gold/20" />
                <img
                  src="/assets/uploads/WhatsApp-Image-2026-01-17-at-2.28.09-PM-1.jpeg"
                  alt="Minakshi — Vedic Astrologer"
                  className="w-full h-full rounded-full object-cover border-2 border-gold/30"
                  style={{ filter: "brightness(0.95) saturate(0.9)" }}
                />
                {/* Gold glow overlay */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 60%, oklch(var(--gold) / 0.08) 0%, transparent 70%)",
                  }}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="flex-1 space-y-5 font-body text-lg text-cream/80 leading-relaxed">
              <p>
                Minakshi brings together the depth of the{" "}
                <span className="text-gold italic">
                  Sanskrit knowledge tradition
                </span>{" "}
                with a Master's in{" "}
                <span className="text-gold italic">
                  Sanskrit Computational Linguistics
                </span>{" "}
                — a rare intersection of ancient wisdom and modern scholarly
                inquiry.
              </p>
              <p>
                Her interest in Vedic astrology grew from a recognition that
                classical Indian texts hold an extraordinarily nuanced
                understanding of the human mind — one that contemporary
                psychology is only beginning to approach.
              </p>
              <p>
                The approach at दूjyoti combines{" "}
                <span className="text-gold italic">
                  classical Jyotiṣa wisdom
                </span>{" "}
                with a reflective understanding of the human mind, offering
                consultations that are both grounded in tradition and deeply
                personal in their application.
              </p>
              <div className="pt-4">
                <Link to="/book">
                  <Button className="btn-gold px-8 py-3 tracking-widest uppercase text-sm rounded-none">
                    Book a Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── Instagram Section ─────────────────────────────────────── */}
      <section
        className="py-28 px-6"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.10 0.03 262) 0%, oklch(0.12 0.04 268) 100%)",
        }}
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-6">
            <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-body block mb-4">
              Social
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-cream mb-4">
              Reflections & Insights
            </h2>
            <div className="gold-divider w-24 mx-auto mb-6" />
            <a
              href="https://instagram.com/dujyoti.minakshi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gold/70 hover:text-gold font-body transition-colors text-sm tracking-widest uppercase"
            >
              <Instagram className="w-4 h-4" />
              Follow @dujyoti.minakshi
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-12">
            {INSTAGRAM_POSTS.map((post) => (
              <a
                key={post.img}
                href="https://instagram.com/dujyoti.minakshi"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden border border-gold/20 hover:border-gold/50 transition-all duration-300"
              >
                <img
                  src={post.img}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-navy-deep/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="font-body text-cream/90 text-sm leading-relaxed">
                    {post.caption}
                  </p>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://instagram.com/dujyoti.minakshi"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="instagram.link"
            >
              <Button
                variant="outline"
                className="btn-gold-outline px-10 py-3 tracking-widest uppercase text-xs rounded-none inline-flex items-center gap-2"
              >
                <Instagram className="w-4 h-4" />
                Follow on Instagram
              </Button>
            </a>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── Closing Section ───────────────────────────────────────── */}
      <section
        className="py-36 px-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.12 0.04 268) 0%, oklch(0.09 0.025 260) 100%)",
        }}
      >
        {/* Background zodiac */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ZodiacWheel className="w-[min(80vw,600px)] text-gold opacity-5" />
        </div>

        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 50% 50%, oklch(0.20 0.08 280 / 0.15) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="w-px h-16 bg-gold/30 mx-auto mb-10" />
          <blockquote className="font-display text-3xl sm:text-4xl lg:text-5xl text-cream/90 italic leading-relaxed mb-10">
            "Walking in one's own nature is the truest alignment."
          </blockquote>
          <div className="gold-divider w-32 mx-auto mb-12" />
          <Link to="/book">
            <Button
              data-ocid="closing.primary_button"
              size="lg"
              className="btn-gold px-12 py-4 text-base tracking-widest uppercase rounded-none"
            >
              Begin Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <footer
        className="py-16 px-6 border-t border-gold/10"
        style={{ background: "oklch(0.09 0.025 260)" }}
      >
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Brand */}
            <div>
              <div className="font-display text-2xl text-gold mb-2">दूjyoti</div>
              <p className="font-body text-cream/50 text-sm">
                Astrology for Understanding the Mind
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-col sm:flex-row gap-6 text-sm font-body">
              <a
                href="https://instagram.com/dujyoti.minakshi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-cream/50 hover:text-gold transition-colors"
              >
                <Instagram className="w-4 h-4" />
                @dujyoti.minakshi
              </a>
              <Link
                to="/book"
                className="flex items-center gap-2 text-cream/50 hover:text-gold transition-colors"
              >
                <Star className="w-4 h-4" />
                Book Appointment
              </Link>
              <Link
                to="/reviews"
                className="flex items-center gap-2 text-cream/50 hover:text-gold transition-colors"
                data-ocid="footer.reviews.link"
              >
                <MessageSquare className="w-4 h-4" />
                Reviews
              </Link>
              <a
                href="mailto:dujyoti.minnakshi@gmail.com"
                className="flex items-center gap-2 text-cream/50 hover:text-gold transition-colors"
              >
                <Mail className="w-4 h-4" />
                dujyoti.minnakshi@gmail.com
              </a>
            </div>
          </div>

          <div className="gold-divider my-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/30 font-body">
            <p>
              © {new Date().getFullYear()} दूjyoti — The Cosmic Light. All rights
              reserved.
            </p>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold/60 transition-colors"
            >
              Built with love using caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
