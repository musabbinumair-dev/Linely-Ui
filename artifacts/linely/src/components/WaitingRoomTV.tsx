import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TVBrandingConfig } from "../types";
import { 
  ArrowLeft, 
  Volume2, 
  Play, 
  Sparkles, 
  ChevronRight, 
  Tv 
} from "lucide-react";

// Mock customer list for TV queue simulation
const WAITING_LIST = [
  { 
    name: "Daemon Targaryen", 
    token: "T-801", 
    department: "Clinical Consultation",
    room: "Room 108",
    operatorName: "Dr. Alyssa",
    operatorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
  },
  { 
    name: "Amara Sterling", 
    token: "A-104", 
    department: "Billing & Registration",
    room: "Room 101",
    operatorName: "Peter",
    operatorImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
  },
  { 
    name: "Marcus Brody", 
    token: "M-305", 
    department: "Diagnostic Imaging",
    room: "Room 203",
    operatorName: "Dr. Helen",
    operatorImage: "https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&h=150&fit=crop&crop=face"
  },
  { 
    name: "Sarah Jenkins", 
    token: "P-402", 
    department: "Pharmacy & Dispensary",
    room: "Counter 4",
    operatorName: "James",
    operatorImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face"
  },
  { 
    name: "Rhaenyra Velaryon", 
    token: "T-802", 
    department: "Clinical Consultation",
    room: "Room 108",
    operatorName: "Dr. Alyssa",
    operatorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
  },
  { 
    name: "David Kaelen", 
    token: "A-105", 
    department: "Billing & Registration",
    room: "Room 101",
    operatorName: "Peter",
    operatorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  { 
    name: "Helena Rostova", 
    token: "M-306", 
    department: "Diagnostic Imaging",
    room: "Room 203",
    operatorName: "Dr. Helen",
    operatorImage: "https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&h=150&fit=crop&crop=face"
  },
  { 
    name: "Thomas Wright", 
    token: "P-403", 
    department: "Pharmacy & Dispensary",
    room: "Counter 4",
    operatorName: "James",
    operatorImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face"
  },
  { 
    name: "Viserys Targaryen", 
    token: "T-803", 
    department: "Clinical Consultation",
    room: "Room 108",
    operatorName: "Dr. Alyssa",
    operatorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
  },
  { 
    name: "Arthur Dent", 
    token: "A-106", 
    department: "Billing & Registration",
    room: "Room 101",
    operatorName: "Peter",
    operatorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  }
];

export const DEFAULT_BRANDING: TVBrandingConfig = {
  departmentLabelFontSize: "text-sm",
  departmentLabelColor: "#0D1A5E",
  logoText: "Linely",
  logoFontFamily: "Outfit",
  logoColor: "#0D1A5E",
  
  tokenBgGradientFrom: "#0D1A5E",
  tokenBgGradientTo: "#00C3E3",
  tokenTextColor: "#FFFFFF",
  nameTextColor: "#0D1A5E",
  counterCardBgFrom: "#0D1A5E",
  counterCardBgTo: "#1A2372",
  counterCardBorderColor: "#00C3E34d",
  counterRoomTextColor: "#00C3E3",
  counterOperatorTextColor: "#FFFFFF",
  upNextLabelText: "Up Next",
  upNextLabelColor: "#0D1A5E",
  nextItemsTextColor: "#0D1A5E",
  showSecondNextItem: true,

  bgPrimaryColor: "#F5F8FC",
  showDotMatrix: true,
  showGridLines: true,
  showAmbientBlobs: true,
  blob1Color: "#38BDF820",
  blob2Color: "#00C3E320",
  blob3Color: "#FEF3C750",
  showWaves: true,
  wave1ColorFrom: "#E2FDFE",
  wave1ColorTo: "#A5F3FC",
  wave2ColorFrom: "#EEF2FE",
  wave2ColorTo: "#C7D2FE",
  wave3ColorFrom: "#E0F2FE",
  wave3ColorTo: "#38BDF8",
  wave4ColorFrom: "#FEF3C7",
  wave4ColorTo: "#FCD34D",
  showFloatingBubbles: true,

  autoplayIntervalSeconds: 8,
  ttsEnabledByDefault: true,
  chimeFrequencies: [554.37, 659.25],
};

export default function WaitingRoomTV({ onGoBack, branding, isPreviewMode = false }: { onGoBack: () => void; branding?: TVBrandingConfig; isPreviewMode?: boolean }) {
  const [localBranding, setLocalBranding] = useState<TVBrandingConfig | null>(null);
  
  useEffect(() => {
    if (!branding) {
      try {
        const saved = localStorage.getItem("tv_branding_published");
        if (saved) {
          setLocalBranding(JSON.parse(saved));
        }
      } catch (e) {
        console.warn("Failed to parse tv_branding_published from localStorage", e);
      }
    }
  }, [branding]);

  const cfg = branding || localBranding || DEFAULT_BRANDING;
  const [currentIndex, setCurrentIndex] = useState(isPreviewMode ? 3 : 0);
  const [showControls, setShowControls] = useState(!isPreviewMode);
  const [isPlaying, setIsPlaying] = useState(!isPreviewMode);
  const [pulseScale, setPulseScale] = useState(1);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Sync TTS enabled by default
  useEffect(() => {
    setTtsEnabled(cfg.ttsEnabledByDefault);
  }, [cfg.ttsEnabledByDefault]);
  
  // Track last activity to auto-hide controls
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeClient = WAITING_LIST[currentIndex];
  const nextClient1 = WAITING_LIST[(currentIndex + 1) % WAITING_LIST.length];
  const nextClient2 = WAITING_LIST[(currentIndex + 2) % WAITING_LIST.length];

  // Auto progression for demo mode
  useEffect(() => {
    if (isPreviewMode) return;
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        handleNext();
      }, cfg.autoplayIntervalSeconds * 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, cfg.autoplayIntervalSeconds, isPreviewMode]);

  // Handle controls auto-hide on mouse movement
  useEffect(() => {
    if (isPreviewMode) return;
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000); // Hide after 4 seconds of inactivity
    };

    window.addEventListener("mousemove", handleMouseMove);
    handleMouseMove(); // Initial call to set timeout

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPreviewMode]);

  // Audio chime utility
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const freqs = cfg.chimeFrequencies || [554.37, 659.25];
      
      // Note 1 (Harmonic Sine)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freqs[0], audioCtx.currentTime); // Dynamic frequency 1
      gain1.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      
      // Note 2 (Staggered Sweet Ring)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freqs[1], audioCtx.currentTime + 0.18); // Dynamic frequency 2
      gain2.gain.setValueAtTime(0, audioCtx.currentTime);
      gain2.gain.setValueAtTime(0.12, audioCtx.currentTime + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.1);
      
      osc1.start(audioCtx.currentTime);
      osc2.start(audioCtx.currentTime + 0.18);
      
      osc1.stop(audioCtx.currentTime + 0.85);
      osc2.stop(audioCtx.currentTime + 1.15);
    } catch (e) {
      console.warn("AudioContext chime failed:", e);
    }
  };

  // Text to Speech announcement
  const announceCurrentClient = (name: string, token: string, dept: string) => {
    if (!ttsEnabled || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Speak the token first, then name, then destination
      const text = `Token number ${token.split("").join(" ")}, ${name}, please proceed to ${dept}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.05;
      
      // Select a nice English voice if available
      const voices = window.speechSynthesis.getVoices();
      const defaultVoice = voices.find(v => v.lang.startsWith("en-") && (v.name.includes("Google") || v.name.includes("Natural")));
      if (defaultVoice) {
        utterance.voice = defaultVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS narration failed:", e);
    }
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % WAITING_LIST.length;
    setCurrentIndex(nextIndex);
    playChime();
    
    // Announce via TTS with a tiny delay so the chime finishes first
    setTimeout(() => {
      const target = WAITING_LIST[nextIndex];
      announceCurrentClient(target.name, target.token, target.department);
    }, 900);

    // Visual pulse effect
    setPulseScale(1.05);
    setTimeout(() => setPulseScale(1), 300);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + WAITING_LIST.length) % WAITING_LIST.length;
    setCurrentIndex(prevIndex);
    playChime();
    
    setTimeout(() => {
      const target = WAITING_LIST[prevIndex];
      announceCurrentClient(target.name, target.token, target.department);
    }, 900);

    setPulseScale(1.05);
    setTimeout(() => setPulseScale(1), 300);
  };

  return (
    <div 
      className="relative min-h-screen w-full text-slate-800 flex flex-col justify-between items-center overflow-hidden"
      style={{ backgroundColor: cfg.bgPrimaryColor, fontFamily: "Inter, sans-serif" }}
      id="waiting-room-tv-stage"
    >
      {/* ---------------- BACKGROUND VISUALS (Aesthetic Light Theme with Brand Accents) ---------------- */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden">
        {/* Geometric Dot Matrix Texture for depth */}
        {cfg.showDotMatrix && (
          <div 
            className="absolute inset-0 opacity-[0.06] mix-blend-multiply" 
            style={{
              backgroundImage: `radial-gradient(${cfg.departmentLabelColor} 2px, transparent 2px)`,
              backgroundSize: "28px 28px"
            }}
          />
        )}

        {/* Delicate tech mesh lines */}
        {cfg.showGridLines && (
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke={cfg.departmentLabelColor} strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        )}

        {/* Animated Background Gradients & Ambient Colorful Blobs */}
        {cfg.showAmbientBlobs && (
          <>
            <div className="absolute top-[-10%] left-[-15%] w-[70%] h-[70%] rounded-full opacity-35 blur-[130px] animate-pulse" style={{ animationDuration: "12s", backgroundColor: cfg.blob1Color }} />
            <div className="absolute bottom-[-10%] right-[-15%] w-[65%] h-[65%] rounded-full opacity-35 blur-[150px] animate-pulse" style={{ animationDuration: "18s", backgroundColor: cfg.blob2Color }} />
            <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full opacity-35 blur-[120px] animate-pulse" style={{ animationDuration: "14s", backgroundColor: cfg.blob3Color }} />
          </>
        )}

        {/* Multiple Dynamic Waves overlapping at different speeds and opacities */}
        {cfg.showWaves && (
          <svg 
            className="absolute bottom-0 left-0 w-full h-[70%] opacity-45 min-w-[1200px]"
            viewBox="0 0 1440 600" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            {/* Wave 1: Cyan/Teal Underlayer */}
            <motion.path 
              d="M0,160 C320,300,480,80,960,260 C1280,380,1360,240,1440,180 L1440,600 L0,600 Z" 
              fill="url(#light-wave-gradient-cyan)"
              animate={{
                d: [
                  "M0,160 C320,300,480,80,960,260 C1280,380,1360,240,1440,180 L1440,600 L0,600 Z",
                  "M0,190 C400,220,520,120,900,290 C1200,420,1320,200,1440,210 L1440,600 L0,600 Z",
                  "M0,160 C320,300,480,80,960,260 C1280,380,1360,240,1440,180 L1440,600 L0,600 Z"
                ]
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Wave 2: Soft Royal Blue/Purple middle layer */}
            <motion.path 
              d="M0,240 C300,320,580,180,920,280 C1220,360,1340,220,1440,260 L1440,600 L0,600 Z" 
              fill="url(#light-wave-gradient-indigo)"
              animate={{
                d: [
                  "M0,240 C300,320,580,180,920,280 C1220,360,1340,220,1440,260 L1440,600 L0,600 Z",
                  "M0,270 C340,260,540,240,960,240 C1260,240,1320,290,1440,300 L1440,600 L0,600 Z",
                  "M0,240 C300,320,580,180,920,280 C1220,360,1340,220,1440,260 L1440,600 L0,600 Z"
                ]
              }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="opacity-75"
            />

            {/* Wave 3: Ocean Blue Accent */}
            <motion.path 
              d="M0,280 C240,190,480,310,960,220 C1200,170,1320,310,1440,290 L1440,600 L0,600 Z" 
              fill="url(#light-wave-gradient-ocean)"
              animate={{
                d: [
                  "M0,280 C240,190,480,310,960,220 C1200,170,1320,310,1440,290 L1440,600 L0,600 Z",
                  "M0,260 C300,240,420,340,900,200 C1250,110,1360,290,1440,270 L1440,600 L0,600 Z",
                  "M0,280 C240,190,480,310,960,220 C1200,170,1320,310,1440,290 L1440,600 L0,600 Z"
                ]
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="opacity-85"
            />

            {/* Wave 4: Gold Creamy / Peach Flow */}
            <motion.path 
              d="M0,350 C360,280,720,380,1080,310 C1200,290,1320,360,1440,330 L1440,600 L0,600 Z" 
              fill="url(#light-wave-gradient-gold)"
              animate={{
                d: [
                  "M0,350 C360,280,720,380,1080,310 C1200,290,1320,360,1440,330 L1440,600 L0,600 Z",
                  "M0,380 C320,320,680,320,1120,330 C1250,340,1350,310,1440,360 L1440,600 L0,600 Z",
                  "M0,350 C360,280,720,380,1080,310 C1200,290,1320,360,1440,330 L1440,600 L0,600 Z"
                ]
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="opacity-60"
            />

            {/* Wave 5: Ultimate Foreground Warm Soft White to give premium liquid depth */}
            <motion.path 
              d="M0,390 C360,330,720,440,1080,360 C1200,330,1320,410,1440,380 L1440,600 L0,600 Z" 
              fill="url(#light-wave-gradient-fg)"
              animate={{
                d: [
                  "M0,390 C360,330,720,440,1080,360 C1200,330,1320,410,1440,380 L1440,600 L0,600 Z",
                  "M0,420 C320,360,680,390,1120,390 C1250,390,1350,370,1440,400 L1440,600 L0,600 Z",
                  "M0,390 C360,330,720,440,1080,360 C1200,330,1320,410,1440,380 L1440,600 L0,600 Z"
                ]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="opacity-95"
            />

            <defs>
              <linearGradient id="light-wave-gradient-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={cfg.wave1ColorFrom} stopOpacity="0.8" />
                <stop offset="100%" stopColor={cfg.wave1ColorTo} stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="light-wave-gradient-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={cfg.wave2ColorFrom} stopOpacity="0.9" />
                <stop offset="100%" stopColor={cfg.wave2ColorTo} stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="light-wave-gradient-ocean" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={cfg.wave3ColorFrom} stopOpacity="0.9" />
                <stop offset="100%" stopColor={cfg.wave3ColorTo} stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="light-wave-gradient-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={cfg.wave4ColorFrom} stopOpacity="0.75" />
                <stop offset="100%" stopColor={cfg.wave4ColorTo} stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="light-wave-gradient-fg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#F1F5F9" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* Floating delicate background bubbles */}
        {cfg.showFloatingBubbles && (
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full blur-[1px]"
                style={{
                  top: `${10 + (i * 6.5)}%`,
                  left: `${5 + (i * 9.5) % 90}%`,
                  backgroundColor: `${cfg.tokenBgGradientTo}24`
                }}
                animate={{
                  y: [0, -40, 0],
                  opacity: [0.15, 0.6, 0.15],
                  scale: [1, 1.25, 1],
                }}
                transition={{
                  duration: 7 + (i % 5) * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---------------- TOP AREA: DEPARTMENT NAME (Normal Size) ---------------- */}
      <div className="w-full text-center pt-16 md:pt-20 px-6 z-10 shrink-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeClient.department}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            {/* Elegant Department Header - Plain text, no extra labels/banners */}
            <h2 
              className={`font-extrabold tracking-[0.25em] uppercase font-rethink max-w-xl truncate ${cfg.departmentLabelFontSize}`}
              style={{ color: cfg.departmentLabelColor }}
            >
              {activeClient.department}
            </h2>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---------------- MIDDLE AREA: QUEUE HOLDER NAME (Big Size) & TOKEN (Above) & COUNTER INFO (Below) ---------------- */}
      <div className="w-full text-center px-6 my-auto z-10 flex flex-col justify-center items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeClient.name}
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: pulseScale, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ 
              type: "spring",
              stiffness: 110,
              damping: 16,
              mass: 0.8
            }}
            className="flex flex-col justify-center items-center gap-4"
          >
            {/* Token Number Above the Name: clearly visible, styled with gorgeous color badge */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="px-12 py-3.5 rounded-3xl shadow-xl font-boldonse text-4xl sm:text-5xl md:text-6xl font-black tracking-[0.05em] leading-none select-none"
              style={{ 
                background: `linear-gradient(135deg, ${cfg.tokenBgGradientFrom}, ${cfg.tokenBgGradientTo})`,
                color: cfg.tokenTextColor,
                boxShadow: `0 10px 25px -5px ${cfg.tokenBgGradientFrom}33`
              }}
            >
              {activeClient.token}
            </motion.div>

            {/* Massive Display Name in deep high-contrast Brand Navy */}
            <h1 
              className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none select-none mt-2 font-outfit"
              style={{ 
                color: cfg.nameTextColor,
                textShadow: `0 4px 12px ${cfg.nameTextColor}0d`
              }}
            >
              {activeClient.name}
            </h1>

            {/* Counter Information Card - Designed to match the requested design of the counter info card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mt-6 py-4.5 px-9 rounded-full shadow-2xl flex items-center gap-6 w-full max-w-lg select-none border-2"
              style={{
                background: `linear-gradient(135deg, ${cfg.counterCardBgFrom}, ${cfg.counterCardBgTo})`,
                borderColor: cfg.counterCardBorderColor,
                boxShadow: `0 20px 40px -15px ${cfg.counterCardBgFrom}40`
              }}
              id="waiting-room-tv-counter-card"
            >
              {/* Operator Avatar Left */}
              <div 
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 bg-black/20 flex-shrink-0 flex items-center justify-center shadow-lg"
                style={{ borderColor: `${cfg.counterRoomTextColor}66` }}
              >
                <img 
                  src={activeClient.operatorImage} 
                  alt={activeClient.operatorName}
                  className="w-full h-full object-cover scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Operator & Room Text Right */}
              <div className="flex flex-col items-start text-left">
                <span 
                  className="text-2xl sm:text-3xl font-black leading-none font-boldonse tracking-wide mb-1"
                  style={{ color: cfg.counterRoomTextColor }}
                >
                  {activeClient.room}
                </span>
                <span 
                  className="text-base sm:text-lg font-bold leading-snug"
                  style={{ color: cfg.counterOperatorTextColor }}
                >
                  {activeClient.operatorName}
                </span>
                <span 
                  className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase mt-1 leading-none font-rethink"
                  style={{ color: `${cfg.counterOperatorTextColor}b3` }}
                >
                  {activeClient.department}
                </span>
              </div>
            </motion.div>

            {/* Subtle "Up Next" label to separate the active token from upcoming items */}
            <motion.div
              id="waiting-room-tv-up-next-label"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 0.4, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="mt-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] select-none font-rethink"
              style={{ color: cfg.upNextLabelColor }}
            >
              <span className="w-6 h-[1px]" style={{ backgroundColor: `${cfg.upNextLabelColor}33` }}></span>
              <span>{cfg.upNextLabelText}</span>
              <span className="w-6 h-[1px]" style={{ backgroundColor: `${cfg.upNextLabelColor}33` }}></span>
            </motion.div>

            {/* Second queue item (next in line) */}
            <motion.div
              id="waiting-room-tv-next-name-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ delay: 0.20, duration: 0.4 }}
              className="mt-1.5 py-1 px-4 max-w-[90vw] md:max-w-xl truncate text-center font-boldonse text-[18px] sm:text-[22px] md:text-[26px] font-black tracking-[0.05em] leading-normal select-none"
              style={{ color: cfg.nextItemsTextColor }}
            >
              {nextClient1.name}
            </motion.div>

            {/* Third queue item (following in line) */}
            {cfg.showSecondNextItem && (
              <motion.div
                id="waiting-room-tv-next-name-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.5, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="mt-0.5 py-1 px-4 max-w-[90vw] md:max-w-xl truncate text-center font-boldonse text-[13px] sm:text-[16px] md:text-[20px] font-black tracking-[0.05em] leading-normal select-none"
                style={{ color: cfg.nextItemsTextColor }}
              >
                {nextClient2.name}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---------------- BOTTOM AREA: BRAND LOGO (Bottom Right) ---------------- */}
      <div className="w-full px-10 pb-8 md:px-14 md:pb-10 flex items-end justify-end z-10 shrink-0">
        {/* Bottom Right: Clean, minimalist Linely logowordmark exactly like the Landing Page */}
        <div 
          className="select-none"
          id="tv-screen-logo-container"
        >
          <span 
            className="text-2xl font-bold tracking-tight transition-colors"
            style={{ 
              color: cfg.logoColor,
              fontFamily: cfg.logoFontFamily === "Outfit" 
                ? "Outfit, sans-serif" 
                : cfg.logoFontFamily === "Space Grotesk"
                ? "'Space Grotesk', sans-serif"
                : cfg.logoFontFamily === "JetBrains Mono"
                ? "'JetBrains Mono', monospace"
                : "Inter, sans-serif"
            }}
          >
            {cfg.logoText}
          </span>
        </div>
      </div>

      {/* ---------------- INTERACTIVE SIMULATOR CONTROLLER (Autohides, mouseover brings it up) ---------------- */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-2xl bg-white/95 border border-slate-200/80 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4"
          >
            {/* Left: TV Controller info */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={onGoBack}
                className="p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 rounded-xl transition-all cursor-pointer text-slate-600 shrink-0"
                title="Exit TV Display"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <div className="text-left leading-tight">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-ocean block">
                  Interactive Simulator
                </span>
                <span className="text-xs font-bold text-slate-700 block mt-0.5 font-rethink">
                  Waiting Room TV Screen Controller
                </span>
              </div>
            </div>

            {/* Center: Quick triggers & selectors */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handlePrev}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 transition-all cursor-pointer active:scale-95"
              >
                Prev
              </button>
              
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-4.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95 ${
                  isPlaying 
                    ? "bg-brand-ocean text-white shadow-sm hover:bg-brand-ocean/90" 
                    : "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Play className={`w-3.5 h-3.5 ${isPlaying ? "fill-current" : ""}`} />
                <span>{isPlaying ? "Autoplay On" : "Autoplay Off"}</span>
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-navy text-white hover:bg-brand-deepnavy rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                <span>Call Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right: Audio / Speech togglers */}
            <div className="flex items-center gap-2 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 w-full md:w-auto justify-end">
              <button
                onClick={playChime}
                className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-600 transition-all cursor-pointer"
                title="Play Chime"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={`p-2 border rounded-xl transition-all cursor-pointer ${
                  ttsEnabled 
                    ? "bg-brand-ocean/10 border-brand-ocean/30 text-brand-ocean" 
                    : "bg-slate-100 border-slate-200 text-slate-400"
                }`}
                title={ttsEnabled ? "TTS Voice Enabled" : "TTS Voice Disabled"}
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
