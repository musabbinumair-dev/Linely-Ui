import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  ChevronDown,
  Building,
  Copy,
  Check,
  ShieldCheck,
  Globe2,
  HelpCircle
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function Contact({ onGoHome }: { onGoHome?: () => void }) {
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("sales");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  
  // Interaction State
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [formState, setFormState] = useState<"idle" | "submitting" | "success">("idle");

  // Handle Copy to Clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Handle Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setFormState("submitting");

    // Simulate high-fidelity API server roundtrip
    setTimeout(() => {
      setFormState("success");
    }, 1200);
  };

  const handleResetForm = () => {
    setName("");
    setEmail("");
    setTopic("sales");
    setCompany("");
    setMessage("");
    setFormState("idle");
  };

  const faqs: FAQItem[] = [
    {
      question: "How does the real-time Operator Console sync with the queue?",
      answer: "The Linely Operator Console establishes low-latency state synchronization with your waiting lines. As soon as an operator taps 'Next', clients receive push notifications or dynamic screen updates instantly without refreshing."
    },
    {
      question: "Can we run simulations for multiple branches simultaneously?",
      answer: "Yes. In our Enterprise Tier, the Admin Control Center provides centralized multi-branch simulation grids, allowing you to load-test peak hours, lunch rushes, and staffing deficiencies across all your physical locations."
    },
    {
      question: "Is there hardware required for the ticket QR scanning?",
      answer: "No dedicated physical hardware is necessary. Operators can use any tablet, smartphone, or laptop camera directly via the browser. We also support standard USB scanner inputs out of the box."
    },
    {
      question: "Do you offer custom branding and white-labeling?",
      answer: "Absolutely. With our professional and enterprise plans, administrators can completely override system colors, logo text, ticket headers, SMS receipts, and kiosk displays from the Admin Control Center instantly."
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#f8fafc] overflow-hidden">
      
      {/* 1. Header Hero Visual Area (Inspired by service hub and pricing dark gradient theme with custom waves) */}
      <div className="relative bg-[#0B1033] text-white pt-32 pb-32 md:pt-40 md:pb-44 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Abstract Architectural Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
          style={{ 
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", 
            backgroundSize: "32px 32px" 
          }} 
        />
        
        {/* Premium SVG fractal noise texture overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.14] mix-blend-overlay pointer-events-none">
          <filter id="premium-noise-contact">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#premium-noise-contact)" />
        </svg>

        {/* Dynamic Slow-Pulsing Soft Ambient Glow Orbs */}
        <div className="absolute -top-40 right-10 w-[550px] h-[550px] bg-brand-cyan/20 rounded-full filter blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: "12s" }} />
        <div className="absolute -bottom-20 left-10 w-[500px] h-[500px] bg-brand-ocean/15 rounded-full filter blur-[110px] pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-brand-cream/10 rounded-full filter blur-[90px] pointer-events-none" />

        {/* Diagonal Light Streak Visual */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />

        {/* Intersecting Curved Liquid Waves (Pricing & Service Hub inspired transitions) */}
        <svg className="absolute bottom-0 left-0 w-full h-[35%] pointer-events-none translate-y-[2px] scale-y-[1.05] origin-bottom" viewBox="0 0 1440 240" preserveAspectRatio="none" shapeRendering="geometricPrecision">
          <defs>
            <linearGradient id="contact-wave-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1B2372" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#1A87C2" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0B1033" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="contact-wave-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00C3E3" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#1A2372" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          {/* Back overlapping wave */}
          <path d="M0,90 C360,30 720,150 1080,70 C1260,30 1360,110 1440,90 L1440,240 L0,240 Z" fill="url(#contact-wave-1)" />
          {/* Middle overlapping wave */}
          <path d="M0,130 C480,70 800,180 1152,110 C1300,80 1380,150 1440,130 L1440,240 L0,240 Z" fill="url(#contact-wave-2)" opacity="0.75" />
          {/* Front solid curve masking into the page background color (#f8fafc) */}
          <path d="M0,170 C360,130 720,210 1080,160 C1260,135 1360,190 1440,170 L1440,240 L0,240 Z" fill="#f8fafc" />
        </svg>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            id="contact-hero-eyebrow"
            className="inline-flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_32px_0_rgba(0,0,0,0.2)] text-white font-rethink text-[10px] md:text-xs font-light uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-8 select-none cursor-default"
          >
            Contact Our Team
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-boldonse text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            Connect with our <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-white to-brand-cream">Global Support Hub</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-cabin text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Have a question about high-fidelity queue configurations, enterprise-grade service level agreements, or white-label portal integrations? Our operations specialists are standing by.
          </motion.p>
        </div>
      </div>

      {/* 2. Main Content Area with full-width background to eliminate subpixel gaps/dividers on desktop */}
      <div className="bg-[#f8fafc] relative z-10 -mt-[2px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column (5/12): Corporate Details & Coordinates */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h3 className="font-rethink text-lg font-bold text-brand-navy tracking-tight flex items-center gap-2.5">
                <Building className="w-5 h-5 text-brand-cyan" />
                Corporate Directory
              </h3>
              <p className="font-cabin text-sm text-slate-500 leading-relaxed">
                Connect directly through our verified operational coordinates.
              </p>
            </div>

            {/* Headquarters Card */}
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(13,26,94,0.02)] space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-brand-navy/5 rounded-xl text-brand-navy shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-rethink text-sm font-bold text-brand-navy">Headquarters</h4>
                  <p className="font-cabin text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Linely Inc.<br />
                    100 Pine Street, Floor 18<br />
                    San Francisco, CA 94111<br />
                    United States
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Communication Channels */}
            <div className="space-y-4">
              {/* Sales Desk */}
              <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(13,26,94,0.02)] flex items-start gap-4 hover:border-brand-cyan/20 transition-all duration-300">
                <div className="p-2.5 bg-brand-cyan/10 rounded-xl text-brand-navy shrink-0">
                  <Mail className="w-5 h-5 text-brand-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-rethink text-[10px] font-bold uppercase tracking-wider text-brand-cyan">Sales & Licensing</span>
                  <h4 className="font-rethink text-sm font-bold text-brand-navy mt-0.5">Enterprise Accounts Desk</h4>
                  <p className="font-cabin text-xs text-slate-400 mt-1 leading-normal">
                    Volume licensing, SLA guarantees, and kiosk deployments.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="font-mono text-xs text-brand-navy font-semibold select-all">sales@linely.io</span>
                    <button
                      onClick={() => handleCopy("sales@linely.io", "Sales Email")}
                      className="p-1 rounded text-slate-400 hover:text-brand-cyan hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Copy email"
                    >
                      {copiedText === "Sales Email" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Technical Helpdesk */}
              <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(13,26,94,0.02)] flex items-start gap-4 hover:border-brand-cream/80 transition-all duration-300">
                <div className="p-2.5 bg-brand-cream/35 rounded-xl text-[#8B6B38] shrink-0">
                  <Globe2 className="w-5 h-5 text-brand-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-rethink text-[10px] font-bold uppercase tracking-wider text-slate-400">Technical Support</span>
                  <h4 className="font-rethink text-sm font-bold text-brand-navy mt-0.5">Platform Technical Support</h4>
                  <p className="font-cabin text-xs text-slate-400 mt-1 leading-normal">
                    Integrations, API keys, and console configuration support.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="font-mono text-xs text-brand-navy font-semibold select-all">support@linely.io</span>
                    <button
                      onClick={() => handleCopy("support@linely.io", "Support Email")}
                      className="p-1 rounded text-slate-400 hover:text-brand-cyan hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Copy email"
                    >
                      {copiedText === "Support Email" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (7/12): Form & FAQ */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Contact Form Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_12px_40px_-10px_rgba(13,26,94,0.04)]">
              
              <AnimatePresence mode="wait">
                {formState !== "success" ? (
                  <motion.div
                    key="form-view"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h3 className="font-rethink text-lg font-bold text-brand-navy tracking-tight mb-6">Send Us a Message</h3>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      
                      {/* Name & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full font-cabin text-sm bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-brand-cyan focus:bg-white rounded-xl px-4 py-3 outline-none transition-all duration-200 text-brand-navy"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">Email Address *</label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@company.com"
                            className="w-full font-cabin text-sm bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-brand-cyan focus:bg-white rounded-xl px-4 py-3 outline-none transition-all duration-200 text-brand-navy"
                          />
                        </div>
                      </div>

                      {/* Topic & Company */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">Inquiry Topic</label>
                          <div className="relative">
                            <select
                              value={topic}
                              onChange={(e) => setTopic(e.target.value)}
                              className="w-full font-cabin text-sm bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-brand-cyan focus:bg-white rounded-xl px-4 py-3 outline-none transition-all duration-200 text-brand-navy appearance-none pr-10"
                            >
                              <option value="sales">Sales & Custom Deployments</option>
                              <option value="support">Technical Helpdesk</option>
                              <option value="partnerships">Strategic Partnerships</option>
                              <option value="general">General Inquiries</option>
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">Company Name</label>
                          <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="Acme Corp"
                            className="w-full font-cabin text-sm bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-brand-cyan focus:bg-white rounded-xl px-4 py-3 outline-none transition-all duration-200 text-brand-navy"
                          />
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">Message *</label>
                        <textarea
                          required
                          rows={5}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="How can we help optimize your physical locations and wait queues?"
                          className="w-full font-cabin text-sm bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-brand-cyan focus:bg-white rounded-xl px-4 py-3 outline-none transition-all duration-200 text-brand-navy resize-none"
                        />
                      </div>

                      {/* Submit */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={formState === "submitting"}
                          className="w-full font-rethink font-bold text-sm bg-brand-navy text-white hover:bg-brand-deepnavy hover:scale-[1.01] px-6 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-brand-navy shadow-sm active:scale-[0.99] disabled:opacity-80 disabled:cursor-wait"
                        >
                          {formState === "submitting" ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Sending Message...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 text-brand-cyan" />
                              Send Message
                            </>
                          )}
                        </button>
                      </div>

                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-8"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <h3 className="font-rethink text-xl font-bold text-brand-navy tracking-tight">
                      Message Sent Successfully
                    </h3>
                    
                    <p className="font-cabin text-sm text-slate-500 mt-3 max-w-sm mx-auto leading-relaxed">
                      Thank you for contacting us, <span className="font-bold text-brand-navy">{name}</span>. A representative from our team will review your inquiry and get back to you shortly.
                    </p>

                    <button
                      onClick={handleResetForm}
                      className="mt-8 px-5 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 font-rethink text-xs font-bold text-brand-navy transition-colors cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* FAQs */}
            <div className="space-y-4">
              <h3 className="font-rethink text-lg font-bold text-brand-navy tracking-tight flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-brand-cyan" />
                Frequently Asked Questions
              </h3>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-slate-100 hover:border-slate-200/60 rounded-xl transition-all duration-300 overflow-hidden shadow-sm"
                    >
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-rethink text-sm font-bold text-brand-navy cursor-pointer select-none"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-brand-cyan" : ""}`} />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                          >
                            <div className="px-5 pb-5 pt-0 font-cabin text-xs text-slate-500 leading-relaxed border-t border-slate-50">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
      </div>
    </div>
  );
}
