import { motion } from "motion/react";
import { 
  Smartphone, 
  Globe, 
  Tablet, 
  MessageSquare, 
  Tv, 
  Laptop, 
  BarChart3, 
  ArrowRight,
  Sparkles
} from "lucide-react";

// ==========================================
// Reusable Premium Blueprint Mockup Placeholder
// ==========================================
interface MockupPlaceholderProps {
  type: string;
  name: string;
  dimensions: string;
}

const MockupPlaceholder = ({ type, name, dimensions }: MockupPlaceholderProps) => {
  const getIcon = () => {
    switch (type) {
      case "phone":
        return <Smartphone className="w-10 h-10 text-brand-ocean/80" />;
      case "browser":
        return <Globe className="w-10 h-10 text-brand-cyan/80" />;
      case "tablet":
        return <Tablet className="w-10 h-10 text-brand-navy/80" />;
      case "chat":
        return <MessageSquare className="w-10 h-10 text-brand-ocean/80" />;
      case "tv":
        return <Tv className="w-10 h-10 text-brand-cyan/80" />;
      case "laptop":
        return <Laptop className="w-10 h-10 text-brand-navy/80" />;
      case "chart":
        return <BarChart3 className="w-10 h-10 text-brand-ocean/80" />;
      default:
        return <Laptop className="w-10 h-10 text-brand-ocean/80" />;
    }
  };

  // Outer frame aspect ratio configuration matching device styles
  let frameClasses = "w-full max-w-[280px] sm:max-w-[320px] aspect-[9/16] rounded-[36px]"; // standard vertical phone frame
  if (type === "browser" || type === "tablet") {
    frameClasses = "w-full max-w-[480px] sm:max-w-[580px] aspect-[4/3] rounded-2xl";
  } else if (type === "laptop" || type === "chart") {
    frameClasses = "w-full max-w-[500px] sm:max-w-[620px] aspect-[16/10] rounded-2xl";
  } else if (type === "tv") {
    frameClasses = "w-full max-w-[500px] sm:max-w-[640px] aspect-[16/9] rounded-xl";
  } else if (type === "chat") {
    frameClasses = "w-full max-w-[280px] sm:max-w-[340px] aspect-[3/4] rounded-3xl";
  }

  return (
    <div className="w-full flex justify-center mt-6 select-none">
      <div className={`w-full ${frameClasses} bg-white/75 backdrop-blur-md border-[2.5px] border-dashed border-slate-300/80 shadow-[0_12px_40px_rgba(0,0,0,0.01)] flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden group hover:border-brand-ocean/40 hover:shadow-[0_20px_50px_rgba(26,135,194,0.04)] transition-all duration-300`}>
        {/* Soft grid background */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#1A87C2 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px"
          }}
        />

        {/* Blueprint-style cross-hatch corner diagonals */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] flex items-center justify-center">
          <div className="w-full h-[1px] bg-brand-navy rotate-6 absolute" />
          <div className="w-full h-[1px] bg-brand-navy -rotate-6 absolute" />
        </div>

        {/* Centered content block */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-white/95 rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-500">
            {getIcon()}
          </div>
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono tracking-[0.25em] text-slate-400 font-extrabold uppercase block">
              MOCKUP PLACEHOLDER
            </span>
            <h4 className="font-instrument text-base font-bold text-slate-800">
              {name}
            </h4>
            <div className="inline-flex items-center gap-1 font-mono text-[9px] px-2.5 py-1 rounded bg-slate-50 text-slate-500 font-semibold border border-slate-100">
              📐 {dimensions}
            </div>
          </div>
        </div>

        {/* Corner draft markers */}
        <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-300">┌</div>
        <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-300">┐</div>
        <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-300">└</div>
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-300">┘</div>
      </div>
    </div>
  );
};

export default function Features({ onOpenProduct }: { onOpenProduct?: (section?: string) => void }) {
  const features = [
    {
      id: "remote-sign-in",
      name: "Remote sign-in",
      description: "Let visitors join queues before arriving, wherever they are.",
      type: "phone",
      dimensions: "375 × 812px",
      bgClass: "bg-[#E5DCFF] shadow-sm",
      textColor: "text-brand-navy",
      subColor: "text-slate-600",
      targetId: "self-service"
    },
    {
      id: "visitor-website",
      name: "Visitor Website",
      description: "Share schedules, wait times, and updates in one place.",
      type: "browser",
      dimensions: "1024 × 768px",
      bgClass: "bg-[#E5DCFF] shadow-sm",
      textColor: "text-brand-navy",
      subColor: "text-slate-600",
      targetId: "self-service"
    },
    {
      id: "check-in-kiosk",
      name: "Check-in kiosk",
      description: "Offer self-service arrivals with a branded, easy interface.",
      type: "tablet",
      dimensions: "1024 × 768px",
      bgClass: "bg-[#E5DCFF] shadow-sm",
      textColor: "text-brand-navy",
      subColor: "text-slate-600",
      targetId: "self-service"
    },
    {
      id: "customer-messaging",
      name: "Customer messaging",
      description: "Send automated & manual two-way SMS inform visitors.",
      type: "chat",
      dimensions: "375 × 812px",
      bgClass: "bg-[#E5DCFF] shadow-sm",
      textColor: "text-brand-navy",
      subColor: "text-slate-600",
      targetId: "sms-notifications"
    },
    {
      id: "waiting-room-tv",
      name: "Waiting room TV",
      description: "Waitlists, announcements, and service instructions in real-time.",
      type: "tv",
      dimensions: "1920 × 1080px",
      bgClass: "bg-[#E5DCFF] shadow-sm",
      textColor: "text-brand-navy",
      subColor: "text-slate-600",
      targetId: "self-service"
    },
    {
      id: "service-dashboard",
      name: "Service dashboard",
      description: "Serve visitors and manage operations from one platform.",
      type: "laptop",
      dimensions: "1440 × 900px",
      bgClass: "bg-[#E5DCFF] shadow-sm",
      textColor: "text-brand-navy",
      subColor: "text-slate-600",
      targetId: "command-center"
    },
    {
      id: "analytics",
      name: "Analytics",
      description: "Improve efficiency with real-time service data & alerts.",
      type: "chart",
      dimensions: "1280 × 800px",
      bgClass: "bg-[#E5DCFF] shadow-sm",
      textColor: "text-brand-navy",
      subColor: "text-slate-600",
      targetId: "analytics"
    }
  ];

  return (
    <section id="features" className="bg-white py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative Warm Cream & Purple ambient blobs for background depth */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-gradient-to-tr from-purple-100/30 to-indigo-100/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-gradient-to-tr from-blue-50/20 to-purple-50/20 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Eyebrow badge style from reference */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center bg-white/40 backdrop-blur-xl border border-white/60 text-brand-navy/80 font-rethink text-[10px] md:text-xs font-light uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-8 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.85),0_4px_12px_rgba(0,0,0,0.03)] cursor-default select-none"
        >
          Features
        </motion.div>

        {/* Header Title: "Features that power better service" matched to Who Uses Linely style, split into 2 lines */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-boldonse text-4xl sm:text-6xl md:text-[70px] text-brand-navy tracking-normal text-center leading-[1.1] max-w-3xl mb-4"
        >
          Features that<br className="hidden sm:inline" /> power better service
        </motion.h2>

        {/* Subtitle from screenshot */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-instrument text-base sm:text-lg text-slate-600 text-center max-w-xl mb-6"
        >
          Everything you need to run in-person service.
        </motion.p>

        {/* Link from reference: "Try for free ->" */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          onClick={() => onOpenProduct?.("auth")}
          className="font-rethink text-sm font-bold text-brand-ocean hover:text-brand-cyan hover:underline inline-flex items-center gap-1.5 transition-colors group mb-16 cursor-pointer"
        >
          Try for free <span className="group-hover:translate-x-1 transition-transform font-sans">&rarr;</span>
        </motion.button>

        {/* Vertical Stack of Feature Cards */}
        <div className="w-full flex flex-col gap-8 md:gap-12">
          {features.map((feature, index) => {
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.2) }}
                className={`w-full max-w-2xl mx-auto rounded-[32px] ${feature.bgClass} p-8 sm:p-12 md:p-14 flex flex-col items-center text-center hover:shadow-[0_25px_50px_rgba(26,135,194,0.04)] hover:-translate-y-1 transition-all duration-500`}
              >
                {/* Feature Name */}
                <h3 className={`font-rethink text-2xl sm:text-3xl font-extrabold ${feature.textColor} tracking-tight mb-2.5`}>
                  {feature.name}
                </h3>

                {/* Description */}
                <p className={`font-instrument text-sm sm:text-base ${feature.subColor} leading-relaxed max-w-md mb-8`}>
                  {feature.description}
                </p>

                {/* Wireframe Mockup Placeholder Container */}
                <MockupPlaceholder 
                  type={feature.type} 
                  name={feature.name} 
                  dimensions={feature.dimensions} 
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
