import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Check, 
  UserMinus, 
  FastForward, 
  HelpCircle, 
  Clock, 
  LogOut, 
  Camera, 
  RefreshCw, 
  AlertTriangle, 
  Layers, 
  Users, 
  Wifi, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Minimize2,
  Maximize2,
  Pause,
  Coffee,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock3,
  Smartphone,
  X,
  SlidersHorizontal,
  Tv
} from "lucide-react";

// --- TYPES & INTERFACES ---
export interface QueuedToken {
  id: string;
  number: string;
  customerName: string;
  department: string;
  type: "walk-in" | "appointment";
  position: number;
  waitTime: string;
  priority: "pregnant" | "disabled" | "elderly" | "vip" | "emergency" | "standard";
  scheduledTime?: string;
  isDue?: boolean;
}

export interface SkippedToken {
  number: string;
  customerName: string;
  department: string;
  skippedAt: string;
}

export interface ActiveCounter {
  id: string;
  number: string;
  operatorName: string;
  activeCount: number;
  trend: "growing" | "shrinking" | "stable";
}

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

// --- SOUND UTILITIES (Standard Client-side AudioContext) ---
function playLocalChime() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // First note
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(554.37, audioCtx.currentTime); // C#5
    gain1.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
    
    // Second note (slightly staggered)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
    gain2.gain.setValueAtTime(0, audioCtx.currentTime);
    gain2.gain.setValueAtTime(0.12, audioCtx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.85);
    
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.65);
    
    osc2.start(audioCtx.currentTime + 0.15);
    osc2.stop(audioCtx.currentTime + 0.9);
  } catch (e) {
    console.warn("AudioContext chime not supported or active:", e);
  }
}

function playLocalSuccessTone() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    console.warn("Success sound failed:", e);
  }
}

function playLocalErrorTone() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.25);
    
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (e) {
    console.warn("Error sound failed:", e);
  }
}

function triggerTTS(text: string) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    // Find a clear sounding default english voice if possible
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(voice => voice.name.includes("Google") || voice.name.includes("Natural"));
    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }
}

export default function OperatorConsole({ onLogout, onOpenTV }: { onLogout: () => void; onOpenTV?: () => void }) {
  // --- STATE CONFIGURATIONS ---
  // Core Session Details
  const [counterId, setCounterId] = useState("4");
  const [department, setDepartment] = useState("Billing & Registration");
  const [facility, setFacility] = useState("Main Medical Atrium");
  
  // Toggles & Settings
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [chimeEnabled, setChimeEnabled] = useState(true);
  const [laneMode, setLaneMode] = useState<"Auto" | "Walk-In Only" | "Appointment Only">("Auto");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Shift & Warnings
  const [shiftTimeRemaining, setShiftTimeRemaining] = useState(260); // 4 minutes 20 seconds remaining (triggers warning!)
  const [shiftCompleted, setShiftCompleted] = useState(false);
  const [warningActive, setWarningActive] = useState(true);

  // Connection State
  const [signalRConnected, setSignalRConnected] = useState(true);

  // Active serving states
  const [servingToken, setServingToken] = useState<QueuedToken | null>({
    id: "token-1",
    number: "A-104",
    customerName: "Amara Sterling",
    department: "Billing & Registration",
    type: "appointment",
    position: 0,
    waitTime: "4m",
    priority: "vip",
    scheduledTime: "09:00 AM",
    isDue: true
  });
  const [servingStatus, setServingStatus] = useState<"Called" | "Processing" | "Idle">("Called");
  const [serviceTimer, setServiceTimer] = useState(0); // in seconds
  const serviceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Queue Lists
  const [waitingQueue, setWaitingQueue] = useState<QueuedToken[]>([
    { id: "token-2", number: "W-211", customerName: "David Kaelen", department: "Billing & Registration", type: "walk-in", position: 1, waitTime: "2m", priority: "disabled" },
    { id: "token-3", number: "A-108", customerName: "Marcus Vance", department: "Consultation", type: "appointment", position: 2, waitTime: "5m", priority: "standard", scheduledTime: "09:15 AM", isDue: true },
    { id: "token-4", number: "W-302", customerName: "Dr. Jenkins", department: "Pharmacy", type: "walk-in", position: 3, waitTime: "8m", priority: "elderly" },
    { id: "token-5", number: "W-405", customerName: "Emergency Trauma", department: "Laboratory", type: "walk-in", position: 4, waitTime: "12m", priority: "emergency" },
    { id: "token-6", number: "A-110", customerName: "Sarah Connor", department: "Billing & Registration", type: "appointment", position: 5, waitTime: "24m", priority: "pregnant", scheduledTime: "11:30 AM" },
    { id: "token-7", number: "W-121", customerName: "Robert Miller", department: "Customer Relations", type: "walk-in", position: 6, waitTime: "30m", priority: "standard" },
  ]);

  const [skippedLane, setSkippedLane] = useState<SkippedToken[]>([
    { number: "W-190", customerName: "Helena Rostova", department: "Billing & Registration", skippedAt: "08:42 AM" },
    { number: "A-102", customerName: "Gabriel Byrne", department: "Consultation", skippedAt: "08:15 AM" }
  ]);
  const [isSkippedExpanded, setIsSkippedExpanded] = useState(false);

  // Load balancing counters
  const [otherCounters, setOtherCounters] = useState<ActiveCounter[]>([
    { id: "c1", number: "1", operatorName: "Emily Watson", activeCount: 2, trend: "shrinking" },
    { id: "c2", number: "2", operatorName: "Marcus Vance", activeCount: 5, trend: "growing" },
    { id: "c3", number: "3", operatorName: "Sarah Jenkins", activeCount: 1, trend: "stable" },
    { id: "c4", number: "4 (You)", operatorName: "Active Operator", activeCount: 3, trend: "stable" },
    { id: "c5", number: "5", operatorName: "Thomas Wright", activeCount: 4, trend: "growing" }
  ]);

  // Filters for waitlist
  const [activeQueueTab, setActiveQueueTab] = useState<"All" | "Walk-In" | "Appointments">("All");

  // Camera QR code reader state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);
  const [simulatedScannerMessage, setSimulatedScannerMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Modal controls
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferStep, setTransferStep] = useState(1);
  const [selectedDept, setSelectedDept] = useState("");
  const [transferMode, setTransferMode] = useState<"Standard" | "Priority" | "Warm Handoff" | "Return">("Standard");
  const [transferReason, setTransferReason] = useState("");
  const [transferNotes, setTransferNotes] = useState("");

  // Break states
  const [breakModalOpen, setBreakModalOpen] = useState(false);
  const [selectedBreakReason, setSelectedBreakReason] = useState("Restroom");
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(15);
  const [onBreak, setOnBreak] = useState(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0); // in seconds
  const breakIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // --- SOUND TRIGGERS ---
  const triggerAnnounceSound = (token: string) => {
    if (chimeEnabled) {
      playLocalChime();
    }
    if (ttsEnabled) {
      // Delay speech slightly to let the chime ring out elegantly
      setTimeout(() => {
        triggerTTS(`Token ${token.split("").join(" ")}, please proceed to counter ${counterId}`);
      }, 700);
    }
  };

  // --- TOAST TRIGGERS ---
  const showToast = (type: "success" | "error" | "warning" | "info", message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // --- SHIFT TIMER ---
  useEffect(() => {
    const timer = setInterval(() => {
      setShiftTimeRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (shiftTimeRemaining === 0 && !shiftCompleted) {
      setShiftCompleted(true);
    } else if (shiftTimeRemaining === 300) {
      showToast("warning", "Shift ending in less than 5 minutes! Make sure to complete active services.");
    }
  }, [shiftTimeRemaining, shiftCompleted]);

  // --- SERVICE TIMER EFFECT ---
  useEffect(() => {
    if (servingStatus === "Processing") {
      serviceIntervalRef.current = setInterval(() => {
        setServiceTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (serviceIntervalRef.current) {
        clearInterval(serviceIntervalRef.current);
      }
      setServiceTimer(0);
    }
    return () => {
      if (serviceIntervalRef.current) clearInterval(serviceIntervalRef.current);
    };
  }, [servingStatus]);

  // --- BREAK TIMER EFFECT ---
  useEffect(() => {
    if (onBreak && breakTimeRemaining > 0) {
      breakIntervalRef.current = setInterval(() => {
        setBreakTimeRemaining((prev) => {
          if (prev <= 1) {
            setOnBreak(false);
            showToast("info", "Your break has finished. Welcome back to your serving shift!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breakIntervalRef.current) {
        clearInterval(breakIntervalRef.current);
      }
    }
    return () => {
      if (breakIntervalRef.current) clearInterval(breakIntervalRef.current);
    };
  }, [onBreak, breakTimeRemaining]);

  // --- INITIAL CHIME ANNOUNCEMENT ---
  useEffect(() => {
    // Announce the pre-loaded called token as a pleasant surprise
    if (servingToken && servingStatus === "Called") {
      const t = setTimeout(() => {
        triggerAnnounceSound(servingToken.number);
      }, 1500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);

  // --- CAMERA SCAN HANDLERS ---
  const handleToggleCamera = async () => {
    if (cameraActive) {
      stopCamera();
    } else {
      setCameraActive(true);
      setSimulatedScannerMessage("");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraPermissionGranted(true);
      } catch (err) {
        console.warn("Camera hardware access denied or not available, using high-fidelity scanning simulator.", err);
        setCameraPermissionGranted(false);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleSimulateQRScan = (isValid: boolean) => {
    if (isValid) {
      if (!servingToken || servingStatus !== "Called") {
        showToast("error", "No customer is currently called. Call next before scanning.");
        playLocalErrorTone();
        return;
      }
      playLocalSuccessTone();
      setServingStatus("Processing");
      showToast("success", `QR Validated: ${servingToken.customerName}'s ticket scanned. Service auto-started!`);
      setSimulatedScannerMessage("SUCCESS: Ticket Verified!");
      setTimeout(() => {
        setSimulatedScannerMessage("");
        stopCamera();
      }, 2000);
    } else {
      playLocalErrorTone();
      showToast("error", "Invalid ticket scanned. Token or Department mismatch.");
      setSimulatedScannerMessage("ERROR: Token Mismatch!");
      setTimeout(() => {
        setSimulatedScannerMessage("");
      }, 2500);
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // --- SHIFT CONTROLS ---
  const handleCallNext = () => {
    if (servingToken && servingStatus !== "Idle") {
      showToast("warning", "Please finish or skip your current ticket before calling next.");
      return;
    }

    if (waitingQueue.length === 0) {
      showToast("info", "No more customers in the queue list.");
      return;
    }

    // Grab first item
    const nextItem = waitingQueue[0];
    setWaitingQueue((prev) => prev.slice(1));
    setServingToken(nextItem);
    setServingStatus("Called");
    showToast("success", `Now Calling: ${nextItem.number} (${nextItem.customerName})`);
    triggerAnnounceSound(nextItem.number);
  };

  const handleRecall = () => {
    if (servingToken) {
      triggerAnnounceSound(servingToken.number);
      showToast("info", `Re-announced token ${servingToken.number} to Counter ${counterId}.`);
    }
  };

  const handleStartService = () => {
    if (servingToken) {
      setServingStatus("Processing");
      showToast("success", `Service session started for token ${servingToken.number}.`);
    }
  };

  const handleCompleteService = () => {
    if (servingToken) {
      showToast("success", `Completed session for token ${servingToken.number} successfully.`);
      setServingToken(null);
      setServingStatus("Idle");
    }
  };

  const handleNoShow = () => {
    if (servingToken) {
      showToast("warning", `Token ${servingToken.number} marked as No Show.`);
      setServingToken(null);
      setServingStatus("Idle");
    }
  };

  const handleSkipService = () => {
    if (servingToken) {
      const skipped: SkippedToken = {
        number: servingToken.number,
        customerName: servingToken.customerName,
        department: servingToken.department,
        skippedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSkippedLane((prev) => [skipped, ...prev]);
      showToast("warning", `Token ${servingToken.number} sent to skipped / holding lane.`);
      setServingToken(null);
      setServingStatus("Idle");
    }
  };

  const handleRecallSkipped = (skipped: SkippedToken) => {
    if (servingToken && servingStatus !== "Idle") {
      showToast("warning", "Finish your active ticket before recalling a holding customer.");
      return;
    }

    // Convert skipped to active serving
    const token: QueuedToken = {
      id: "skipped-" + skipped.number,
      number: skipped.number,
      customerName: skipped.customerName,
      department: skipped.department,
      type: "walk-in",
      position: 0,
      waitTime: "Skipped",
      priority: "standard"
    };

    setSkippedLane((prev) => prev.filter((t) => t.number !== skipped.number));
    setServingToken(token);
    setServingStatus("Called");
    showToast("success", `Recalled skipped customer: ${token.number}`);
    triggerAnnounceSound(token.number);
  };

  const handleCallOutOfOrder = (token: QueuedToken) => {
    if (servingToken && servingStatus !== "Idle") {
      showToast("warning", "Please complete your active session before calling from queue.");
      return;
    }

    setWaitingQueue((prev) => prev.filter((t) => t.id !== token.id));
    setServingToken(token);
    setServingStatus("Called");
    showToast("success", `Directly calling out-of-order: ${token.number}`);
    triggerAnnounceSound(token.number);
  };

  // --- BREAK LOGIC ---
  const handleStartBreak = () => {
    setBreakModalOpen(false);
    setOnBreak(true);
    setBreakTimeRemaining(breakDurationMinutes * 60);
    showToast("warning", `On Break: ${selectedBreakReason} for ${breakDurationMinutes} minutes.`);
  };

  const handleResumeFromBreak = () => {
    setOnBreak(false);
    showToast("success", "Welcome back! Your serving shift is active.");
  };

  // --- TRANSFER CONFIRMATION ---
  const handleConfirmTransfer = () => {
    if (!servingToken) return;

    showToast("success", `Transferred token ${servingToken.number} to ${selectedDept} via [${transferMode}] mode.`);
    setServingToken(null);
    setServingStatus("Idle");
    setTransferModalOpen(false);
    setTransferStep(1);
    setSelectedDept("");
    setTransferReason("");
    setTransferNotes("");
  };

  // --- FILTERED QUEUE LIST ---
  const filteredQueue = waitingQueue.filter((token) => {
    if (activeQueueTab === "All") return true;
    if (activeQueueTab === "Walk-In") return token.type === "walk-in";
    if (activeQueueTab === "Appointments") return token.type === "appointment";
    return true;
  });

  // Helper formats
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatShiftTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  // Priority badge styling helper
  const getPriorityBadgeClass = (priority: QueuedToken["priority"]) => {
    switch (priority) {
      case "pregnant":
        return "bg-pink-100 text-pink-700 border border-pink-200";
      case "disabled":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "elderly":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "vip":
        return "bg-purple-100 text-purple-700 border border-purple-200 font-extrabold";
      case "emergency":
        return "bg-red-100 text-red-700 border border-red-200 animate-pulse font-bold";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-cabin relative">
      {/* GLOBAL TOAST PORTAL */}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-3 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 bg-white ${
                toast.type === "success" ? "border-emerald-200 text-emerald-900 shadow-emerald-100/40" :
                toast.type === "error" ? "border-red-200 text-red-900 shadow-red-100/40" :
                toast.type === "warning" ? "border-amber-200 text-amber-900 shadow-amber-100/40" :
                "border-sky-200 text-sky-900 shadow-sky-100/40"
              }`}
            >
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
              {toast.type === "error" && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
              {toast.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
              {toast.type === "info" && <Clock3 className="w-5 h-5 text-sky-500 shrink-0" />}
              
              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* HEADER SECTION */}
      <header
        id="console-header"
        className="sticky top-0 z-[110] px-6 py-3.5 flex items-center justify-between gap-4 border-b transition-all duration-300 animate-none"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.45)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.3)"
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-boldonse tracking-tight text-[25px] md:text-2xl text-brand-navy hover:text-brand-ocean transition-colors duration-300 select-none cursor-pointer">
              Linely
            </span>
            <span className="bg-brand-navy/10 text-brand-navy border border-brand-navy/15 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-widest font-rethink">
              Console
            </span>
          </div>

          <div className="h-5 w-[1px] bg-slate-200 hidden lg:block" />

          {/* Pill-shaped Counter and Department Information */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 backdrop-blur-md p-1 rounded-full border border-slate-200/50 shadow-sm font-rethink">
            <span className="bg-brand-navy text-white px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
              Counter {counterId}
            </span>
            <span className="bg-brand-ocean/10 text-brand-navy px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              {department}
            </span>
          </div>
        </div>

        {/* Desktop Controls (hidden on mobile, visible on lg and up) */}
        <div className="hidden lg:flex items-center gap-3 ml-auto">
          {/* Lane selector dropdown */}
          <div className="relative shrink-0">
            <select
              value={laneMode}
              onChange={(e) => {
                setLaneMode(e.target.value as any);
              }}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-brand-navy/30 text-brand-navy rounded-full pl-5 pr-10 py-2 text-[14px] font-bold font-rethink focus:outline-none cursor-pointer focus:ring-2 focus:ring-brand-navy/10 appearance-none shadow-sm transition-all duration-200"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231A2372' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1.1rem center',
                backgroundSize: '1em'
              }}
            >
              <option className="text-slate-800" value="Auto">Auto Load</option>
              <option className="text-slate-800" value="Walk-In Only">Walk-In Only</option>
              <option className="text-slate-800" value="Appointment Only">Appointment Only</option>
            </select>
          </div>

          {/* Audio controls (Green active, Red and crossed when disabled) */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-full border border-slate-200/60 shadow-sm shrink-0">
            <button
              onClick={() => {
                setTtsEnabled(!ttsEnabled);
              }}
              className={`w-8 h-8 inline-flex items-center justify-center rounded-full border transition-all duration-200 cursor-pointer shadow-sm active:scale-95 ${
                ttsEnabled 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
                  : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
              }`}
              title={ttsEnabled ? "Voice (TTS) enabled - Click to disable" : "Voice (TTS) disabled - Click to enable"}
            >
              {ttsEnabled ? (
                <span className="material-symbols-outlined select-none text-emerald-600 inline-flex items-center justify-center" style={{ fontSize: '15px', width: '15px', height: '15px', lineHeight: '1', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}>volume_up</span>
              ) : (
                <span className="material-symbols-outlined select-none text-rose-600 inline-flex items-center justify-center" style={{ fontSize: '15px', width: '15px', height: '15px', lineHeight: '1', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}>volume_off</span>
              )}
            </button>
            <button
              onClick={() => {
                setChimeEnabled(!chimeEnabled);
              }}
              className={`w-8 h-8 inline-flex items-center justify-center rounded-full border transition-all duration-200 cursor-pointer shadow-sm active:scale-95 ${
                chimeEnabled 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
                  : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
              }`}
              title={chimeEnabled ? "Chime alert enabled - Click to disable" : "Chime alert disabled - Click to enable"}
            >
              {chimeEnabled ? (
                <span className="material-symbols-outlined select-none text-emerald-600 inline-flex items-center justify-center" style={{ fontSize: '15px', width: '15px', height: '15px', lineHeight: '1', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}>notifications</span>
              ) : (
                <span className="material-symbols-outlined select-none text-rose-600 inline-flex items-center justify-center" style={{ fontSize: '15px', width: '15px', height: '15px', lineHeight: '1', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}>notifications_off</span>
              )}
            </button>
          </div>



          {/* Premium-styled buttons */}
          <button
            onClick={() => setShiftCompleted(true)}
            className="inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold font-rethink text-xs w-32 py-2 rounded-full shadow-sm active:scale-95 cursor-pointer focus:outline-none shrink-0 transition-colors"
          >
            <span>End Shift</span>
            <span className="material-symbols-outlined select-none inline-flex items-center justify-center" style={{ fontSize: '15px', width: '15px', height: '15px', lineHeight: '1' }}>done_all</span>
          </button>

          <button
            onClick={onOpenTV}
            className="inline-flex items-center justify-center gap-1.5 bg-brand-navy hover:bg-brand-ocean text-white font-bold font-rethink text-xs px-4 py-2 rounded-full shadow-sm active:scale-95 cursor-pointer focus:outline-none shrink-0 transition-colors"
            title="Open Waiting Room TV Screen"
          >
            <span>TV Screen</span>
            <Tv className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setBreakModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 bg-yellow-400 text-black font-bold font-rethink text-xs w-24 py-2 rounded-full shadow-sm active:scale-95 cursor-pointer focus:outline-none shrink-0"
          >
            <span>Break</span>
            <span className="material-symbols-outlined select-none inline-flex items-center justify-center" style={{ fontSize: '15px', width: '15px', height: '15px', lineHeight: '1' }}>coffee</span>
          </button>

          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center gap-1.5 bg-red-600 text-white font-bold font-rethink text-xs w-24 py-2 rounded-full shadow-sm active:scale-95 cursor-pointer focus:outline-none shrink-0"
          >
            <span>Log Out</span>
            <span className="material-symbols-outlined select-none inline-flex items-center justify-center" style={{ fontSize: '15px', width: '15px', height: '15px', lineHeight: '1' }}>logout</span>
          </button>
        </div>

        {/* Mobile Controls Trigger (visible on screens smaller than lg) */}
        <div className="flex lg:hidden items-center gap-2 ml-auto">
          {/* Compact Shift Countdown on mobile */}
          <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-sm text-xs ${
            shiftTimeRemaining < 300 
              ? "bg-rose-50 border-rose-200 text-rose-700 font-medium animate-pulse" 
              : "bg-slate-50 border-slate-200 text-slate-700"
          }`}>
            <Clock className={`w-3.5 h-3.5 ${shiftTimeRemaining < 300 ? "text-rose-500" : "text-slate-500"}`} />
            <span className="font-bold font-rethink">{formatShiftTime(shiftTimeRemaining)}</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Controls</span>
          </button>
        </div>
      </header>

      {/* MOBILE SETTINGS SHEET / DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[150] lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            {/* Slide-Up Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl border-t border-slate-100 shadow-2xl p-6 flex flex-col gap-6"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-rethink text-base font-bold text-slate-900">Console Controls</h3>
                  <p className="text-xs text-slate-500">Configure your active workspace session</p>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content Body */}
              <div className="flex flex-col gap-5 overflow-y-auto max-h-[60vh] pr-1">
                {/* Active Context Details */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50/70 border border-slate-100 p-3.5 rounded-2xl">
                  <div className="col-span-2 border-b border-slate-100 pb-2 mb-1">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider leading-none mb-1">Facility & Team</span>
                    <span className="text-xs font-semibold text-slate-600">{facility}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider leading-none mb-1">Station</span>
                    <span className="text-xs font-bold text-slate-800">Counter {counterId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider leading-none mb-1">Department</span>
                    <span className="text-xs font-bold text-slate-800 truncate block">{department}</span>
                  </div>
                </div>

                {/* Lane mode selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Queue Lane Mode</label>
                  <div className="relative">
                    <select
                      value={laneMode}
                      onChange={(e) => {
                        setLaneMode(e.target.value as any);
                      }}
                      className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full pl-4 pr-10 py-2.5 text-xs font-bold font-rethink focus:outline-none cursor-pointer focus:ring-2 focus:ring-brand-navy/15 focus:border-brand-navy appearance-none shadow-sm transition-all"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1em'
                      }}
                    >
                      <option value="Auto">Auto Load</option>
                      <option value="Walk-In Only">Walk-In Only</option>
                      <option value="Appointment Only">Appointment Only</option>
                    </select>
                  </div>
                </div>

                {/* Audio toggles */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Announcement Sounds</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setTtsEnabled(!ttsEnabled);
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border font-bold font-rethink text-xs transition-all cursor-pointer ${
                        ttsEnabled 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm" 
                          : "bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100"
                      }`}
                    >
                      {ttsEnabled ? (
                        <span className="material-symbols-outlined select-none text-emerald-600 inline-flex items-center justify-center" style={{ fontSize: '16px', width: '16px', height: '16px', lineHeight: '1' }}>volume_up</span>
                      ) : (
                        <span className="material-symbols-outlined select-none text-rose-600 inline-flex items-center justify-center" style={{ fontSize: '16px', width: '16px', height: '16px', lineHeight: '1' }}>volume_off</span>
                      )}
                      <span>Voice (TTS)</span>
                    </button>

                    <button
                      onClick={() => {
                        setChimeEnabled(!chimeEnabled);
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border font-bold font-rethink text-xs transition-all cursor-pointer ${
                        chimeEnabled 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm" 
                          : "bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100"
                      }`}
                    >
                      {chimeEnabled ? (
                        <span className="material-symbols-outlined select-none text-emerald-600 inline-flex items-center justify-center" style={{ fontSize: '16px', width: '16px', height: '16px', lineHeight: '1' }}>notifications</span>
                      ) : (
                        <span className="material-symbols-outlined select-none text-rose-600 inline-flex items-center justify-center" style={{ fontSize: '16px', width: '16px', height: '16px', lineHeight: '1' }}>notifications_off</span>
                      )}
                      <span>Chime Alert</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4 mt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTV?.();
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-brand-navy hover:bg-brand-ocean text-white font-bold font-rethink text-xs py-2.5 rounded-full cursor-pointer shadow-md active:scale-95 transition-all"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Launch Waiting Room TV</span>
                </button>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShiftCompleted(true);
                    }}
                    className="inline-flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold font-rethink text-xs py-2 rounded-full cursor-pointer shadow-sm active:scale-95 transition-colors"
                  >
                  <span>End Shift</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setBreakModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-1 bg-yellow-400 text-black font-bold font-rethink text-xs py-2 rounded-full cursor-pointer shadow-sm active:scale-95"
                >
                  <span>Break</span>
                  <span className="material-symbols-outlined select-none inline-flex items-center justify-center" style={{ fontSize: '14px', width: '14px', height: '14px', lineHeight: '1' }}>coffee</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="inline-flex items-center justify-center gap-1 bg-red-600 text-white font-bold font-rethink text-xs py-2 rounded-full cursor-pointer shadow-sm active:scale-95"
                >
                  <span>Log Out</span>
                  <span className="material-symbols-outlined select-none inline-flex items-center justify-center" style={{ fontSize: '14px', width: '14px', height: '14px', lineHeight: '1' }}>logout</span>
                </button>
              </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN TWO-COLUMN CONTAINER */}
      <main className="flex-1 max-w-8xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: NOW SERVING HUD (9 COLS ON DESKTOP) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* NOW SERVING WORKSPACE AREA */}
          <div className="bg-white/80 backdrop-blur-3xl border border-white/60 rounded-[32px] p-6 sm:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] flex-1 flex flex-col justify-between relative overflow-hidden isolate">
            
            {/* Ambient Beautiful Mesh Background matching Linely brand aesthetics */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
              
              {/* Colored Glows */}
              <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-gradient-to-br from-brand-cyan/25 to-brand-ocean/15 rounded-full blur-[100px] mix-blend-multiply" />
              <div className="absolute top-[10%] -right-[20%] w-[60%] h-[60%] bg-gradient-to-tl from-brand-ocean/20 to-brand-navy/5 rounded-full blur-[100px] mix-blend-multiply" />
              <div className="absolute -bottom-[20%] left-[20%] w-[80%] h-[60%] bg-gradient-to-t from-brand-navy/15 to-transparent rounded-full blur-[120px] mix-blend-multiply" />
              
              {/* Linely Inspired Liquid Waves */}
              <svg className="absolute -bottom-[10%] left-0 w-[120%] h-[70%] text-brand-ocean/20 transform -translate-x-[5%] pointer-events-none" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="currentColor" fillOpacity="0.3" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,229.3C960,213,1056,171,1152,149.3C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                <path fill="currentColor" fillOpacity="0.4" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,117.3C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                <path fill="url(#wave-gradient)" fillOpacity="0.25" d="M0,160L48,170.7C96,181,192,203,288,186.7C384,171,480,117,576,106.7C672,96,768,128,864,160C960,192,1056,224,1152,218.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                <defs>
                  <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-brand-cyan)" stopOpacity="1" />
                    <stop offset="50%" stopColor="var(--color-brand-ocean)" stopOpacity="1" />
                    <stop offset="100%" stopColor="var(--color-brand-navy)" stopOpacity="1" />
                  </linearGradient>
                </defs>
              </svg>

              {/* High-end SVG noise texture overlay */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.25] mix-blend-overlay">
                <filter id="premium-noise">
                  <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                  <feColorMatrix type="saturate" values="0"/>
                </filter>
                <rect width="100%" height="100%" filter="url(#premium-noise)" />
              </svg>
            </div>

            {/* Serving workspace status banner */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-ocean"></span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Operator Serving Hub
                </h2>
              </div>
              
              {servingToken && (
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-extrabold uppercase px-3 py-1 rounded-full border ${
                    servingStatus === "Called"
                      ? "bg-amber-50 border-amber-200 text-amber-700 animate-pulse"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}>
                    Status: {servingStatus}
                  </span>
                  {servingStatus === "Processing" && (
                    <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-mono font-bold border border-slate-200/60">
                      <Clock className="w-3.5 h-3.5 text-slate-500 animate-spin" style={{ animationDuration: "3s" }} />
                      <span>{formatTime(serviceTimer)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CONDITIONAL BODY: IDLE vs SERVING */}
            <div className="my-auto py-10 flex flex-col items-center justify-center text-center z-10">
              <AnimatePresence mode="wait">
                {!servingToken || servingStatus === "Idle" ? (
                  <motion.div
                    key="idle-state"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="flex flex-col items-center max-w-sm"
                  >
                    <div className="w-20 h-20 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 mb-6">
                      <Users className="w-8 h-8 opacity-65" />
                    </div>
                    <h3 className="font-rethink text-xl font-bold text-brand-navy mb-2">No Active Customer</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                      Your workspace queue is primed and ready. Click the Call Next button below to fetch the highest priority customer automatically.
                    </p>

                    <button
                      onClick={handleCallNext}
                      className="bg-brand-navy hover:bg-brand-ocean active:scale-95 text-white font-bold font-rethink text-base px-10 py-5 rounded-full shadow-lg shadow-brand-navy/15 transition-all flex items-center gap-3 cursor-pointer group"
                    >
                      <span>Call Next Token</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="serving-state"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="w-full flex flex-col items-center"
                  >
                    {/* Token priority style accent wrapper */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-brand-navy/5 rounded-3xl -m-4 blur-xl pointer-events-none" />
                      <div className={`text-7xl sm:text-8xl md:text-9xl font-boldonse font-black tracking-tighter px-14 py-8 rounded-[36px] bg-gradient-to-br border shadow-xl relative z-10 select-none ${
                        servingToken.priority === "vip" || servingToken.priority === "emergency"
                          ? "from-rose-50 via-red-50 to-rose-100/40 text-red-600 border-red-200 shadow-rose-100"
                          : "from-brand-navy/5 via-slate-50 to-white text-brand-navy border-slate-200/70"
                      }`}>
                        {servingToken.number}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 mb-2">
                      <h4 className="font-rethink font-bold text-2xl text-brand-navy">
                        {servingToken.customerName}
                      </h4>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        servingToken.type === "appointment" 
                          ? "bg-purple-100 text-purple-700 border border-purple-200" 
                          : "bg-teal-100 text-teal-700 border border-teal-200"
                      }`}>
                        {servingToken.type}
                      </span>
                      {servingToken.priority !== "standard" && (
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${getPriorityBadgeClass(servingToken.priority)}`}>
                          {servingToken.priority}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-500 font-medium max-w-md">
                      Routing Department: <strong className="text-slate-700">{servingToken.department}</strong>
                    </p>

                    {servingToken.scheduledTime && (
                      <p className="text-xs font-semibold text-purple-600/90 mt-1">
                        Scheduled Slot: {servingToken.scheduledTime} (Appointment)
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ACTION BUTTON PANEL FOR SERVING STATE */}
            {servingToken && servingStatus !== "Idle" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-slate-100 z-10">
                
                {/* 1. Start Service / Processing */}
                {servingStatus === "Called" ? (
                  <button
                    onClick={handleStartService}
                    className="col-span-2 sm:col-span-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-4.5 rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-700/10"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Service</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteService}
                    className="col-span-2 sm:col-span-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-4.5 rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-700/10"
                  >
                    <Check className="w-4 h-4" />
                    <span>Complete</span>
                  </button>
                )}

                {/* 2. Recall / Announce */}
                <button
                  onClick={handleRecall}
                  className="bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 text-brand-navy font-bold text-xs py-4.5 rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined select-none text-brand-ocean inline-flex items-center justify-center" style={{ fontSize: '16px', width: '16px', height: '16px', lineHeight: '1' }}>volume_up</span>
                  <span>Recall / Voice</span>
                </button>

                {/* 3. No Show */}
                <button
                  onClick={handleNoShow}
                  className="bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 font-bold text-xs py-4.5 rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserMinus className="w-4 h-4" />
                  <span>No Show</span>
                </button>

                {/* 4. Skip / Hold */}
                <button
                  onClick={handleSkipService}
                  className="bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 text-slate-600 font-bold text-xs py-4.5 rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FastForward className="w-4 h-4 text-amber-500" />
                  <span>Skip to Hold</span>
                </button>

                {/* 5. Transfer to Counter/Dept */}
                <button
                  onClick={() => setTransferModalOpen(true)}
                  className="bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 text-slate-600 font-bold text-xs py-4.5 rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 text-brand-ocean" />
                  <span>Transfer Dept</span>
                </button>

                {/* 6. QR Code Scanner toggler */}
                <button
                  onClick={handleToggleCamera}
                  className={`bg-white hover:bg-slate-50 active:scale-95 border text-slate-600 font-bold text-xs py-4.5 rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    cameraActive ? "border-brand-cyan/60 bg-brand-cyan/5 text-brand-navy" : "border-slate-200"
                  }`}
                >
                  <Camera className={`w-4 h-4 ${cameraActive ? "text-brand-navy" : "text-slate-500"}`} />
                  <span>Scan Ticket</span>
                </button>

              </div>
            )}
          </div>

          {/* INTEGRATED QR CAMERA VIEWER (Appears inline below the served token when active) */}
          <AnimatePresence>
            {cameraActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-inner flex flex-col"
              >
                <div className="bg-slate-950 p-4 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                      QR Scanner Active Viewport
                    </span>
                  </div>
                  <button
                    onClick={stopCamera}
                    className="text-slate-400 hover:text-white text-xs font-bold"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 items-center">
                  
                  {/* Camer Box */}
                  <div className="md:col-span-7 relative bg-black aspect-video rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center text-slate-500">
                    
                    {cameraPermissionGranted === true ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-6 flex flex-col items-center">
                        <Smartphone className="w-12 h-12 text-brand-cyan mb-2 animate-bounce" />
                        <span className="text-sm font-semibold text-slate-400">High-Fidelity Scanning Simulator</span>
                        <span className="text-xs text-slate-600 mt-1 max-w-xs">
                          Camera feed is emulated. Click simulated actions on the right to trigger barcode responses.
                        </span>
                      </div>
                    )}

                    {/* Scanning Laser HUD Graphic */}
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-brand-cyan/80 shadow-[0_0_10px_#00C3E3] animate-pulse" style={{
                      animationDuration: "1.5s",
                      animationIterationCount: "infinite",
                      animationTimingFunction: "ease-in-out"
                    }} />

                    {/* Target Corner brackets */}
                    <div className="absolute top-6 left-6 w-5 h-5 border-t-2 border-l-2 border-brand-cyan" />
                    <div className="absolute top-6 right-6 w-5 h-5 border-t-2 border-r-2 border-brand-cyan" />
                    <div className="absolute bottom-6 left-6 w-5 h-5 border-b-2 border-l-2 border-brand-cyan" />
                    <div className="absolute bottom-6 right-6 w-5 h-5 border-b-2 border-r-2 border-brand-cyan" />

                    {/* Scanner result overlay */}
                    {simulatedScannerMessage && (
                      <div className={`absolute inset-0 flex items-center justify-center font-mono font-bold text-lg ${
                        simulatedScannerMessage.includes("SUCCESS") ? "bg-emerald-950/90 text-emerald-300" : "bg-red-950/90 text-red-300"
                      }`}>
                        {simulatedScannerMessage}
                      </div>
                    )}
                  </div>

                  {/* Simulator Trigger Buttons */}
                  <div className="md:col-span-5 flex flex-col gap-3 justify-center text-left">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Developer Scanner Simulation Panel
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">
                      Simulate scanning a patient or customer's physical ticket barcode printout or mobile device screen.
                    </p>

                    <button
                      onClick={() => handleSimulateQRScan(true)}
                      className="bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-300 border border-emerald-800 px-4 py-3 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer"
                    >
                      <span>Simulate Scanning Current Ticket QR</span>
                      <strong className="font-mono text-[10px] bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded">
                        {servingToken ? servingToken.number : "None"}
                      </strong>
                    </button>

                    <button
                      onClick={() => handleSimulateQRScan(false)}
                      className="bg-rose-950/20 hover:bg-rose-950/30 text-rose-300 border border-rose-900/60 px-4 py-3 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer"
                    >
                      <span>Simulate Scanning Invalid Ticket QR</span>
                      <strong className="font-mono text-[10px] bg-rose-900 text-rose-100 px-2 py-0.5 rounded">
                        X-999
                      </strong>
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LOAD BALANCING METRICS PANEL */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-ocean" />
                <h3 className="font-rethink text-sm font-bold text-brand-navy uppercase tracking-wider">
                  Live Facility Load Balancing Network
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Updating every 15s via SignalR
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {otherCounters.map((ctr) => (
                <div
                  key={ctr.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between min-h-[92px] ${
                    ctr.number.includes("You")
                      ? "bg-brand-navy/5 border-brand-navy/10 text-brand-navy"
                      : "bg-[#F8FAFC] border-slate-200/60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase leading-none block">
                        Counter {ctr.number}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 truncate block mt-0.5 max-w-[95px]" title={ctr.operatorName}>
                        {ctr.operatorName}
                      </span>
                    </div>
                    {ctr.trend === "growing" ? (
                      <TrendingUp className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    ) : ctr.trend === "shrinking" ? (
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <span className="text-xs font-bold text-slate-400 font-mono">━</span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-bold font-rethink text-slate-800 leading-none">
                      {ctr.activeCount}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      in queue
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: QUEUE LIST SIDEBAR & HOLDING LANE (4 COLS ON DESKTOP) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          {/* SKIPPED / HOLDING LANE CONTAINER */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FastForward className="w-4 h-4 text-amber-500" />
                <h3 className="font-rethink text-sm font-bold text-brand-navy uppercase tracking-wider">
                  Skipped / Holding Lane ({skippedLane.length})
                </h3>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                Holding Zone
              </span>
            </div>

            {skippedLane.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No tickets currently holding in skipped lane.
              </div>
            ) : (
              <div className="relative">
                <div className="flex flex-col gap-2.5">
                  {(isSkippedExpanded ? skippedLane : skippedLane.slice(0, 2)).map((t) => (
                    <div
                      key={t.number}
                      className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 flex items-center justify-between transition-colors hover:bg-amber-50/60"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="font-rethink text-sm text-brand-navy font-bold">{t.number}</strong>
                          <span className="text-[10px] text-slate-400">Skipped: {t.skippedAt}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[150px]">{t.customerName}</p>
                      </div>
                      
                      <button
                        onClick={() => handleRecallSkipped(t)}
                        className="bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 hover:border-amber-300 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Recall
                      </button>
                    </div>
                  ))}
                </div>
                {skippedLane.length > 2 && (
                  <div className="flex justify-center mt-3 relative z-10">
                    <button
                      onClick={() => setIsSkippedExpanded(!isSkippedExpanded)}
                      className="bg-white rounded-full px-3 py-1.5 border border-slate-200 shadow-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1 text-xs font-medium"
                      title={isSkippedExpanded ? "Show less" : `Show ${skippedLane.length - 2} more`}
                    >
                      <span className="material-symbols-outlined select-none inline-flex items-center justify-center transition-transform" style={{ fontSize: '18px', width: '18px', height: '18px', lineHeight: '1' }}>
                        {isSkippedExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                      <span>{isSkippedExpanded ? 'Less' : `${skippedLane.length - 2} More`}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACTIVE QUEUE STREAM PANEL */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-ocean" />
                <h3 className="font-rethink text-sm font-bold text-brand-navy uppercase tracking-wider">
                  Facility Waiting Stream ({waitingQueue.length})
                </h3>
              </div>
            </div>

            {/* THREE TABS */}
            <div className="grid grid-cols-3 gap-1 bg-[#F1F5F9] p-1 rounded-xl mb-4 text-center">
              {(["All", "Walk-In", "Appointments"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveQueueTab(tab)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeQueueTab === tab
                      ? "bg-white text-brand-navy shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* QUEUE STREAM LIST */}
            <div className="flex-1 overflow-y-auto max-h-[380px] lg:max-h-none flex flex-col gap-3 pr-1">
              <AnimatePresence initial={false}>
                {filteredQueue.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2 opacity-65" />
                    <span>No waiting customers matching this filter.</span>
                  </div>
                ) : (
                  filteredQueue.map((token) => (
                    <motion.div
                      key={token.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-3.5 bg-[#F8FAFC] hover:bg-slate-50 rounded-xl border border-slate-200/50 flex items-center justify-between gap-3 transition-colors group relative"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-rethink text-sm font-bold text-brand-navy">
                            {token.number}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold font-mono">
                            Pos: #{token.position}
                          </span>
                          
                          {/* Priority specific distinct badge */}
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${getPriorityBadgeClass(token.priority)}`}>
                            {token.priority}
                          </span>

                          {/* Appt specific scheduling status or due banner */}
                          {token.type === "appointment" && (
                            <>
                              <span className="text-[9px] font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                                {token.scheduledTime}
                              </span>
                              {token.isDue && (
                                <span className="text-[9px] font-extrabold bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200 animate-pulse">
                                  DUE
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                          <span className="truncate max-w-[120px] font-medium text-slate-700">{token.customerName}</span>
                          <span className="text-slate-300">•</span>
                          <span className="truncate text-slate-500 max-w-[110px]">{token.department}</span>
                        </div>
                      </div>

                      {/* Call out of order trigger */}
                      <button
                        onClick={() => handleCallOutOfOrder(token)}
                        className="bg-white hover:bg-brand-navy hover:text-white border border-slate-200 text-brand-navy font-bold text-xs px-3 py-2 rounded-lg transition-all cursor-pointer opacity-80 group-hover:opacity-100 shadow-sm"
                        title={`Call ticket ${token.number} out of order`}
                      >
                        Call
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* BOTTOM SUMMARY STATS */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Avg Wait: <strong>14 min</strong></span>
              <span>•</span>
              <span>Active Operators: <strong>5</strong></span>
            </div>
          </div>

        </section>

      </main>

      {/* THREE-STEP TRANSFER MODAL */}
      <AnimatePresence>
        {transferModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[990] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
            >
              {/* Header */}
              <div className="bg-brand-navy text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-rethink text-base font-bold">Transfer Active Token</h3>
                  <p className="text-xs text-brand-cyan mt-0.5 font-medium">
                    Currently Transferring: {servingToken?.number} ({servingToken?.customerName})
                  </p>
                </div>
                <button
                  onClick={() => {
                    setTransferModalOpen(false);
                    setTransferStep(1);
                  }}
                  className="text-white/75 hover:text-white text-xs font-bold p-1 rounded hover:bg-white/5 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Progress Steps Indicators */}
              <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    transferStep >= 1 ? "bg-brand-navy text-white" : "bg-slate-200"
                  }`}>1</span>
                  <span className={transferStep >= 1 ? "text-brand-navy" : ""}>Select Department</span>
                </div>
                <div className="h-0.5 w-6 bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    transferStep >= 2 ? "bg-brand-navy text-white" : "bg-slate-200"
                  }`}>2</span>
                  <span className={transferStep >= 2 ? "text-brand-navy" : ""}>Transfer Mode</span>
                </div>
                <div className="h-0.5 w-6 bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    transferStep === 3 ? "bg-brand-navy text-white" : "bg-slate-200"
                  }`}>3</span>
                  <span className={transferStep === 3 ? "text-brand-navy" : ""}>Confirm Details</span>
                </div>
              </div>

              {/* Step Contents */}
              <div className="p-6 flex-1">
                
                {/* STEP 1: SELECT TARGET DEPT */}
                {transferStep === 1 && (
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Choose Department Destination
                    </span>
                    
                    <div className="grid grid-cols-1 gap-2.5">
                      {[
                        { name: "Billing & Registration", queue: 4, activeCounters: 2 },
                        { name: "Consultation Room A", queue: 1, activeCounters: 1 },
                        { name: "Outpatient Pharmacy", queue: 8, activeCounters: 3 },
                        { name: "Diagnostic Laboratory", queue: 5, activeCounters: 2 },
                        { name: "Customer Service Relations", queue: 2, activeCounters: 1 },
                      ].map((deptItem) => (
                        <button
                          key={deptItem.name}
                          onClick={() => setSelectedDept(deptItem.name)}
                          className={`p-4.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            selectedDept === deptItem.name
                              ? "border-brand-navy bg-brand-navy/5 text-brand-navy ring-1 ring-brand-navy"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <span className="font-rethink text-sm font-bold block">{deptItem.name}</span>
                            <span className="text-xs text-slate-500 mt-0.5">
                              {deptItem.activeCounters} Online Counters
                            </span>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                              {deptItem.queue} in line
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: TRANSFER MODE */}
                {transferStep === 2 && (
                  <div className="flex flex-col gap-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Select Queue Placement Mode
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: "Standard", title: "Standard Transfer", desc: "Places the customer at the standard end of the destination queue." },
                        { id: "Priority", title: "Front of Line (Priority)", desc: "Places customer directly at Position #1 for immediate next call." },
                        { id: "Warm Handoff", title: "Warm Handoff Room", desc: "Holds customer in virtual lounge until recipient operator accepts." },
                        { id: "Return", title: "Return to Counter", desc: "Sends back to current counter after they complete second task." },
                      ].map((modeItem) => (
                        <button
                          key={modeItem.id}
                          onClick={() => setTransferMode(modeItem.id as any)}
                          className={`p-4 rounded-xl border text-left flex flex-col justify-between min-h-[110px] transition-all cursor-pointer ${
                            transferMode === modeItem.id
                              ? "border-brand-navy bg-brand-navy/5 text-brand-navy ring-1 ring-brand-navy"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <span className="font-rethink text-sm font-bold">{modeItem.title}</span>
                          <p className="text-xs text-slate-500 leading-normal mt-1">{modeItem.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: REASON & NOTE CONFIRMATION */}
                {transferStep === 3 && (
                  <div className="flex flex-col gap-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Handoff Narrative & Case Notes
                    </span>

                    <div className="flex flex-col gap-3.5">
                      <div>
                        <label className="text-xs text-slate-400 block font-bold mb-1.5 uppercase">Primary Transfer Reason</label>
                        <select
                          value={transferReason}
                          onChange={(e) => setTransferReason(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-navy"
                        >
                          <option value="">Select a standard reason code...</option>
                          <option value="Referred for diagnostic laboratory screening">Diagnostic Laboratory Screening</option>
                          <option value="Prescription billing check verification">Prescription Billing Verification</option>
                          <option value="Incorrect triage department choice">Incorrect Initial Choice</option>
                          <option value="Escalated management intervention case">Escalated Management Case</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block font-bold mb-1.5 uppercase">Internal Operator Hand-off Notes</label>
                        <textarea
                          rows={3}
                          placeholder="Type specific case remarks that the target counter operator should see immediately when they accept this patient..."
                          value={transferNotes}
                          onChange={(e) => setTransferNotes(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-navy placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Actions Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (transferStep > 1) {
                      setTransferStep((prev) => prev - 1);
                    } else {
                      setTransferModalOpen(false);
                    }
                  }}
                  className="bg-white border border-slate-200 hover:bg-slate-50 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-slate-600"
                >
                  {transferStep > 1 ? "Back" : "Cancel"}
                </button>

                <button
                  onClick={() => {
                    if (transferStep === 1) {
                      if (!selectedDept) {
                        showToast("error", "Please select a target department first.");
                        return;
                      }
                      setTransferStep(2);
                    } else if (transferStep === 2) {
                      setTransferStep(3);
                    } else {
                      handleConfirmTransfer();
                    }
                  }}
                  className="bg-brand-navy hover:bg-brand-ocean active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>{transferStep === 3 ? "Complete Transfer" : "Next Step"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BREAK CONFIGURATION MODAL */}
      <AnimatePresence>
        {breakModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[990] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col p-8 items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-6 shadow-sm border border-amber-100/50">
                <span className="material-symbols-outlined select-none" style={{ fontSize: '32px' }}>free_breakfast</span>
              </div>
              
              <h3 className="font-rethink text-2xl font-extrabold text-brand-navy mb-3">Take a Break?</h3>
              <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed max-w-[320px]">
                You are about to start your break. While you are away, you will stop receiving new customer tokens.
              </p>

              <div className="w-full text-left flex flex-col gap-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Break Reason</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 select-none" style={{ fontSize: '18px' }}>edit</span>
                    <input 
                      type="text" 
                      value={selectedBreakReason}
                      onChange={(e) => setSelectedBreakReason(e.target.value)}
                      placeholder="e.g. Scheduled Break, Lunch..."
                      className="w-full bg-white border border-slate-200 text-brand-navy font-bold text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Duration (Minutes)</label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-28 shrink-0">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 select-none" style={{ fontSize: '18px' }}>timer</span>
                      <input 
                        type="number" 
                        min="1"
                        max="240"
                        value={breakDurationMinutes}
                        onChange={(e) => setBreakDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-white border border-slate-200 text-brand-navy font-bold text-sm rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all shadow-sm"
                      />
                    </div>
                    
                    <div className="flex gap-2 flex-1">
                      {[15, 30, 60].map(mins => (
                        <button
                          key={mins}
                          onClick={() => setBreakDurationMinutes(mins)}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            breakDurationMinutes === mins
                              ? "bg-brand-navy border border-brand-navy text-white"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-4 mb-6 flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-500">Break Starts</span>
                  <span className="text-brand-navy">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-500">Expected Return</span>
                  <span className="text-brand-navy">{new Date(Date.now() + breakDurationMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={handleStartBreak}
                  className="w-full bg-brand-navy hover:bg-brand-ocean text-white font-bold text-sm py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-navy/20 active:scale-[0.98]"
                >
                  Start Break
                </button>
                <button
                  onClick={() => setBreakModalOpen(false)}
                  className="w-full bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-bold text-sm py-3.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN ON-BREAK SCREEN OVERLAY */}
      <AnimatePresence>
        {onBreak && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy z-[999] flex flex-col items-center justify-center text-center p-6 text-white"
          >
            {/* Ambient background waves */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,40 C30,15 70,85 100,60 L100,100 L0,100 Z" fill="#ffffff" />
                <path d="M0,60 C40,40 60,95 100,75 L100,100 L0,100 Z" fill="#00C3E3" />
              </svg>
            </div>

            <div className="relative z-10 max-w-md w-full flex flex-col items-center gap-6">
              {/* Spinning serene graphic */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white/10 flex items-center justify-center">
                  <Clock className="w-10 h-10 text-brand-cyan animate-spin" style={{ animationDuration: "12s" }} />
                </div>
                <span className="absolute -top-1 -right-1 bg-amber-500 text-brand-navy rounded-full text-[10px] font-extrabold uppercase px-2 py-0.5 shadow">
                  Paused
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <h2 className="font-rethink text-3xl font-extrabold tracking-tight">Operator is on Break</h2>
                <span className="text-sm text-brand-cyan uppercase font-bold tracking-widest block">
                  Reason Code: {selectedBreakReason}
                </span>
              </div>

              {/* Break countdown timer */}
              <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-5 font-mono text-5xl font-bold tracking-tight text-white shadow-xl">
                {formatTime(breakTimeRemaining)}
              </div>

              <p className="text-xs text-white/50 leading-relaxed max-w-sm mb-4">
                The queue is actively load-balancing customer traffic to online counters automatically. Relax, recharge, and click below when you are ready to resume.
              </p>

              <button
                onClick={handleResumeFromBreak}
                className="bg-brand-cyan hover:bg-white text-brand-navy font-bold font-rethink text-base px-8 py-4 rounded-full shadow-lg transition-all duration-300 active:scale-95 cursor-pointer"
              >
                Resume Active Serving Shift
              </button>
            </div>
          </motion.div>
        )}

        {shiftCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy z-[999] flex flex-col items-center justify-center text-center p-6 text-white"
          >
            {/* Ambient background waves */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,40 C30,15 70,85 100,60 L100,100 L0,100 Z" fill="#ffffff" />
                <path d="M0,60 C40,40 60,95 100,75 L100,100 L0,100 Z" fill="#00C3E3" />
              </svg>
            </div>

            <div className="relative z-10 max-w-md w-full flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white/10 flex items-center justify-center bg-white/5">
                  <span className="material-symbols-outlined text-brand-cyan" style={{ fontSize: '40px' }}>check_circle</span>
                </div>
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full text-[10px] font-extrabold uppercase px-2 py-0.5 shadow">
                  Completed
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <h2 className="font-rethink text-3xl font-extrabold tracking-tight">Shift Completed</h2>
                <span className="text-sm text-brand-cyan uppercase font-bold tracking-widest block">
                  Great job today!
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl w-full text-left flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Total Served</span>
                  <span className="font-bold text-white">42 Customers</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Avg. Service Time</span>
                  <span className="font-bold text-white">04:12</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Counter Efficiency</span>
                  <span className="font-bold text-emerald-400">94%</span>
                </div>
              </div>

              <p className="text-xs text-white/50 leading-relaxed max-w-sm mb-4">
                Your queue has been closed and any remaining customers have been load-balanced to other active counters. You can now safely log out of the operator console.
              </p>

              <button
                onClick={onLogout}
                className="bg-brand-cyan hover:bg-white text-brand-navy font-bold font-rethink text-base px-8 py-4 rounded-full shadow-lg transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
                Log Out of Console
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
