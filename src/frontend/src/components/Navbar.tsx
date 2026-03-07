import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Menu, Shield, X } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "About", href: "/#about" },
    { label: "Philosophy", href: "/#philosophy" },
    { label: "Services", href: "/#services" },
    { label: "Astrologer", href: "/#astrologer" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-navy-deep/95 backdrop-blur-md border-b border-gold/10 shadow-[0_4px_24px_oklch(0.09_0.025_260/0.8)]"
          : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Brand */}
          <Link
            to="/"
            className="font-display text-2xl text-gold hover:text-gold-bright transition-colors duration-300"
            data-ocid="nav.link"
          >
            दूjyoti
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                data-ocid="nav.link"
                className="font-body text-foreground/75 hover:text-gold transition-colors duration-300 text-base tracking-wide"
              >
                {link.label}
              </a>
            ))}
            <Link to="/book">
              <Button
                data-ocid="nav.primary_button"
                className="btn-gold px-6 py-2 rounded-sm text-sm tracking-widest uppercase"
              >
                Book a Reading
              </Button>
            </Link>
            <Link
              to="/admin"
              data-ocid="nav.admin.link"
              className="font-body text-foreground/50 hover:text-gold transition-colors duration-300 text-sm tracking-wide flex items-center gap-1.5"
              title="Admin Panel"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden text-foreground/75 hover:text-gold transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-6 border-t border-gold/10">
            <div className="flex flex-col gap-4 pt-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  data-ocid="nav.link"
                  className="font-body text-foreground/75 hover:text-gold transition-colors duration-300 text-lg px-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link to="/book" onClick={() => setMobileOpen(false)}>
                <Button
                  data-ocid="nav.primary_button"
                  className="btn-gold w-full mt-2 tracking-widest uppercase text-sm"
                >
                  Book a Reading
                </Button>
              </Link>
              <Link
                to="/admin"
                data-ocid="nav.admin.link"
                className="font-body text-foreground/50 hover:text-gold transition-colors duration-300 text-base px-2 flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
