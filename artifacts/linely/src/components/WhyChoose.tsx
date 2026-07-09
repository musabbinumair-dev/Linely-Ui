import { motion } from "motion/react";

export default function WhyChoose({ onStart }: { onStart?: () => void }) {
  return (
    <section
      id="why-choose"
      className="bg-[#FAF6F0] pt-24 md:pt-36 pb-12 md:pb-16 px-6 relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Eyebrow Label */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center bg-white/40 backdrop-blur-xl border border-white/60 text-brand-navy/80 font-rethink text-[10px] md:text-xs font-light uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-8 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.85),0_4px_12px_rgba(0,0,0,0.03)] cursor-default select-none"
        >
          Of course you should, but
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-boldonse text-4xl sm:text-6xl md:text-[70px] text-brand-navy tracking-normal leading-[1.1] mb-10 font-extrabold whitespace-nowrap sm:whitespace-normal"
        >
          WHY CHOOSE LINELY?
        </motion.h2>

        {/* Body Text */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-cabin text-lg sm:text-xl md:text-2xl text-slate-600 leading-relaxed max-w-[680px] mb-12 font-light"
        >
          Linely goes beyond queues and appointments. We help teams deliver better service, work smarter, and create experiences visitors love. Linely is the in-person service platform built around how real teams work and how visitors want to be treated.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            onClick={onStart}
            className="font-rethink font-bold text-base md:text-lg bg-brand-navy text-white hover:bg-brand-ocean hover:scale-105 px-10 py-4.5 rounded-full transition-all duration-300 cursor-pointer"
          >
            Try for free &rarr;
          </button>
        </motion.div>
      </div>
    </section>
  );
}
