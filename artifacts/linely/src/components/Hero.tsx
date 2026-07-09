import { motion } from "motion/react";

export default function Hero({ onStart }: { onStart?: () => void }) {
  const handleScrollToSolution = () => {
    const solutionElement = document.getElementById("solution");
    if (solutionElement) {
      solutionElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="bg-brand-navy pt-32 pb-24 md:pt-44 md:pb-32 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
    >
      {/* Premium Multi-Layer Wavy Background Graphic */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none">
        <svg
          className="w-full h-full object-cover opacity-[0.75] min-w-[1024px] xl:min-w-full"
          viewBox="0 0 505.12 505.12"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          shapeRendering="geometricPrecision"
        >
          <defs>
            <filter id="blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0"></feGaussianBlur>
            </filter>
          </defs>
          {/* Background rect is transparent to let brand-navy seamlessly flow from top */}
          <rect id="bg" x="0" y="0" width="505.12" height="505.12" fill="transparent"></rect>
          <g filter="url(#blur)">
            <path
              d="M 0 -50.512 L 0 -50.51
                L 33.67 -25.26
                L 101.024 -50.51 L 101.024 -50.51
                L 145.02 -25.26
                L 202.048 -50.51 L 202.048 -50.51
                L 261.05 -25.26
                L 303.072 -50.51 L 303.072 -50.51
                L 374.07 -17.51
                L 404.096 -50.51 L 404.096 -50.51
                L 450.10 -6.51
                L 505.12 -50.51 L 505.12 -50.51
                L 538.79 -10.51
                L 606.144 -50.51  V 505.12 H 0 V -50.51 Z"
              fill="#0D1A5E"
            ></path>
            <path
              d="M 0 0 L 0 0.00
                L 39.00 25.26
                L 101.024 0.00 L 101.024 0.00
                L 134.70 27.00
                L 202.048 0.00 L 202.048 0.00
                L 256.05 25.26
                L 303.072 0.00 L 303.072 0.00
                L 336.75 25.26
                L 404.096 0.00 L 404.096 0.00
                L 455.10 25.26
                L 505.12 0.00 L 505.12 0.00
                L 576.12 38.00
                L 606.144 0.00  V 505.12 H 0 V 0.00 Z"
              fill="#10206D"
            ></path>
            <path
              d="M 0 50.512 L 0 50.51
                L 44.00 75.77
                L 101.024 50.51 L 101.024 50.51
                L 159.02 75.77
                L 202.048 50.51 L 202.048 50.51
                L 235.72 89.51
                L 303.072 50.51 L 303.072 50.51
                L 341.07 100.51
                L 404.096 50.51 L 404.096 50.51
                L 437.77 94.51
                L 505.12 50.51 L 505.12 50.51
                L 538.79 76.51
                L 606.144 50.51  V 505.12 H 0 V 50.51 Z"
              fill="#13267D"
            ></path>
            <path
              d="M 0 101.024 L 0 101.02
                L 44.00 133.02
                L 101.024 101.02 L 101.024 101.02
                L 169.02 145.02
                L 202.048 101.02 L 202.048 101.02
                L 235.72 126.28
                L 303.072 101.02 L 303.072 101.02
                L 341.07 126.28
                L 404.096 101.02 L 404.096 101.02
                L 476.10 126.28
                L 505.12 101.02 L 505.12 101.02
                L 538.79 140.02
                L 606.144 101.02  V 505.12 H 0 V 101.02 Z"
              fill="#172C8C"
            ></path>
            <path
              d="M 0 151.536 L 0 151.54
                L 47.00 176.79
                L 101.024 151.54 L 101.024 151.54
                L 172.02 177.54
                L 202.048 151.54 L 202.048 151.54
                L 266.05 192.54
                L 303.072 151.54 L 303.072 151.54
                L 336.75 176.79
                L 404.096 151.54 L 404.096 151.54
                L 437.77 176.79
                L 505.12 151.54 L 505.12 151.54
                L 538.79 176.79
                L 606.144 151.54  V 505.12 H 0 V 151.54 Z"
              fill="#1A329C"
            ></path>
            <path
              d="M 0 202.048 L 0 202.05
                L 33.67 227.30
                L 101.024 202.05 L 101.024 202.05
                L 134.70 234.05
                L 202.048 202.05 L 202.048 202.05
                L 275.05 227.30
                L 303.072 202.05 L 303.072 202.05
                L 336.75 228.05
                L 404.096 202.05 L 404.096 202.05
                L 437.77 227.30
                L 505.12 202.05 L 505.12 202.05
                L 579.12 247.05
                L 606.144 202.05  V 505.12 H 0 V 202.05 Z"
              fill="#1A47B1"
            ></path>
            <path
              d="M 0 252.56 L 0 252.56
                L 39.00 288.56
                L 101.024 252.56 L 101.024 252.56
                L 134.70 299.56
                L 202.048 252.56 L 202.048 252.56
                L 246.05 293.56
                L 303.072 252.56 L 303.072 252.56
                L 354.07 281.56
                L 404.096 252.56 L 404.096 252.56
                L 437.77 298.56
                L 505.12 252.56 L 505.12 252.56
                L 541.12 277.82
                L 606.144 252.56  V 505.12 H 0 V 252.56 Z"
              fill="#1A5DC6"
            ></path>
            <path
              d="M 0 303.072 L 0 303.07
                L 58.00 328.33
                L 101.024 303.07 L 101.024 303.07
                L 145.02 351.07
                L 202.048 303.07 L 202.048 303.07
                L 266.05 353.07
                L 303.072 303.07 L 303.072 303.07
                L 336.75 348.07
                L 404.096 303.07 L 404.096 303.07
                L 476.10 328.33
                L 505.12 303.07 L 505.12 303.07
                L 538.79 349.07
                L 606.144 303.07  V 505.12 H 0 V 303.07 Z"
              fill="#1A72DB"
            ></path>
            <path
              d="M 0 353.584 L 0 353.58
                L 34.00 378.84
                L 101.024 353.58 L 101.024 353.58
                L 153.02 378.84
                L 202.048 353.58 L 202.048 353.58
                L 272.05 393.58
                L 303.072 353.58 L 303.072 353.58
                L 350.07 378.84
                L 404.096 353.58 L 404.096 353.58
                L 475.10 378.84
                L 505.12 353.58 L 505.12 353.58
                L 538.79 378.84
                L 606.144 353.58  V 505.12 H 0 V 353.58 Z"
              fill="#1A87C2"
            ></path>
            <path
              d="M 0 404.096 L 0 404.10
                L 33.67 434.10
                L 101.024 404.10 L 101.024 404.10
                L 136.02 447.10
                L 202.048 404.10 L 202.048 404.10
                L 235.72 436.10
                L 303.072 404.10 L 303.072 404.10
                L 361.07 429.35
                L 404.096 404.10 L 404.096 404.10
                L 441.10 429.35
                L 505.12 404.10 L 505.12 404.10
                L 566.12 429.35
                L 606.144 404.10  V 505.12 H 0 V 404.10 Z"
              fill="#0BB0D6"
            ></path>
            <path
              d="M 0 454.608 L 0 454.61
                L 62.00 479.86
                L 101.024 454.61 L 101.024 454.61
                L 165.02 479.86
                L 202.048 454.61 L 202.048 454.61
                L 235.72 479.86
                L 303.072 454.61 L 303.072 454.61
                L 378.07 489.61
                L 404.096 454.61 L 404.096 454.61
                L 446.10 485.61
                L 505.12 454.61 L 505.12 454.61
                L 545.12 486.61
                L 606.144 454.61  V 505.12 H 0 V 454.61 Z"
              fill="#00C3E3"
            ></path>
          </g>
        </svg>

        {/* Soft elegant gradient mesh blending to blend perfectly with brand-navy */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/35 via-transparent to-brand-navy pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-navy to-transparent pointer-events-none" />
      </div>

      <div className="max-w-5xl mx-auto flex flex-col items-center relative z-10">
        {/* Eyebrow Label */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          id="hero-eyebrow"
          className="inline-flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_32px_0_rgba(0,0,0,0.2)] text-white/90 font-rethink text-[10px] md:text-xs font-light uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-8 select-none cursor-default whitespace-nowrap"
        >
          Queue Management System
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          id="hero-heading"
          className="font-boldonse text-4xl sm:text-6xl md:text-[80px] lg:text-[96px] xl:text-[108px] tracking-normal leading-[1.25] max-w-5xl mb-8 font-extrabold bg-gradient-to-r from-white via-brand-cream to-brand-cyan bg-clip-text text-transparent pt-4 pb-4 px-2 select-none text-center"
        >
          <span className="inline-block sm:inline whitespace-nowrap">Smart Queues.</span>
          <br />
          <span className="inline-block sm:inline whitespace-nowrap">Effortless Flow.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          id="hero-subheading"
          className="font-cabin text-lg md:text-xl text-[#9BAECF] max-w-2xl mb-12 leading-relaxed"
        >
          Linely gives your team the tools to serve visitors faster, smarter, and with less chaos — from check-in to completion.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          id="hero-ctas"
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4"
        >
          <button
            id="hero-primary-cta"
            onClick={onStart}
            className="w-full sm:w-auto font-rethink font-bold text-lg bg-brand-cyan text-brand-navy px-8 py-4 rounded-full shadow-lg shadow-brand-cyan/15 hover:bg-white hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            Try for free →
          </button>
          <button
            id="hero-secondary-cta"
            onClick={handleScrollToSolution}
            className="w-full sm:w-auto font-rethink font-bold text-lg border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-brand-navy hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            See how it works
          </button>
        </motion.div>
      </div>

      {/* Full-width cyan bottom border with neon glow for division */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-cyan shadow-[0_0_15px_#00C3E3] w-full" />
    </section>
  );
}
