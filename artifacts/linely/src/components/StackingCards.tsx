import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";

// Standard hook for responsive styling in inline styles
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

interface CardProps {
  key?: React.Key | number;
  heading: string;
  bgColor: string;
  textColor: string;
  index: number;
  isCta?: boolean;
  onStart?: () => void;
}

function StackingCard({ heading, bgColor, textColor, index, isCta, onStart }: CardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  // Track scroll progress of this card container relative to viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start start"],
  });

  // Scale down slightly as the next card stacks on top
  const scale = useTransform(scrollYProgress, [0.6, 1], [1, 0.95]);

  // Responsive sticky positions
  const baseTop = isMobile ? 64 : 100;
  const gap = isMobile ? 12 : 20;

  return (
    <div
      ref={containerRef}
      className="h-[65vh] sm:h-[75vh] md:h-[80vh] w-full flex items-center justify-center sticky"
      style={{
        top: `${baseTop + index * gap}px`,
        zIndex: (index + 1) * 10,
      }}
    >
      <motion.div
        style={{ scale }}
        className={`w-full max-w-5xl h-[420px] sm:h-[440px] md:h-[480px] rounded-[14px] flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 text-center shadow-[0_20px_50px_-12px_rgba(26,35,114,0.15)] ${bgColor} ${textColor} border border-white/15 relative overflow-hidden`}
      >
        <div className="max-w-4xl flex flex-col items-center justify-center w-full">
          {/* Main heading - massive, bold, matching reference */}
          <h3 className="font-boldonse text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] font-black leading-[1.05] tracking-tight uppercase select-none w-full break-words">
            {heading}
          </h3>

          {/* Material 3 CTA Button for Card 5 */}
          {isCta && (
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="bg-[#FCF9F2] hover:bg-[#FAF3E5] text-[#C46A28] font-rethink font-bold text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] mt-6 sm:mt-8 md:mt-10 cursor-pointer border border-[#EBE0CD] transition-all duration-300"
            >
              Try for free
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function StackingCards({ onStart }: { onStart?: () => void }) {
  const cards = [
    {
      heading: "EFFORTLESS FLOW",
      bgColor: "bg-[#F4EDE2] border border-[#E5D7C0]",
      textColor: "text-[#1C78B1]",
    },
    {
      heading: "BUILT FOR SPEED",
      bgColor: "bg-[#1C78B1]",
      textColor: "text-[#1A2372]",
    },
    {
      heading: "FULLY CUSTOMIZABLE",
      bgColor: "bg-[#E58344]",
      textColor: "text-[#FCF9F2]",
    },
    {
      heading: "SECURE AND RELIABLE",
      bgColor: "bg-[#131E54]",
      textColor: "text-[#E7A670]",
    },
    {
      heading: "SEE IT FOR YOURSELF",
      bgColor: "bg-[#0D1540]",
      textColor: "text-[#FCF9F2]",
      isCta: true,
    },
  ];

  return (
    <section
      id="stacking-cards"
      className="bg-[#FAF6F0] pt-0 pb-24 md:pb-32 px-4 sm:px-6 md:px-12 relative"
    >
      <div className="max-w-7xl mx-auto flex flex-col">
        {/* Stack cards container - no overflow-hidden on any of these to make sticky work */}
        <div className="relative flex flex-col gap-0 pb-[10vh]">
          {cards.map((card, index) => (
            <StackingCard
              key={index}
              heading={card.heading}
              bgColor={card.bgColor}
              textColor={card.textColor}
              index={index}
              isCta={card.isCta}
              onStart={onStart}
            />
          ))}
        </div>
      </div>

      {/* Elegant separator line at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-100 w-full" />
    </section>
  );
}
