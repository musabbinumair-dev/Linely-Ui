import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Check, 
  ArrowRight, 
  Smartphone, 
  Layers, 
  Monitor, 
  MessageSquare, 
  BarChart3, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  Tv,
  Clock,
  Shield,
  PhoneCall,
  Activity,
  Heart,
  Briefcase,
  Building,
  ShoppingBag
} from "lucide-react";

export default function ProductPage({
  onStart,
  onOpenContact,
  initialSection,
  onClearInitialSection,
}: {
  onStart: () => void;
  onOpenContact: () => void;
  initialSection?: string;
  onClearInitialSection?: () => void;
}) {
  const [activeStep, setActiveStep] = useState<number>(0);

  // Handle anchor-scroll on mount/initialSection updates
  useEffect(() => {
    if (initialSection) {
      const element = document.getElementById(initialSection);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 180);
      }
      onClearInitialSection?.();
    }
  }, [initialSection]);

  // Steps configuration (Deep 3-Step Process)
  const steps = [
    {
      num: "01",
      title: "Join the Queue Comfortably",
      subtitle: "Multiple touchpoints for zero-friction entry",
      desc: "Linely breaks down reception barriers by offering various self-registration pathways. Visitors can sign in remotely, book virtual tickets, or use intuitive lobby tablet kiosks — instantly giving them peace of mind and live transparency.",
      bullets: [
        "Instant QR Code scan-to-join requires zero software installation or logins",
        "Self-service tablet kiosks optimized for clear, rapid data input",
        "Flexible remote web booking portals to sign in before arrival",
        "Specialized priority token capture for elderly, pregnant, or disabled guests",
        "Live web-ticket ETAs on personal mobile devices reduce perceived wait times"
      ],
      targetId: "self-service"
    },
    {
      num: "02",
      title: "Serve Customers Dynamically",
      subtitle: "Command desk interfaces built for operational speed",
      desc: "Front-line operators get a centralized view of all waiting guests, triaged by category and wait times. One-click controls call customers, assign counters, record resolution outcomes, and broadcast status details synchronously to lobby monitors.",
      bullets: [
        "Real-time ticket rows with intuitive urgency-color triggers (SignalR powered)",
        "Counter assignment options matching specific staff skills to visitor requirements",
        "Lobby display notifications called with instant audio announcements",
        "Single-click customer transfers between distinct departments",
        "Integrated service note logs and visit history details visible on arrival"
      ],
      targetId: "command-center"
    },
    {
      num: "03",
      title: "Analyze & Optimize Operations",
      subtitle: "Turn wait data into smart staffing layouts",
      desc: "Stop guessing your staffing needs. Linely captures precise timing metrics for every single step of the visitor path, compiling deep intelligence dashboards that reveal peak workloads, queue bottlenecks, and staff service speeds.",
      bullets: [
        "Hourly heatmaps showing historical peak lobby traffic trends",
        "Detailed wait duration averages, service duration metrics, and drop-out rates",
        "Operator performance metrics with clear counter service averages",
        "Exportable PDF and CSV reports for compliance reviews and board meetings",
        "Direct integration pipelines feeding shift schedule builders automatically"
      ],
      targetId: "analytics"
    }
  ];

  return (
    <div className="bg-[#FCF9F2] min-h-screen text-slate-900 selection:bg-brand-cyan selection:text-brand-navy font-cabin overflow-hidden">
      
      {/* SECTION 1: PRODUCT HERO */}
      <section className="relative bg-brand-navy text-white pt-40 md:pt-48 pb-24 md:pb-32 overflow-hidden border-b-2 border-brand-cyan/20">
        
        {/* Abstract vector queue lines background graphic (Low opacity, highly stylized) */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-15 select-none">
          <svg className="w-full h-full min-w-[1200px]" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M-100 600 C 300 800, 500 200, 1000 500 C 1200 600, 1300 700, 1600 500" stroke="#00C3E3" strokeWidth="6" strokeLinecap="round" />
            <path d="M-100 450 C 200 650, 600 150, 900 400 C 1100 550, 1300 500, 1600 350" stroke="#1A87C2" strokeWidth="4" strokeLinecap="round" />
            <path d="M-100 300 C 400 400, 700 100, 1100 300 C 1300 400, 1400 300, 1600 200" stroke="#00C3E3" strokeWidth="3" strokeDasharray="10 15" strokeLinecap="round" />
            <path d="M-100 150 C 350 300, 650 50, 1050 200 C 1250 300, 1350 150, 1600 100" stroke="#1A87C2" strokeWidth="2" strokeLinecap="round" />
            {/* Soft decorative dots representing guests along lines */}
            <circle cx="280" cy="650" r="10" fill="#00C3E3" />
            <circle cx="510" cy="400" r="12" fill="#1A87C2" />
            <circle cx="820" cy="280" r="8" fill="#00C3E3" />
            <circle cx="1120" cy="380" r="14" fill="#00C3E3" />
            <circle cx="1320" cy="250" r="9" fill="#1A87C2" />
          </svg>
        </div>

        {/* Soft elegant gradient mesh blending to blend perfectly with brand-navy */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/30 via-transparent to-brand-navy pointer-events-none z-0" />

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan font-rethink text-[10px] md:text-xs font-bold uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-8 select-none"
          >
            Product Overview
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-boldonse text-5xl sm:text-6xl md:text-7xl leading-[1.12] tracking-normal mb-8 font-extrabold max-w-4xl text-center"
          >
            The Complete Lobby<br />
            <span className="bg-gradient-to-r from-white via-brand-cream to-brand-cyan bg-clip-text text-transparent">Queuing Ecosystem</span>
          </motion.h1>

          {/* Supporting Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-cabin text-base sm:text-lg md:text-xl text-[#9BAECF] max-w-2xl mb-12 leading-relaxed"
          >
            Go deeper than the homepage overview. Explore our end-to-end queuing ecosystem built to optimize every arrival, streamline lobby traffic, and capture rich operational insights.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4"
          >
            <button
              onClick={onStart}
              className="w-full sm:w-auto font-rethink font-bold text-lg bg-brand-cyan text-brand-navy px-9 py-4.5 rounded-full shadow-lg shadow-brand-cyan/15 hover:bg-white hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              Try for Free
            </button>
            <button
              onClick={onOpenContact}
              className="w-full sm:w-auto font-rethink font-bold text-lg border-2 border-white text-white px-9 py-4.5 rounded-full hover:bg-white hover:text-brand-navy hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              Book a Demo
            </button>
          </motion.div>
        </div>
      </section>


      {/* SECTION 2: DEEP 3-STEP PROCESS (EXPANDED FROM HOMEPAGE) */}
      <section id="how-it-works" className="py-24 md:py-32 px-6 bg-[#FCF9F2] relative">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center justify-center bg-brand-navy/10 border border-brand-navy/10 text-brand-navy font-rethink text-[10px] md:text-xs font-bold uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-5 select-none">
              Step-by-Step Architecture
            </span>
            <h2 className="font-boldonse text-4xl sm:text-5xl md:text-6xl text-brand-navy tracking-tight leading-none mb-6 font-extrabold">
              How the System Works
            </h2>
            <p className="font-cabin text-base sm:text-lg text-slate-500 leading-relaxed">
              Linely replaces physical chaos with three simple, real-time operating blocks that keep visitors, operators, and administrators synchronized instantly.
            </p>
          </div>

          {/* Interactive Steps Pill-Tabs */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-16">
            {steps.map((step, idx) => (
              <button
                key={step.num}
                onClick={() => setActiveStep(idx)}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-rethink text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                  activeStep === idx
                    ? "bg-brand-navy text-white shadow-lg shadow-brand-navy/15 scale-105"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60"
                }`}
              >
                <span className={`text-[10px] tracking-widest ${activeStep === idx ? "text-brand-cyan" : "text-brand-ocean"}`}>{step.num}.</span>
                <span>{step.title.split(" ")[0]} {step.title.split(" ")[1]}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Cards with Alternating Layout per step */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-8 md:p-14 shadow-[0_15px_40px_rgba(13,26,94,0.02)] min-h-[500px] flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              {steps.map((step, idx) => {
                if (activeStep !== idx) return null;
                const isEven = idx % 2 === 0;

                return (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full ${
                      isEven ? "" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Step Visual Illustration (Left on Even, Right on Odd) */}
                    <div className={`lg:col-span-6 w-full flex justify-center ${isEven ? "order-2 lg:order-1" : "order-2"}`}>
                      <div className="w-full max-w-md bg-gradient-to-br from-brand-cream/60 to-slate-100/40 border border-slate-100 rounded-2xl p-6 sm:p-8 flex flex-col items-center shadow-inner relative overflow-hidden">
                        
                        {/* Custom High-Contrast SVG Drawing representing each step */}
                        {idx === 0 && (
                          <div className="w-full relative flex flex-col items-center">
                            <svg className="w-48 h-48 text-brand-navy mb-4" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="50" y="20" width="100" height="160" rx="14" fill="#0D1A5E" stroke="#1A87C2" strokeWidth="4" />
                              <rect x="60" y="30" width="80" height="110" rx="8" fill="#FDFCF9" />
                              <circle cx="100" cy="165" r="8" fill="#1A87C2" />
                              {/* QR Representation inside Screen */}
                              <rect x="80" y="45" width="40" height="40" rx="4" fill="#0D1A5E" />
                              <rect x="85" y="50" width="12" height="12" fill="#FDFCF9" />
                              <rect x="103" y="50" width="12" height="12" fill="#FDFCF9" />
                              <rect x="85" y="68" width="12" height="12" fill="#FDFCF9" />
                              <rect x="103" y="68" width="5" height="5" fill="#FDFCF9" />
                              <rect x="110" y="73" width="5" height="7" fill="#00C3E3" />
                              {/* Kiosk Sign In Pill */}
                              <rect x="75" y="100" width="50" height="14" rx="7" fill="#00C3E3" />
                              <line x1="85" y1="107" x2="115" y2="107" stroke="#0D1A5E" strokeWidth="3" strokeLinecap="round" />
                              {/* Decorative Float Priorities */}
                              <g className="animate-bounce">
                                <rect x="10" y="30" width="45" height="20" rx="6" fill="#00C3E3" />
                                <text x="18" y="43" fill="#0D1A5E" fontSize="9" fontWeight="bold">VIP #1</text>
                              </g>
                              <g className="translate-y-12">
                                <rect x="142" y="50" width="50" height="20" rx="6" fill="#1A87C2" />
                                <text x="148" y="63" fill="#FDFCF9" fontSize="9" fontWeight="bold">Priority</text>
                              </g>
                            </svg>
                            <div className="text-center mt-2">
                              <span className="font-rethink text-xs font-extrabold uppercase tracking-widest text-brand-ocean">Virtual Token Issued</span>
                              <div className="font-boldonse text-3xl font-black text-brand-navy mt-1">#A-492</div>
                            </div>
                          </div>
                        )}

                        {idx === 1 && (
                          <div className="w-full relative flex flex-col items-center">
                            <svg className="w-48 h-48 text-brand-navy mb-4" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                              {/* Counter Panel Frame */}
                              <rect x="20" y="30" width="160" height="110" rx="12" fill="#0D1A5E" stroke="#00C3E3" strokeWidth="4" />
                              <rect x="30" y="40" width="140" height="70" rx="6" fill="#FDFCF9" />
                              <rect x="20" y="140" width="160" height="15" fill="#1A87C2" />
                              <circle cx="100" cy="155" r="5" fill="#0D1A5E" />
                              {/* Caller Row 1 */}
                              <rect x="40" y="50" width="120" height="22" rx="4" fill="#0D1A5E" />
                              <text x="48" y="64" fill="#00C3E3" fontSize="9" fontWeight="bold">Serving: #A-492</text>
                              <rect x="125" y="54" width="30" height="14" rx="4" fill="#1A87C2" />
                              <text x="129" y="63" fill="#FDFCF9" fontSize="7" fontWeight="bold">DESK 1</text>
                              {/* Caller Row 2 */}
                              <rect x="40" y="78" width="120" height="22" rx="4" fill="#FCF9F2" stroke="#E2D1B7" strokeWidth="1.5" />
                              <text x="48" y="92" fill="#0D1A5E" fontSize="9" fontWeight="bold">Next: #B-205</text>
                              <rect x="125" y="82" width="30" height="14" rx="4" fill="#0D1A5E" />
                              <text x="129" y="91" fill="#FDFCF9" fontSize="7" fontWeight="bold">DESK 2</text>
                              {/* Signal Ripples */}
                              <path d="M 85 20 Q 100 5 115 20" stroke="#00C3E3" strokeWidth="3" strokeLinecap="round" fill="none" className="animate-pulse" />
                              <path d="M 75 13 Q 100 -5 125 13" stroke="#1A87C2" strokeWidth="2" strokeLinecap="round" fill="none" />
                            </svg>
                            <div className="text-center mt-2 flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span className="font-rethink text-xs font-extrabold uppercase tracking-widest text-slate-500">Live Broadcaster Active</span>
                            </div>
                          </div>
                        )}

                        {idx === 2 && (
                          <div className="w-full relative flex flex-col items-center">
                            <svg className="w-48 h-48 text-brand-navy mb-4" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="20" y="20" width="160" height="160" rx="16" fill="#FDFCF9" stroke="#1A87C2" strokeWidth="3" />
                              {/* Chart Bars */}
                              <rect x="45" y="110" width="18" height="40" rx="3" fill="#0D1A5E" />
                              <rect x="75" y="70" width="18" height="80" rx="3" fill="#1A87C2" />
                              <rect x="105" y="40" width="18" height="110" rx="3" fill="#00C3E3" />
                              <rect x="135" y="90" width="18" height="60" rx="3" fill="#0D1A5E" />
                              {/* X-axis Line */}
                              <line x1="35" y1="150" x2="165" y2="150" stroke="#0D1A5E" strokeWidth="3" strokeLinecap="round" />
                              {/* Connecting Curve */}
                              <path d="M 54 105 Q 84 65 114 35 T 144 85" stroke="#E58344" strokeWidth="4" strokeLinecap="round" fill="none" />
                              {/* Circles at data points */}
                              <circle cx="114" cy="35" r="6" fill="#0D1A5E" stroke="#00C3E3" strokeWidth="2" />
                            </svg>
                            <div className="text-center mt-2">
                              <span className="font-rethink text-xs font-extrabold uppercase tracking-widest text-emerald-500">Peak Performance Detected</span>
                              <div className="font-cabin text-xs text-slate-400 mt-0.5">Average Service: 4.8m (Fastest)</div>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Step Text Information */}
                    <div className={`lg:col-span-6 flex flex-col items-start text-left ${isEven ? "order-1 lg:order-2" : "order-1"}`}>
                      <span className="font-rethink text-6xl font-black text-brand-cyan/25 leading-none mb-4 select-none">
                        {step.num}
                      </span>
                      <h3 className="font-boldonse text-3xl sm:text-4xl text-brand-navy font-bold leading-tight mb-3">
                        {step.title}
                      </h3>
                      <p className="font-rethink text-sm font-bold text-brand-ocean uppercase tracking-wider mb-6">
                        {step.subtitle}
                      </p>
                      <p className="font-cabin text-base text-slate-600 leading-relaxed mb-8">
                        {step.desc}
                      </p>

                      <ul className="space-y-4 w-full">
                        {step.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-brand-cyan/15 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3.5 h-3.5 text-brand-navy" />
                            </div>
                            <span className="font-cabin text-sm sm:text-base text-slate-700 leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>
      </section>


      {/* SECTION 3: FEATURE DEEP-DIVE (6 Alternating sections, Cream/Navy) */}
      <section id="features" className="py-0 relative overflow-hidden">
        
        {/* Feature 1: Self-Service Check-In (Cream Background) */}
        <div id="self-service" className="bg-[#FCF9F2] py-24 md:py-32 px-6 border-b border-slate-200/40">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Text side */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              <span className="inline-flex items-center justify-center bg-brand-navy/5 border border-brand-navy/10 text-brand-navy font-rethink text-[10px] md:text-xs font-bold uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-6 select-none">
                Self-Service Check-In
              </span>
              <h3 className="font-boldonse text-3xl sm:text-4xl md:text-5xl text-brand-navy font-bold leading-tight mb-6">
                Frictionless Check-In, Anywhere, Anytime
              </h3>
              <p className="font-cabin text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
                Allow visitors to join your queues on their own terms. Whether scanning QR codes at the door, signing in remotely before arrival, or checking in via intuitive lobby tablet kiosks, Linely automates the registration process and prevents overcrowding.
              </p>
              <ul className="space-y-4 w-full">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-700">QR Code scan-to-join requires zero app downloads or logins</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-700">Self-service tablet kiosks designed for heavy, multi-language lobby traffic</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-700">Remote sign-in links via SMS updates or customizable web booking portals</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-700">Priority token capture specifically for Elderly, Pregnant, Disabled, or Emergency guests</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-700">Custom fields to capture specific visit reasons before arrivals</span>
                </li>
              </ul>
            </div>

            {/* Illustration side */}
            <div className="lg:col-span-6 w-full flex justify-center">
              <div className="w-full max-w-md bg-white border border-slate-200/50 rounded-3xl p-8 shadow-md flex items-center justify-center">
                <svg className="w-full h-auto max-w-[280px]" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Digital kiosk backdrop */}
                  <rect x="30" y="10" width="140" height="220" rx="16" fill="#0D1A5E" />
                  <rect x="40" y="20" width="120" height="170" rx="8" fill="#FDFCF9" />
                  <circle cx="100" cy="205" r="10" fill="#1A87C2" />
                  
                  {/* Smartphone overlay */}
                  <rect x="100" y="100" width="75" height="120" rx="10" fill="#1A87C2" stroke="#FDFCF9" strokeWidth="3" />
                  <rect x="106" y="106" width="63" height="96" rx="6" fill="#0D1A5E" />
                  
                  {/* Check-in Successful UI */}
                  <circle cx="137" cy="140" r="14" fill="#00C3E3" />
                  <path d="M 132 140 L 135 143 L 142 136" stroke="#0D1A5E" strokeWidth="2.5" strokeLinecap="round" />
                  <rect x="114" y="165" width="46" height="6" rx="3" fill="#FDFCF9" />
                  <rect x="120" y="176" width="34" height="4" rx="2" fill="#1A87C2" />
                  
                  {/* Kiosk Screen content */}
                  <rect x="52" y="32" width="96" height="14" rx="3" fill="#0D1A5E" />
                  <rect x="62" y="37" width="76" height="4" rx="2" fill="#00C3E3" />
                  <rect x="52" y="55" width="44" height="24" rx="4" fill="#E2D1B7" />
                  <rect x="104" y="55" width="44" height="24" rx="4" fill="#0D1A5E" />
                  <rect x="52" y="86" width="96" height="24" rx="4" fill="#1A87C2" />
                  <circle cx="70" cy="67" r="5" fill="#0D1A5E" />
                  <circle cx="122" cy="67" r="5" fill="#00C3E3" />
                  
                  {/* Scan Line Link */}
                  <path d="M 100 135 L 75 135" stroke="#00C3E3" strokeWidth="2" strokeDasharray="4 4" />
                </svg>
              </div>
            </div>

          </div>
        </div>

        {/* Feature 2: Configurable Service Flows (Navy Background) */}
        <div id="configurable-flows" className="bg-brand-navy py-24 md:py-32 px-6 border-b border-white/5 text-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Illustration side (Left on desktop) */}
            <div className="lg:col-span-6 w-full flex justify-center order-2 lg:order-1">
              <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl flex items-center justify-center">
                <svg className="w-full h-auto max-w-[280px]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Routing Nodes Diagram */}
                  <circle cx="40" cy="100" r="16" fill="#00C3E3" />
                  <path d="M 40 100 L 90 60" stroke="#00C3E3" strokeWidth="3" />
                  <path d="M 40 100 L 90 140" stroke="#1A87C2" strokeWidth="3" />
                  
                  <rect x="90" y="44" width="75" height="32" rx="6" fill="#1A87C2" stroke="#FDFCF9" strokeWidth="1.5" />
                  <rect x="90" y="124" width="75" height="32" rx="6" fill="#0D1A5E" stroke="#00C3E3" strokeWidth="1.5" />
                  
                  {/* Inner text descriptors */}
                  <text x="100" y="63" fill="#FDFCF9" fontSize="8" fontWeight="bold">Counter 1</text>
                  <text x="100" y="143" fill="#FDFCF9" fontSize="8" fontWeight="bold">Specialist</text>
                  
                  {/* Icon details */}
                  <rect x="32" y="92" width="16" height="16" rx="4" fill="#0D1A5E" />
                  <circle cx="40" cy="100" r="4" fill="#00C3E3" />
                  
                  {/* Branch indicators */}
                  <circle cx="70" cy="76" r="3" fill="#00C3E3" />
                  <circle cx="70" cy="124" r="3" fill="#1A87C2" />
                  
                  {/* Connection overlay badge */}
                  <rect x="135" y="80" width="55" height="24" rx="12" fill="#E58344" />
                  <text x="143" y="94" fill="#FDFCF9" fontSize="6.5" fontWeight="bold">DYNAMIC</text>
                </svg>
              </div>
            </div>

            {/* Text side */}
            <div className="lg:col-span-6 flex flex-col items-start text-left order-1 lg:order-2">
              <span className="inline-flex items-center justify-center bg-white/10 border border-white/10 text-brand-cyan font-rethink text-[10px] md:text-xs font-bold uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-6 select-none">
                Dynamic Routing
              </span>
              <h3 className="font-boldonse text-3xl sm:text-4xl md:text-5xl text-white font-bold leading-tight mb-6">
                Configurable Service Paths for Every Visitor
              </h3>
              <p className="font-cabin text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
                Lobbies aren&apos;t uniform, and neither are customer needs. Linely gives you a dynamic routing engine that guides visitors to the correct counter or advisor, balancing workloads and adjusting paths automatically based on wait times or agent availability.
              </p>
              <ul className="space-y-4 w-full">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-200">Multi-department service routing with custom triage questions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-200">Dynamic re-routing during peak hours or unexpected agent absences</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-200">Expertise-based matching to pair customers with the right specialist</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-200">Automated balance rules to distribute workloads evenly across counters</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-200">Transfer tickets between departments with a single click</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Feature 3: Central Command Center (Cream Background) */}
        <div id="command-center" className="bg-[#FCF9F2] py-24 md:py-32 px-6 border-b border-slate-200/40">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Text side */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              <span className="inline-flex items-center justify-center bg-brand-navy/5 border border-brand-navy/10 text-brand-navy font-rethink text-[10px] md:text-xs font-bold uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-6 select-none">
                Real-Time Command
              </span>
              <h3 className="font-boldonse text-3xl sm:text-4xl md:text-5xl text-brand-navy font-bold leading-tight mb-6">
                The Unified Operator Dashboard
              </h3>
              <p className="font-cabin text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
                Give your front-line team the ultimate operational command center. Staff can view active tickets, monitor live wait times, call guests, assign desks, and record service outcomes in a beautiful, low-stress interface built for speed.
              </p>
              <ul className="space-y-4 w-full">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-700">Live ticket queues with colored priority trackers and duration indicators</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-700">One-click &apos;Call Next&apos; and instant desk reassignment controls</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-700">Customer history cards and resolution notes visible upon arrival</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-700">Counter status selectors (Serving, Break, Administrative Work)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-700">Direct queue announcement broadcaster for waiting room screens</span>
                </li>
              </ul>
            </div>

            {/* Illustration side */}
            <div className="lg:col-span-6 w-full flex justify-center">
              <div className="w-full max-w-md bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-md">
                {/* Admin console simulation mockup */}
                <div className="rounded-xl border border-slate-100 overflow-hidden text-left shadow-lg">
                  <div className="bg-brand-navy p-3 flex items-center justify-between text-white">
                    <span className="font-rethink text-xs font-bold">Counter Operations Control</span>
                    <span className="bg-brand-cyan/20 text-brand-cyan font-mono text-[9px] px-2 py-0.5 rounded">COUNTER 3</span>
                  </div>
                  <div className="p-4 space-y-3.5 bg-white">
                    <div className="flex items-center justify-between text-xs border-b pb-2">
                      <span className="text-slate-400">Current Queue State</span>
                      <span className="text-brand-ocean font-bold">12 Waiting</span>
                    </div>
                    {/* Guest call simulation */}
                    <div className="flex items-center justify-between bg-[#FCF9F2] p-3 rounded-xl border border-[#E2D1B7]">
                      <div>
                        <span className="font-rethink text-sm font-bold text-brand-navy">Sophia Watson</span>
                        <div className="font-mono text-[9px] text-slate-400">#A-492 &bull; Triage Level 2</div>
                      </div>
                      <span className="bg-brand-cyan text-brand-navy font-rethink text-[10px] font-bold px-3 py-1.5 rounded-full cursor-pointer hover:bg-brand-navy hover:text-white transition-colors">
                        CALL GUEST
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-brand-ocean h-full w-[65%]" />
                      </div>
                      <p className="font-cabin text-[10px] text-slate-400 text-right">Lobby wait metrics: normal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Feature 4: Proactive SMS Notifications (Navy Background) */}
        <div id="sms-notifications" className="bg-brand-navy py-24 md:py-32 px-6 border-b border-white/5 text-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Illustration side (Left on desktop) */}
            <div className="lg:col-span-6 w-full flex justify-center order-2 lg:order-1">
              <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl flex items-center justify-center">
                <svg className="w-full h-auto max-w-[280px]" viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Smartphone message simulation */}
                  <rect x="40" y="10" width="120" height="200" rx="16" fill="#0D1A5E" stroke="#1A87C2" strokeWidth="4" />
                  <rect x="48" y="20" width="104" height="150" rx="6" fill="#FDFCF9" />
                  
                  {/* Message Bubble */}
                  <rect x="56" y="36" width="88" height="48" rx="8" fill="#1A87C2" />
                  <path d="M 66 84 L 56 94 L 56 84 Z" fill="#1A87C2" />
                  
                  {/* Message Lines */}
                  <rect x="66" y="46" width="68" height="5" rx="2.5" fill="#FDFCF9" />
                  <rect x="66" y="56" width="68" height="5" rx="2.5" fill="#FDFCF9" />
                  <rect x="66" y="66" width="44" height="5" rx="2.5" fill="#00C3E3" />
                  
                  {/* Response bubble */}
                  <rect x="64" y="106" width="80" height="36" rx="8" fill="#E2D1B7" />
                  <path d="M 134 142 L 144 152 L 144 142 Z" fill="#E2D1B7" />
                  <rect x="74" y="116" width="60" height="5" rx="2.5" fill="#0D1A5E" />
                  <rect x="74" y="126" width="40" height="5" rx="2.5" fill="#0D1A5E" />
                  
                  {/* Home indicator */}
                  <circle cx="100" cy="185" r="8" fill="#1A87C2" />
                </svg>
              </div>
            </div>

            {/* Text side */}
            <div className="lg:col-span-6 flex flex-col items-start text-left order-1 lg:order-2">
              <span className="inline-flex items-center justify-center bg-white/10 border border-white/10 text-brand-cyan font-rethink text-[10px] md:text-xs font-bold uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-6 select-none">
                Customer Engagement
              </span>
              <h3 className="font-boldonse text-3xl sm:text-4xl md:text-5xl text-white font-bold leading-tight mb-6">
                Keep Customers Connected on the Move
              </h3>
              <p className="font-cabin text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
                Eliminate lobby stress by keeping your visitors informed at all times. Linely sends automatic, highly personalized text alerts as their turn approaches, giving them back their time and allowing them to wait anywhere they choose.
              </p>
              <ul className="space-y-4 w-full">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-200">Instant check-in confirmation text with customized live tracking web link</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-200">Proactive warning alerts when estimated wait times exceed predetermined thresholds</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-200">Two-way SMS capabilities enabling visitors to easily request more time or cancel</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-200">Personalized &apos;Your Turn&apos; summons indicating designated counter desk numbers</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-200">Post-service customer satisfaction surveys (CSAT) delivered automatically</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Feature 5: Service Intelligence & Analytics (Cream Background) */}
        <div id="analytics" className="bg-[#FCF9F2] py-24 md:py-32 px-6 border-b border-slate-200/40">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Text side */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              <span className="inline-flex items-center justify-center bg-brand-navy/5 border border-brand-navy/10 text-brand-navy font-rethink text-[10px] md:text-xs font-bold uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-6 select-none">
                Data Intelligence
              </span>
              <h3 className="font-boldonse text-3xl sm:text-4xl md:text-5xl text-brand-navy font-bold leading-tight mb-6">
                Turn Wait Times into Operational Metrics
              </h3>
              <p className="font-cabin text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
                Get deep, actionable intelligence about your operations automatically. Linely gathers granular service data across all locations, helping you identify bottlenecks, measure staff performance, and optimize schedules based on real metrics.
              </p>
              <ul className="space-y-4 w-full">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-700">Granular hourly heatmaps highlighting peak customer arrivals</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-700">Average wait durations, no-show rates, and service resolution speeds</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-700">Staff performance tracking and comparison across locations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-700">Historical trend reports available for PDF, CSV, or direct API export</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-700">Service insights feed directly into automated shift scheduling engines</span>
                </li>
              </ul>
            </div>

            {/* Illustration side */}
            <div className="lg:col-span-6 w-full flex justify-center">
              <div className="w-full max-w-md bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-md">
                <div className="text-left">
                  <span className="font-rethink text-xs font-extrabold uppercase tracking-widest text-brand-ocean block mb-1">Weekly Intelligence</span>
                  <div className="font-boldonse text-2xl text-brand-navy font-bold mb-4">Lobby Metrics Tracker</div>
                  
                  {/* Heatmap visualization block */}
                  <div className="grid grid-cols-5 gap-2.5 mb-6">
                    {Array.from({ length: 15 }).map((_, i) => {
                      const colors = [
                        "bg-[#0D1A5E]", 
                        "bg-[#1A87C2]", 
                        "bg-[#00C3E3]", 
                        "bg-[#FCF9F2] border border-slate-200"
                      ];
                      const randBg = colors[i % colors.length];
                      return (
                        <div key={i} className={`h-8 rounded-md ${randBg} flex items-center justify-center`}>
                          <span className="text-[8px] font-mono opacity-85">{(i * 12 + 10) % 60}m</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-4 text-xs text-slate-500">
                    <span>Performance index: <strong className="text-emerald-500">OPTIMAL</strong></span>
                    <span>100% cloud synced</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Feature 6: Secure & Compliant by Design (Navy Background) */}
        <div id="security-compliance" className="bg-brand-navy py-24 md:py-32 px-6 border-b border-white/5 text-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Illustration side (Left on desktop) */}
            <div className="lg:col-span-6 w-full flex justify-center order-2 lg:order-1">
              <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl flex items-center justify-center">
                <svg className="w-full h-auto max-w-[280px]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Security shield with compliance lock */}
                  <path d="M 100 30 C 130 30 160 40 160 70 C 160 120 120 160 100 170 C 80 160 40 120 40 70 C 40 40 70 30 100 30 Z" fill="#0D1A5E" stroke="#00C3E3" strokeWidth="4" />
                  
                  {/* Key padlock inside shield */}
                  <rect x="75" y="90" width="50" height="40" rx="8" fill="#1A87C2" />
                  <path d="M 85 90 L 85 75 C 85 65 115 65 115 75 L 115 90" stroke="#00C3E3" strokeWidth="4" strokeLinecap="round" fill="none" />
                  
                  {/* Compliance check pill */}
                  <circle cx="100" cy="110" r="8" fill="#00C3E3" />
                  <path d="M 96 110 L 99 113 L 104 107" stroke="#0D1A5E" strokeWidth="2" strokeLinecap="round" />
                  
                  {/* Orbiting certifications labels */}
                  <g className="translate-x-12 -translate-y-8">
                    <rect x="100" y="60" width="45" height="18" rx="9" fill="#E58344" />
                    <text x="108" y="72" fill="#FDFCF9" fontSize="8" fontWeight="bold">SOC 2</text>
                  </g>
                  <g className="-translate-x-12 translate-y-12">
                    <rect x="25" y="60" width="45" height="18" rx="9" fill="#1A87C2" />
                    <text x="32" y="72" fill="#FDFCF9" fontSize="8" fontWeight="bold">HIPAA</text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Text side */}
            <div className="lg:col-span-6 flex flex-col items-start text-left order-1 lg:order-2">
              <span className="inline-flex items-center justify-center bg-white/10 border border-white/10 text-brand-cyan font-rethink text-[10px] md:text-xs font-bold uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-6 select-none">
                Enterprise Security
              </span>
              <h3 className="font-boldonse text-3xl sm:text-4xl md:text-5xl text-white font-bold leading-tight mb-6">
                Bank-Grade Trust and Global Compliance
              </h3>
              <p className="font-cabin text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
                Your customer data privacy is our highest priority. Built with end-to-end security architectures and compliant with strict global frameworks, Linely ensures customer identities and access logs are fully safeguarded and audited.
              </p>
              <ul className="space-y-4 w-full">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-200">Fully aligned with HIPAA, GDPR, and SOC 2 Type II controls</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-200">Automatic data sanitization and customer record masking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-200">Secure role-based access control (RBAC) with Single Sign-On (SSO)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-200">Comprehensive system audit logs (connected directly to our Audit Logs system)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="font-cabin text-sm sm:text-base text-slate-200">256-bit AES encryption at rest and TLS 1.3 encryption in transit</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </section>


      {/* SECTION 4: USE CASES / INDUSTRIES (BENTO GRID WITH REAL PHOTOGRAPHY) */}
      <section id="industries" className="py-24 md:py-32 px-6 bg-[#FCF9F2]">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="inline-flex items-center justify-center bg-brand-navy/10 border border-brand-navy/10 text-brand-navy font-rethink text-[10px] md:text-xs font-bold uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-6 select-none">
              Industry Use Cases
            </span>
            <h2 className="font-boldonse text-4xl sm:text-5xl md:text-6xl text-brand-navy tracking-tight leading-none mb-6 font-extrabold">
              Built for Every Environment
            </h2>
            <p className="font-cabin text-base sm:text-lg text-slate-500 leading-relaxed">
              Every facility faces unique queue challenges. Linely scales seamlessly to serve different transaction types and traffic constraints across complex networks.
            </p>
          </div>

          {/* Bento Grid: Varied sizes on desktop, stacks on mobile */}
          <div className="grid grid-cols-12 gap-8 w-full max-w-6xl mx-auto">
            
            {/* 1. Healthcare & Pharmacy - Wide (col-span-12, md:col-span-7) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="col-span-12 md:col-span-7 group relative h-[320px] rounded-3xl overflow-hidden shadow-md border border-slate-200/50 flex flex-col justify-end p-8 text-left cursor-default"
            >
              {/* Real Photo background - No duotones or color filters */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=1200')` }}
                
              />
              {/* Elegant dark overlay gradient purely for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 bg-brand-cyan text-brand-navy font-rethink text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                  <Heart className="w-3.5 h-3.5" /> Healthcare & Pharmacy
                </span>
                <h4 className="font-boldonse text-2xl sm:text-3xl text-white font-bold mb-2">
                  Patients Comfort & Safe Triage
                </h4>
                <p className="font-cabin text-sm text-slate-200 leading-relaxed max-w-lg">
                  Reduce waiting room infection risks, streamline prescription pick-ups, and coordinate patient arrivals with automatic triage tags.
                </p>
              </div>
            </motion.div>

            {/* 2. Banking & Finance - Narrow (col-span-12, md:col-span-5) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="col-span-12 md:col-span-5 group relative h-[320px] rounded-3xl overflow-hidden shadow-md border border-slate-200/50 flex flex-col justify-end p-8 text-left cursor-default"
            >
              {/* Real Photo background - No duotones or color filters */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200')` }}
                
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 bg-brand-cyan text-brand-navy font-rethink text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                  <Briefcase className="w-3.5 h-3.5" /> Banking & Finance
                </span>
                <h4 className="font-boldonse text-2xl sm:text-3xl text-white font-bold mb-2">
                  Premium Wealth Advisors Routing
                </h4>
                <p className="font-cabin text-sm text-slate-200 leading-relaxed">
                  Tame unpredictable walk-ins, match clients with qualified financial advisors, and elevate premium wealth-management service standards.
                </p>
              </div>
            </motion.div>

            {/* 3. Government Offices - Narrow (col-span-12, md:col-span-5) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="col-span-12 md:col-span-5 group relative h-[320px] rounded-3xl overflow-hidden shadow-md border border-slate-200/50 flex flex-col justify-end p-8 text-left cursor-default"
            >
              {/* Real Photo background - No duotones or color filters */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1577416412292-747c6607f055?auto=format&fit=crop&q=80&w=1200')` }}
                
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 bg-brand-cyan text-brand-navy font-rethink text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                  <Building className="w-3.5 h-3.5" /> Government
                </span>
                <h4 className="font-boldonse text-2xl sm:text-3xl text-white font-bold mb-2">
                  High-Volume Public Operations
                </h4>
                <p className="font-cabin text-sm text-slate-200 leading-relaxed">
                  Organize civic registration queues, balance massive morning rush hours, and offer secure remote sign-in for municipal service centers.
                </p>
              </div>
            </motion.div>

            {/* 4. Retail Storefronts - Wide (col-span-12, md:col-span-7) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="col-span-12 md:col-span-7 group relative h-[320px] rounded-3xl overflow-hidden shadow-md border border-slate-200/50 flex flex-col justify-end p-8 text-left cursor-default"
            >
              {/* Real Photo background - No duotones or color filters */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200')` }}
                
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 bg-brand-cyan text-brand-navy font-rethink text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                  <ShoppingBag className="w-3.5 h-3.5" /> Retail & Commerce
                </span>
                <h4 className="font-boldonse text-2xl sm:text-3xl text-white font-bold mb-2">
                  Browse Free Virtual Waiting Lists
                </h4>
                <p className="font-cabin text-sm text-slate-200 leading-relaxed max-w-lg">
                  Transform checkout counter waits into virtual lists. Keep shoppers browsing and purchasing instead of standing in static lines.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* SECTION 5: FINAL CTA */}
      <section className="py-24 bg-brand-navy text-white text-center px-6 relative overflow-hidden border-t-2 border-brand-cyan/20">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-deepnavy via-brand-navy to-brand-navy" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full filter blur-[120px] pointer-events-none" />
        
        <div className="max-w-3xl mx-auto relative z-10">
          {/* Eyebrow */}
          <span className="inline-flex items-center justify-center bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan font-rethink text-[10px] md:text-xs font-bold uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-6 select-none">
            Get Started
          </span>
          <h2 className="font-boldonse text-4xl sm:text-6xl text-white tracking-tight mb-6 font-extrabold">
            Ready to see it running in your lobby?
          </h2>
          <p className="font-cabin text-slate-300 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Ditch the paper tickets and static signs. Join hundreds of progressive operations streamlining guest flow and unlocking staff potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onStart}
              className="font-rethink font-bold text-base bg-brand-cyan text-brand-navy hover:bg-white hover:scale-105 px-10 py-4 rounded-full transition-all duration-300 cursor-pointer shadow-lg shadow-brand-cyan/25 flex items-center justify-center gap-2"
            >
              Try Linely for Free <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenContact}
              className="font-rethink font-bold text-base border-2 border-white/20 text-white hover:border-white hover:bg-white/5 hover:scale-105 px-10 py-4 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center"
            >
              Request a Guided Demo
            </button>
          </div>
          <p className="font-instrument text-xs text-slate-400 mt-6 font-light">
            No credit card required. Configurable in minutes.
          </p>
        </div>
      </section>

    </div>
  );
}
