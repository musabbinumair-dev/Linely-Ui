import { motion } from "motion/react";

export default function TrustedBy() {
  const brands = ["Acme", "Vexa", "Nordia", "Crestline", "Orbis", "Solara", "Aero", "Vortex"];

  return (
    <section
      id="trusted-by"
      className="bg-[#FCFAF5] py-16 md:py-24 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Eyebrow label */}
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center bg-white/40 backdrop-blur-xl border border-white/60 text-brand-navy/80 font-rethink text-[10px] md:text-xs font-light uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.85),0_4px_12px_rgba(0,0,0,0.03)] cursor-default select-none"
          >
            Trusted by 1000+ brands worldwide
          </motion.div>
        </div>

        {/* Row of brand name text */}
        <div className="overflow-hidden relative w-full py-2">
          {/* Subtle gradient edges matching the beautiful warm cream background */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FCFAF5] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FCFAF5] to-transparent z-10 pointer-events-none" />

          {/* Animated row */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 md:gap-x-16"
          >
            {brands.map((brand, i) => (
              <motion.span
                key={brand}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="font-boldonse text-3xl md:text-4xl text-slate-300 font-black tracking-tight select-none cursor-default hover:text-brand-ocean transition-colors duration-300"
              >
                {brand}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Elegant light separator line at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-200/60 w-full" />
    </section>
  );
}
