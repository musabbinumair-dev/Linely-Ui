import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";

interface PricingPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  ctaText: string;
  isPopular: boolean;
  features: string[];
  gradientStyle: string;
  buttonStyle: string;
  shapes: ReactNode;
}

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const plans: PricingPlan[] = [
    {
      name: "Starter",
      monthlyPrice: 30,
      yearlyPrice: 24,
      description: "For small teams and startups taking their first steps in modern queue management.",
      ctaText: "Get Started Free",
      isPopular: false,
      features: [
        "1 Active Check-in Kiosk",
        "Up to 5 Team Members",
        "Basic Queue Statistics",
        "Email & Chat Support (9-5)",
        "Linely Branding on Screens"
      ],
      gradientStyle: "bg-gradient-to-b from-[#FFFDF9] via-[#FFF6EB] to-[#FCE7D0] border-amber-200/40 shadow-[0_4px_30px_rgba(245,230,200,0.15)] hover:shadow-[0_20px_40px_rgba(245,230,200,0.3)]",
      buttonStyle: "bg-white border border-brand-navy/15 text-brand-navy hover:bg-amber-50 hover:border-brand-navy/30",
      shapes: (
        <>
          {/* Subtle amber radial glow bottom-left */}
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-brand-cream/40 rounded-full filter blur-[60px] pointer-events-none animate-pulse" style={{ animationDuration: "10s" }} />
          {/* Ambient lighting */}
          <div className="absolute top-1/4 right-0 w-48 h-48 bg-white/20 rounded-full filter blur-[40px] pointer-events-none" />
          {/* Beautiful curved intersect wave overlay (Matches reference) */}
          <svg className="absolute bottom-0 left-0 w-full h-[45%] opacity-[0.6] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,45 C30,15 70,85 100,55 L100,100 L0,100 Z" fill="#FCDCB2" />
            <path d="M0,65 C40,45 60,95 100,80 L100,100 L0,100 Z" fill="#FBC78C" opacity="0.45" />
          </svg>
        </>
      )
    },
    {
      name: "Professional",
      monthlyPrice: 80,
      yearlyPrice: 64,
      description: "Advanced waitlist features, automated SMS messaging, and rich reporting for busy spaces.",
      ctaText: "Start Free Trial",
      isPopular: true,
      features: [
        "Unlimited Active Kiosks",
        "Unlimited Team Members",
        "Advanced Analytics Dashboard",
        "Priority Support (24/7 Response)",
        "Remove Linely Branding",
        "Custom Automated SMS Alerts"
      ],
      gradientStyle: "bg-gradient-to-b from-[#FAF9FF] via-[#F3EFFF] to-[#E5DCFF] border-indigo-200/40 shadow-[0_12px_40px_rgba(26,35,114,0.1)] hover:shadow-[0_24px_50px_rgba(26,35,114,0.18)]",
      buttonStyle: "bg-brand-navy text-white hover:bg-brand-deepnavy hover:shadow-md hover:shadow-brand-navy/25",
      shapes: (
        <>
          {/* Slow-pulsing glowing colorful orbs */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-navy/10 rounded-full filter blur-[70px] pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#1A87C2]/15 rounded-full filter blur-[60px] pointer-events-none animate-pulse" style={{ animationDuration: "12s" }} />
          {/* Beautiful curved intersect wave overlay (Matches reference) */}
          <svg className="absolute bottom-0 left-0 w-full h-[45%] opacity-[0.6] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 C40,20 60,80 100,45 L100,100 L0,100 Z" fill="#D7CAFF" />
            <path d="M0,65 C30,45 70,95 100,70 L100,100 L0,100 Z" fill="#C2B2FF" opacity="0.45" />
          </svg>
        </>
      )
    },
    {
      name: "Enterprise",
      monthlyPrice: 150,
      yearlyPrice: 120,
      description: "Custom workflows, full API access, SLA guarantees, and dedicated success engineering.",
      ctaText: "Contact Sales",
      isPopular: false,
      features: [
        "Multi-Location Syncing",
        "Full API & Webhooks Access",
        "Dedicated Success Manager",
        "Custom SLA & Security Reviews",
        "Custom Integration Support",
        "Single Sign-On (SSO)"
      ],
      gradientStyle: "bg-gradient-to-b from-[#F2FDFF] via-[#E6FAFE] to-[#D0F4FB] border-cyan-200/40 shadow-[0_4px_30px_rgba(0,195,227,0.1)] hover:shadow-[0_20px_40px_rgba(0,195,227,0.2)]",
      buttonStyle: "bg-white border border-brand-navy/15 text-brand-navy hover:bg-cyan-50 hover:border-brand-navy/30",
      shapes: (
        <>
          {/* Glowing orbs */}
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-brand-cyan/15 rounded-full filter blur-[75px] pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-ocean/10 rounded-full filter blur-[60px] pointer-events-none" />
          {/* Beautiful curved intersect wave overlay (Matches reference) */}
          <svg className="absolute bottom-0 left-0 w-full h-[45%] opacity-[0.65] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,45 C30,15 70,75 100,40 L100,100 L0,100 Z" fill="#A8ECF7" />
            <path d="M0,60 C40,35 60,90 100,65 L100,100 L0,100 Z" fill="#8BE2F1" opacity="0.45" />
          </svg>
        </>
      )
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: [0.25, 1, 0.5, 1] as [number, number, number, number]
      }
    }
  };

  return (
    <section
      id="pricing"
      className="bg-[#FAF6F0]/60 py-24 md:py-32 px-6 relative overflow-hidden"
    >
      {/* Decorative ambient background glows to tie in with existing designs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-tr from-brand-cream/35 to-transparent rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-tr from-brand-cyan/8 to-transparent rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
        
        {/* Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center bg-white/60 backdrop-blur-xl border border-white/80 text-brand-navy/80 font-rethink text-[10px] md:text-xs font-light uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-6 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.85),0_4px_12px_rgba(0,0,0,0.03)] cursor-default select-none"
        >
          Pricing Plans
        </motion.div>

        {/* Section Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-boldonse text-4xl sm:text-6xl md:text-[70px] text-brand-navy tracking-normal text-center leading-[1.1] max-w-4xl"
        >
          Pricing Plans
        </motion.h2>

        {/* Supporting Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="font-cabin text-base md:text-lg text-slate-500 text-center max-w-[500px] mt-5 leading-relaxed"
        >
          Choose the plan that best fits your business needs. Upgrade, downgrade, or cancel at any time.
        </motion.p>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 flex items-center justify-center gap-4.5"
        >
          <button
            onClick={() => setIsYearly(false)}
            className={`font-rethink text-sm font-bold tracking-tight transition-colors duration-200 cursor-pointer ${
              !isYearly ? "text-brand-navy" : "text-slate-400 hover:text-slate-600"
            }`}
            aria-label="Bill Monthly"
          >
            Monthly
          </button>

          <button
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-7.5 bg-brand-navy rounded-full p-1 relative flex items-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)] cursor-pointer transition-all duration-300"
            aria-label="Toggle annual billing"
            aria-checked={isYearly}
            role="switch"
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-5.5 h-5.5 bg-brand-cyan rounded-full shadow-sm"
              style={{
                marginLeft: isYearly ? "auto" : "0px"
              }}
            />
          </button>

          <button
            onClick={() => setIsYearly(true)}
            className={`font-rethink text-sm font-bold tracking-tight transition-colors duration-200 cursor-pointer flex items-center gap-1.5 ${
              isYearly ? "text-brand-navy" : "text-slate-400 hover:text-slate-600"
            }`}
            aria-label="Bill Annually"
          >
            Yearly
            <span className="bg-brand-cyan/20 text-brand-navy text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wide">
              Save 20%
            </span>
          </button>
        </motion.div>

        {/* Pricing Cards Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center max-w-7xl mx-auto"
        >
          {plans.map((plan, idx) => {
            const displayPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isEnterprise = plan.name === "Enterprise";

            return (
              <motion.div
                key={plan.name}
                variants={cardVariants}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className={`relative rounded-[28px] overflow-hidden border transition-all duration-300 ${
                  plan.gradientStyle
                } ${
                  plan.isPopular 
                    ? "p-8 lg:p-11 md:scale-[1.03] lg:scale-[1.07] z-10 shadow-[0_25px_60px_rgba(26,35,114,0.18)] ring-2 ring-brand-navy/15 min-h-[580px] md:min-h-[630px] lg:min-h-[680px]" 
                    : "p-6 lg:p-9 min-h-[520px] md:min-h-[560px] lg:min-h-[610px]"
                }`}
              >
                {/* Embedded dynamic geometric backgrounds/glassmorphism shapes */}
                {plan.shapes}

                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute top-5 right-5 z-20">
                    <span className="bg-brand-navy text-white text-[9px] font-extrabold tracking-[0.18em] uppercase px-3.5 py-1.5 rounded-full shadow-[0_4px_12px_rgba(26,35,114,0.15)] border border-white/20 select-none">
                      Recommended
                    </span>
                  </div>
                )}

                {/* Top Section */}
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <span className="font-rethink text-xs font-extrabold uppercase tracking-widest text-brand-navy/80 block mb-3">
                      {plan.name}
                    </span>

                    {/* Price Container with robust responsive styling - No hardcoded clipping widths */}
                    <div className="flex items-baseline flex-wrap gap-1 mb-4 min-h-[68px]">
                      {isEnterprise ? (
                        <span className="font-boldonse text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-navy tracking-tight uppercase leading-none block py-2">
                          Talk to us
                        </span>
                      ) : (
                        <>
                          <span className="font-boldonse text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-navy tracking-tight">
                            $
                          </span>
                          <div className="inline-flex relative items-center justify-start overflow-visible min-w-[40px] sm:min-w-[50px]">
                            <AnimatePresence mode="wait" initial={false}>
                              <motion.span
                                key={displayPrice}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="font-boldonse text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-navy tracking-tight block"
                              >
                                {displayPrice}
                              </motion.span>
                            </AnimatePresence>
                          </div>
                          <span className="font-rethink text-sm font-bold text-slate-500/80 ml-1.5">
                            /month
                          </span>
                        </>
                      )}
                    </div>

                    <p className="font-cabin text-sm text-slate-600 leading-relaxed min-h-[48px] mb-8">
                      {plan.description}
                    </p>

                    <button
                      className={`w-full py-4 rounded-full font-rethink font-bold text-sm tracking-tight transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${plan.buttonStyle}`}
                    >
                      {plan.ctaText}
                    </button>

                    {/* Custom Divider */}
                    <div className="h-[1px] bg-brand-navy/10 my-8 w-full" />

                    {/* Feature List */}
                    <ul className="flex flex-col gap-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-brand-navy/90 select-none">
                          <div className="w-5.5 h-5.5 rounded-full bg-brand-navy flex items-center justify-center shrink-0 shadow-sm">
                            <Check className="w-3 h-3 text-white stroke-[3.5]" />
                          </div>
                          <span className="font-cabin text-sm leading-none font-semibold">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}


