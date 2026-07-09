import { motion } from "motion/react";

export default function Solution({ onOpenProduct }: { onOpenProduct?: (section?: string) => void }) {
  return (
    <section
      id="solution"
      className="bg-[#FCFAF5] py-24 md:py-32 px-6 relative overflow-hidden"
    >
      {/* Premium colorful decorative ambient light blobs with warm cream-gold highlights */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-gradient-to-tr from-brand-cream/60 to-brand-cyan/15 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-gradient-to-tr from-brand-cream/50 to-brand-ocean/10 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Liquid Glass Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center bg-white/40 backdrop-blur-xl border border-white/60 text-brand-navy/80 font-rethink text-[10px] md:text-xs font-light uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-8 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.03)] cursor-default select-none"
        >
          Our Solution
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-boldonse text-4xl sm:text-6xl md:text-7xl text-brand-navy tracking-[0.015em] text-center leading-[1.2] mb-6 max-w-4xl font-extrabold"
        >
          Queue Management System
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-cabin text-lg sm:text-xl text-slate-600 max-w-2xl mb-16 leading-relaxed font-light text-center"
        >
          One platform to check visitors in, manage waitlists, notify your team, and measure every interaction — all in real time.
        </motion.p>

        {/* High-Fidelity 4-Column Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mb-16 relative z-10">
          
          {/* Card 1: Speed & Efficiency */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="group relative bg-gradient-to-br from-white to-amber-50/15 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-start transition-all duration-300 shadow-xl hover:shadow-2xl overflow-visible cursor-default"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-rose-200/20 rounded-full filter blur-2xl opacity-60 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-start">
              {/* Perfectly sized & padded integers to avoid any clipping */}
              <span className="font-boldonse text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-500 tracking-normal leading-normal py-1 block select-none overflow-visible">
                3x
              </span>
              <span className="font-boldonse text-lg font-bold text-brand-navy block mb-2 mt-1">
                Faster Service
              </span>
              <p className="font-cabin text-sm text-slate-500 leading-relaxed font-light">
                Eliminate bottlenecks instantly. Help staff organize queues dynamically without paper waitlists.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Shorter Wait Times */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="group relative bg-gradient-to-br from-white to-sky-50/15 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-start transition-all duration-300 shadow-xl hover:shadow-2xl overflow-visible cursor-default"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-blue-200/20 rounded-full filter blur-2xl opacity-60 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-start">
              {/* Perfectly sized & padded integers to avoid any clipping */}
              <span className="font-boldonse text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 tracking-normal leading-normal py-1 block select-none overflow-visible">
                40%
              </span>
              <span className="font-boldonse text-lg font-bold text-brand-navy block mb-2 mt-1">
                Shorter Wait Times
              </span>
              <p className="font-cabin text-sm text-slate-500 leading-relaxed font-light">
                Direct customers to the right queue and let them track real-time wait lists directly on their phones.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Real Industry Data Wait Time Reduction */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="group relative bg-gradient-to-br from-white to-emerald-50/15 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-start transition-all duration-300 shadow-xl hover:shadow-2xl overflow-visible cursor-default"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-teal-200/20 rounded-full filter blur-2xl opacity-60 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-start">
              {/* Perfectly sized & padded integers to avoid any clipping */}
              <span className="font-boldonse text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 tracking-normal leading-normal py-1 block select-none overflow-visible">
                38%
              </span>
              <span className="font-boldonse text-lg font-bold text-brand-navy block mb-2 mt-1">
                Average Wait Time Reduction
              </span>
              <p className="font-cabin text-sm text-slate-500 leading-relaxed font-light">
                Proven average reduction achieved across modern digital queue deployments.
              </p>
            </div>
          </motion.div>

          {/* Card 4: Global Scale */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="group relative bg-gradient-to-br from-white to-purple-50/15 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-start transition-all duration-300 shadow-xl hover:shadow-2xl overflow-visible cursor-default"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-fuchsia-200/20 rounded-full filter blur-2xl opacity-60 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-start">
              {/* Perfectly sized & padded integers to avoid any clipping */}
              <span className="font-boldonse text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-600 tracking-normal leading-normal py-1 block select-none overflow-visible">
                1000+
              </span>
              <span className="font-boldonse text-lg font-bold text-brand-navy block mb-2 mt-1">
                Brands Worldwide
              </span>
              <p className="font-cabin text-sm text-slate-500 leading-relaxed font-light">
                Loved and deployed across multi-location healthcare clinics, busy retail storefronts, and universities globally.
              </p>
            </div>
          </motion.div>

        </div>

        {/* Call to action button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center"
        >
          <button 
            onClick={() => onOpenProduct?.("how-it-works")}
            className="font-rethink font-bold text-base md:text-lg bg-brand-navy text-white hover:bg-brand-ocean hover:scale-105 px-9 py-4.5 rounded-full transition-all duration-300 cursor-pointer shadow-lg hover:shadow-brand-ocean/25 inline-flex items-center justify-center"
          >
            See how Queue Management works
          </button>
        </motion.div>
      </div>

      {/* Elegant light border line at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-200/60 w-full" />
    </section>
  );
}
