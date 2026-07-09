import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Twitter, Instagram, Linkedin, Github } from "lucide-react";

export default function Navbar({
  onOpenConsole,
  onOpenAdmin,
  onOpenContact,
  onGoHome,
  onOpenProduct,
  isLightPage = false,
}: {
  onOpenConsole: () => void;
  onOpenAdmin: () => void;
  onOpenContact: () => void;
  onGoHome: () => void;
  onOpenProduct: (section?: string) => void;
  isLightPage?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setExpandedIndex(null);
    }
  }, [isMobileMenuOpen]);

  // Prevent body scroll and hide scrollbars when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { 
      label: "Product", 
      href: "#solution",
      subLinks: [
        { label: "Our Platform", href: "#solution" },
        { label: "Why Linely", href: "#why-choose" },
      ]
    },
    { 
      label: "Solutions", 
      href: "#features",
      subLinks: [
        { label: "For Business", href: "#solution" },
        { label: "For Enterprise", href: "#features" },
      ]
    },
    { 
      label: "Industries", 
      href: "#industries",
      subLinks: [
        { label: "Retail & E-commerce", href: "#industries" },
        { label: "Logistics & Delivery", href: "#industries" },
      ]
    },
    { 
      label: "Pricing", 
      href: "#pricing",
      subLinks: [
        { label: "View Plans", href: "#pricing" },
        { label: "Custom Quotes", href: "#footer" },
      ]
    },
    { 
      label: "Contact", 
      href: "#contact",
    },
  ];

  const handleLinkClick = (e: React.MouseEvent, idx: number, hasSublinks: boolean) => {
    if (hasSublinks) {
      e.preventDefault();
      setExpandedIndex(expandedIndex === idx ? null : idx);
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav
        id="navbar"
        className={`fixed z-[110] flex items-center justify-between nav-transition ${
          scrolled ? "nav-scrolled" : "nav-top"
        }`}
        style={
          isMobileMenuOpen
            ? {
                backgroundColor: "transparent",
                borderColor: "transparent",
                boxShadow: "none",
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
              }
            : undefined
        }
      >
        {/* Left: Wordmark */}
        <a
          href="#"
          id="nav-logo"
          onClick={(e) => {
            e.preventDefault();
            onGoHome();
          }}
          className={`font-boldonse tracking-tight transition-all duration-[450ms] ease-in-out select-none ${
            isMobileMenuOpen
              ? scrolled
                ? "text-xl md:text-[23px] text-white hover:text-white/80"
                : "text-[25px] md:text-2xl text-white hover:text-white/80"
              : scrolled
                ? "text-xl md:text-[23px] text-brand-navy hover:text-brand-ocean"
                : isLightPage
                  ? "text-[25px] md:text-2xl text-brand-navy hover:text-brand-ocean"
                  : "text-[25px] md:text-2xl text-white hover:text-brand-cyan"
          }`}
        >
          Linely
        </a>

        {/* Center: Navigation Links (Desktop Only) */}
        <div
          id="nav-desktop-links"
          className="hidden md:flex items-center nav-transition"
          style={{ gap: scrolled ? "1.25rem" : "2rem" }}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                if (link.label === "Product") {
                  e.preventDefault();
                  onOpenProduct();
                } else if (link.href === "#contact") {
                  e.preventDefault();
                  onOpenContact();
                }
              }}
              className={`font-rethink text-[14px] font-semibold transition-colors relative group ${
                scrolled 
                  ? "text-slate-800 hover:text-brand-ocean" 
                  : isLightPage
                    ? "text-brand-navy hover:text-brand-ocean"
                    : "text-brand-cream/90 hover:text-brand-cyan"
              }`}
            >
              {link.label}
              <span className={`absolute bottom-[-4px] left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full ${
                scrolled 
                  ? "bg-brand-ocean" 
                  : isLightPage
                    ? "bg-brand-navy"
                    : "bg-brand-cyan"
              }`} />
            </a>
          ))}
        </div>

        {/* Right: Actions (Desktop Only) */}
        <div 
          id="nav-desktop-actions" 
          className="hidden md:flex items-center nav-transition"
          style={{ gap: scrolled ? "1rem" : "1.5rem" }}
        >
          <button
            id="nav-login-btn"
            onClick={onOpenConsole}
            className={`font-rethink text-[14px] font-semibold transition-colors cursor-pointer ${
              scrolled 
                ? "text-slate-800 hover:text-brand-ocean" 
                : isLightPage
                  ? "text-brand-navy hover:text-brand-ocean"
                  : "text-brand-cream hover:text-brand-cyan"
            }`}
          >
            Log in
          </button>
          <button
            id="nav-signup-btn"
            onClick={onOpenConsole}
            className={`font-rethink font-bold rounded-full transition-all duration-[450ms] ease-in-out cursor-pointer ${
              scrolled 
                ? "bg-brand-navy text-white hover:bg-brand-ocean px-5 py-2 text-[13px] shadow-sm" 
                : isLightPage
                  ? "bg-brand-navy text-white hover:bg-brand-ocean px-6 py-2.5 text-[14px] shadow-sm"
                  : "bg-brand-cyan text-brand-navy hover:bg-white hover:scale-105 px-6 py-2.5 text-[14px]"
            }`}
          >
            Try for free
          </button>
        </div>

        {/* Mobile View: Actions and Hamburger Menu Trigger */}
        <div className="flex md:hidden items-center gap-2 z-50">
          <button
            id="nav-mobile-signin-btn"
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenConsole();
            }}
            className={`font-rethink text-[13px] font-bold h-9 px-4.5 rounded-full border transition-all duration-300 cursor-pointer flex items-center justify-center whitespace-nowrap active:scale-95 ${
              isMobileMenuOpen
                ? "bg-transparent border-white/40 text-white hover:bg-white/10"
                : "bg-[#FCF9F2] border-[#EBE0CD] text-[#1A2372] shadow-[0_2px_10px_rgba(26,35,114,0.06)] hover:bg-white"
            }`}
          >
            Sign In
          </button>

          <button
            id="nav-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`w-9 h-9 rounded-full flex flex-col items-center justify-center relative transition-all duration-300 cursor-pointer active:scale-95 border ${
              isMobileMenuOpen
                ? "bg-transparent border-white/40 hover:bg-white/10"
                : "bg-[#FCF9F2] border-[#EBE0CD] shadow-[0_2px_10px_rgba(26,35,114,0.06)] hover:bg-white"
            }`}
            aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
          >
            <div className="relative w-4 h-3 flex flex-col items-center justify-center">
              <span
                className={`absolute block w-4.5 h-[2px] rounded-full transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen ? "bg-white rotate-45 translate-y-0" : "bg-[#1A2372] -translate-y-[3.5px]"
                }`}
              ></span>
              <span
                className={`absolute block w-4.5 h-[2px] rounded-full transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen ? "bg-white -rotate-45 translate-y-0" : "bg-[#1A2372] translate-y-[3.5px]"
                }`}
              ></span>
            </div>
          </button>
        </div>
      </nav>
 
      {/* Mobile Menu Full-screen Overlay using AnimatePresence */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ 
              y: "-100%",
              borderBottomLeftRadius: "100% 30%",
              borderBottomRightRadius: "100% 30%",
              borderTopLeftRadius: "0% 0%",
              borderTopRightRadius: "0% 0%"
            }}
            animate={{ 
              y: 0,
              borderBottomLeftRadius: "0% 0%",
              borderBottomRightRadius: "0% 0%",
              borderTopLeftRadius: "0% 0%",
              borderTopRightRadius: "0% 0%"
            }}
            exit={{ 
              y: "100%",
              borderBottomLeftRadius: "0% 0%",
              borderBottomRightRadius: "0% 0%",
              borderTopLeftRadius: "100% 30%",
              borderTopRightRadius: "100% 30%"
            }}
            transition={{ 
              type: "tween",
              duration: 0.85, 
              ease: [0.76, 0, 0.24, 1] 
            }}
            className="fixed inset-0 z-[100] bg-brand-cyan flex flex-col justify-between p-8 md:hidden shadow-[0_10px_40px_rgba(26,35,114,0.12)] overflow-hidden"
          >
            {/* Spacer to prevent overlap with fixed navbar */}
            <div className="h-20 shrink-0" />
 
            {/* Centered Navigation Links with layout animation, line spacings, and focus opacity */}
            <div className="flex flex-col w-full max-w-xs mx-auto my-auto overflow-y-auto py-2 no-scrollbar">
              {navLinks.map((link, idx) => {
                const isExpanded = expandedIndex === idx;
                const hasSublinks = !!link.subLinks && link.subLinks.length > 0;
                const isAnyExpanded = expandedIndex !== null;

                return (
                  <div 
                    key={link.label} 
                    className="w-full text-center flex flex-col border-b border-brand-navy/10 last:border-b-0"
                  >
                    <motion.a
                      href={link.href}
                      onClick={(e) => {
                        if (link.label === "Product") {
                          e.preventDefault();
                          setIsMobileMenuOpen(false);
                          onOpenProduct();
                        } else if (link.href === "#contact") {
                          e.preventDefault();
                          setIsMobileMenuOpen(false);
                          onOpenContact();
                        } else {
                          handleLinkClick(e, idx, hasSublinks);
                        }
                      }}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ 
                        y: 0,
                        opacity: isAnyExpanded ? (isExpanded ? 1 : 0.15) : 1
                      }}
                      transition={{
                        y: {
                          duration: 0.65,
                          delay: isMobileMenuOpen && !isAnyExpanded ? 0.35 + idx * 0.08 : 0,
                          ease: [0.25, 1, 0.5, 1]
                        },
                        opacity: {
                          duration: 0.45,
                          delay: isMobileMenuOpen && !isAnyExpanded ? 0.35 + idx * 0.08 : 0,
                          ease: [0.25, 1, 0.5, 1]
                        }
                      }}
                      className={`block py-5 font-boldonse text-4xl sm:text-5xl text-brand-navy font-bold uppercase tracking-tight cursor-pointer`}
                    >
                      {link.label}
                    </motion.a>
                    
                    <AnimatePresence initial={false}>
                      {isExpanded && hasSublinks && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col items-center gap-3.5 pb-5 pt-2">
                            {link.subLinks.map((subLink) => (
                              <a
                                key={subLink.label}
                                href={subLink.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="font-boldonse text-xl sm:text-2xl text-brand-navy/60 hover:text-brand-navy transition-all duration-200 uppercase tracking-tight cursor-pointer"
                              >
                                {subLink.label}
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
 
            {/* Bottom Actions with website theme styling */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.65,
                ease: [0.25, 1, 0.5, 1],
                delay: isMobileMenuOpen ? 0.6 : 0
              }}
              className="flex flex-col items-center gap-5 w-full max-w-xs mx-auto mb-6"
            >
              {/* Social Media Icons */}
              <div className="flex items-center justify-center gap-6 py-2">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-brand-navy/60 hover:text-brand-navy transition-colors cursor-pointer" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-brand-navy/60 hover:text-brand-navy transition-colors cursor-pointer" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-brand-navy/60 hover:text-brand-navy transition-colors cursor-pointer" aria-label="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-brand-navy/60 hover:text-brand-navy transition-colors cursor-pointer" aria-label="GitHub">
                  <Github className="w-5 h-5" />
                </a>
              </div>
 
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenConsole();
                }}
                className="w-full font-rethink font-bold text-base bg-brand-navy text-white py-3.5 rounded-full text-center hover:bg-brand-deepnavy hover:scale-102 active:scale-98 transition-all duration-300 shadow-[0_4px_15px_rgba(26,35,114,0.12)] cursor-pointer"
              >
                Try for free →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
