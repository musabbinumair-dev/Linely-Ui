import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Volume2, 
  VolumeX, 
  Tv, 
  Smartphone, 
  Globe, 
  Clock, 
  Calendar, 
  CalendarDays,
  Repeat, 
  AlertCircle, 
  AlertTriangle,
  Info, 
  Search, 
  X, 
  Play, 
  Pause, 
  Upload, 
  Check, 
  Trash2, 
  Filter, 
  Radio, 
  Bell, 
  Layers,
  ChevronRight,
  ArrowRight,
  Plus,
  RefreshCw,
  Eye,
  FileAudio
} from "lucide-react";

interface Department {
  id: string;
  name: string;
  prefix: string;
}

interface Counter {
  id: string;
  name: string;
  departmentId: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: string;
  severity: "Info" | "Warning" | "Critical";
}

export interface AnnouncementItem {
  id: string;
  timestamp: string; // ISO or human readable
  type: "Token Call" | "General Announcement";
  message: string;
  priority: "Normal" | "Urgent" | "Emergency";
  targetScope: string;
  channels: string[]; // e.g. ["TV Display", "Audio/Speakers"]
  status: "Sent" | "Scheduled" | "Failed" | "Cancelled";
  createdBy: string;
  contentType: string; // e.g., "Text", "Voice TTS", "Audio Upload", "Combo"
  scheduledTime?: string;
  recurrence?: {
    pattern: "daily" | "weekly" | "custom";
    time: string;
    days?: string[];
  };
}

interface AnnouncementsProps {
  departments: Department[];
  counters: Counter[];
  showAdminToast: (type: "success" | "info" | "warning", text: string) => void;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
}

export default function Announcements({
  departments = [],
  counters = [],
  showAdminToast,
  auditLogs,
  setAuditLogs
}: AnnouncementsProps) {
  // Page Tabs: "create" or "history"
  const [activeSubTab, setActiveSubTab] = useState<"create" | "history">("create");

  // Web Audio Synth Chime
  const playAudioChime = (priority: "Normal" | "Urgent" | "Emergency") => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      if (priority === "Normal") {
        // Soft Dual Chime
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.frequency.setValueAtTime(554.37, now); // Db5
        osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc1.start(now);
        osc1.stop(now + 0.5);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.5);
      } else if (priority === "Urgent") {
        // High Alert Triple Chime
        const freqs = [554.37, 659.25, 880]; // Db5, E5, A5
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.4);
        });
      } else {
        // Emergency Horn
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = "sawtooth";
        osc2.type = "sawtooth";
        osc1.frequency.setValueAtTime(380, now);
        osc2.frequency.setValueAtTime(383, now); // Beating detune
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.4);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.75);
        osc1.start(now);
        osc1.stop(now + 0.8);
        osc2.start(now);
        osc2.stop(now + 0.8);
      }
    } catch (e) {
      console.warn("Chime play error: ", e);
    }
  };

  // Initial Announcement History (Unified record of automated token calls + general alerts)
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([
    {
      id: "ann-1",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      type: "Token Call",
      message: "Ticket P-402 called to Counter 02 by Operator Sarah Jenkins",
      priority: "Normal",
      targetScope: "Counter 02",
      channels: ["TV Display", "Audio/Speakers"],
      status: "Sent",
      createdBy: "System",
      contentType: "Voice TTS"
    },
    {
      id: "ann-2",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      type: "General Announcement",
      message: "Please note: Service Desk 04 is currently closed for clean-up. Customers assigned to Clinical Consultation will be served at Desk 03.",
      priority: "Urgent",
      targetScope: "All Departments",
      channels: ["TV Display", "Audio/Speakers", "Mobile App"],
      status: "Sent",
      createdBy: "Admin Console",
      contentType: "Text + Voice TTS"
    },
    {
      id: "ann-3",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      type: "Token Call",
      message: "Ticket A-102 called to Counter 01 by Operator Marcus Brody",
      priority: "Normal",
      targetScope: "Counter 01",
      channels: ["TV Display", "Audio/Speakers"],
      status: "Sent",
      createdBy: "System",
      contentType: "Voice TTS"
    },
    {
      id: "ann-4",
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      type: "General Announcement",
      message: "EMERGENCY BROADCAST: All patients and staff please note that the fire alarm testing is scheduled for today at 4:30 PM. No evacuation is required.",
      priority: "Emergency",
      targetScope: "All Departments",
      channels: ["TV Display", "Audio/Speakers", "Mobile App", "Web Booking"],
      status: "Sent",
      createdBy: "Admin Console",
      contentType: "Text + Voice TTS"
    },
    {
      id: "ann-5",
      timestamp: new Date(Date.now() + 180 * 60 * 1000).toISOString(), // future scheduled
      type: "General Announcement",
      message: "Regular facility cleaning scheduled for 9 PM. Service desks will reduce active counters.",
      priority: "Normal",
      targetScope: "All Departments",
      channels: ["TV Display", "Mobile App"],
      status: "Scheduled",
      createdBy: "Admin Console",
      contentType: "Text Only",
      scheduledTime: new Date(Date.now() + 180 * 60 * 1000).toLocaleString()
    }
  ]);

  // Recurring announcement rule configurations
  interface RecurringRule {
    id: string;
    message: string;
    priority: "Normal" | "Urgent" | "Emergency";
    targetScope: string;
    channels: string[];
    pattern: "daily" | "weekly";
    time: string;
    days?: string[];
    isActive: boolean;
  }

  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([
    {
      id: "rule-1",
      message: "Lunch hour service delay advisory: Reduced counters between 12:00 PM and 1:30 PM.",
      priority: "Normal",
      targetScope: "All Departments",
      channels: ["TV Display", "Mobile App"],
      pattern: "daily",
      time: "12:00",
      isActive: true
    },
    {
      id: "rule-2",
      message: "General Reminder: Please ensure you have your ID ready to speed up processing at counters.",
      priority: "Normal",
      targetScope: "All Departments",
      channels: ["TV Display", "Audio/Speakers"],
      pattern: "weekly",
      time: "09:00",
      days: ["Monday", "Wednesday", "Friday"],
      isActive: true
    }
  ]);

  // Composer Form States
  // Content type multi-select values
  const [contentTvText, setContentTvText] = useState(true);
  const [contentVoiceTts, setContentVoiceTts] = useState(true);
  const [contentAudioUpload, setContentAudioUpload] = useState(false);

  const [messageText, setMessageText] = useState("");
  const [audioFile, setAudioFile] = useState<{ name: string; size: string } | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [priority, setPriority] = useState<"Normal" | "Urgent" | "Emergency">("Normal");
  const [targetScope, setTargetScope] = useState("All"); // "All" or counter name or department name
  
  // Channels
  const [channelTv, setChannelTv] = useState(true);
  const [channelAudio, setChannelAudio] = useState(true);
  const [channelMobile, setChannelMobile] = useState(false);
  const [channelWeb, setChannelWeb] = useState(false);

  // Scheduling Mode: "now", "scheduled", "recurring"
  const [scheduleMode, setScheduleMode] = useState<"now" | "scheduled" | "recurring">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTimeInput, setScheduledTimeInput] = useState("");
  const [recurrencePattern, setRecurrencePattern] = useState<"daily" | "weekly">("daily");
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>(["Monday", "Wednesday", "Friday"]);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);

  // History Tab Filters
  const [filterType, setFilterType] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [filterChannel, setFilterChannel] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // History Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Simulate token call arrival timer
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger random automated token call occasionally (e.g. 5% chance every 10 seconds)
      if (Math.random() < 0.25) {
        triggerSimulatedTokenCall();
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [departments, counters]);

  // Watch for Scheduled announcements firing
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setAnnouncements(prev => {
        let changed = false;
        const updated = prev.map(ann => {
          if (ann.status === "Scheduled" && ann.scheduledTime) {
            const schedDate = new Date(ann.scheduledTime);
            // If scheduled time has passed
            if (schedDate <= now) {
              changed = true;
              showAdminToast("success", `[SIGNALR] Broadcast Fired! Scheduled alert dispatched: "${ann.message.substring(0, 50)}..."`);
              playAudioChime(ann.priority);
              
              // Log into Audit Logs
              const newLog: AuditLog = {
                id: "audit-sched-" + Date.now(),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                user: "System Scheduler",
                action: `Scheduled Broadcast [${ann.priority}] automatically fired: "${ann.message}"`,
                category: "System",
                severity: ann.priority === "Emergency" ? "Critical" : ann.priority === "Urgent" ? "Warning" : "Info"
              };
              setAuditLogs(prevLogs => [newLog, ...prevLogs]);

              return {
                ...ann,
                status: "Sent" as const,
                timestamp: now.toISOString()
              };
            }
          }
          return ann;
        });
        return changed ? updated : prev;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Simulator interval for Active Recurring rules
  useEffect(() => {
    const timer = setInterval(() => {
      // Find active rules
      const activeRules = recurringRules.filter(r => r.isActive);
      if (activeRules.length === 0) return;

      // Randomly pick an active rule to fire as a simulated cadence event
      const randomRule = activeRules[Math.floor(Math.random() * activeRules.length)];
      
      const newAnn: AnnouncementItem = {
        id: "ann-rec-" + Date.now(),
        timestamp: new Date().toISOString(),
        type: "General Announcement",
        message: `[RECURRING SCHEDULE] ${randomRule.message}`,
        priority: randomRule.priority,
        targetScope: randomRule.targetScope,
        channels: randomRule.channels,
        status: "Sent",
        createdBy: "Auto-Scheduler Rule",
        contentType: "Text + Voice TTS"
      };

      setAnnouncements(prev => [newAnn, ...prev]);
      playAudioChime(randomRule.priority);
      showAdminToast("info", `[SIGNALR] Recurring pattern rule triggered: "${randomRule.message.substring(0, 45)}..."`);

      // Audit Log
      const auditEntry: AuditLog = {
        id: "audit-rec-" + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        user: "System Scheduler",
        action: `Recurring Schedule Fired: "${randomRule.message}"`,
        category: "System",
        severity: "Info"
      };
      setAuditLogs(prevLogs => [auditEntry, ...prevLogs]);
    }, 45000); // Trigger recurring simulation every 45s for live visual updates

    return () => clearInterval(timer);
  }, [recurringRules]);

  // Compute live statistics for cards
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    
    const sentToday = announcements.filter(a => {
      return a.status === "Sent" && new Date(a.timestamp).toDateString() === today;
    }).length;

    const scheduled = announcements.filter(a => a.status === "Scheduled").length;

    const activeRecurring = recurringRules.filter(r => r.isActive).length;

    const emergency30Days = announcements.filter(a => {
      const isEmergency = a.priority === "Emergency";
      const isRecent = Date.now() - new Date(a.timestamp).getTime() < 30 * 24 * 60 * 60 * 1000;
      return isEmergency && isRecent;
    }).length;

    return {
      sentToday,
      scheduled,
      activeRecurring,
      emergency30Days
    };
  }, [announcements, recurringRules]);

  // Simulated Voice Ticket call trigger (Connects with existing system)
  const triggerSimulatedTokenCall = () => {
    if (departments.length === 0) return;
    
    // Pick random department
    const randomDept = departments[Math.floor(Math.random() * departments.length)];
    // Pick random counter or generate simulated one
    const relatedCounters = counters.filter(c => c.departmentId === randomDept.id);
    const counterName = relatedCounters.length > 0 
      ? relatedCounters[Math.floor(Math.random() * relatedCounters.length)].name 
      : `Counter 0${Math.floor(Math.random() * 4) + 1}`;
    
    const ticketPrefix = randomDept.prefix || "A";
    const ticketNum = `${ticketPrefix}-${Math.floor(Math.random() * 800) + 100}`;
    const opNames = ["Marcus Brody", "Sarah Jenkins", "Dr. Vance", "Operator Cleo", "Assistant James"];
    const opName = opNames[Math.floor(Math.random() * opNames.length)];

    const message = `Ticket ${ticketNum} called to ${counterName} by Operator ${opName}`;

    const newTokenCall: AnnouncementItem = {
      id: "ann-sys-" + Date.now(),
      timestamp: new Date().toISOString(),
      type: "Token Call",
      message: message,
      priority: "Normal",
      targetScope: counterName,
      channels: ["TV Display", "Audio/Speakers"],
      status: "Sent",
      createdBy: "System",
      contentType: "Voice TTS"
    };

    setAnnouncements(prev => [newTokenCall, ...prev]);
    playAudioChime("Normal");
    showAdminToast("success", `[SIGNALR CALL] voice system broadcast: "${ticketNum} to ${counterName}"`);

    // Log into audit log
    const audit: AuditLog = {
      id: "audit-token-" + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      user: "System",
      action: `Voice Announcement System called Ticket ${ticketNum} to ${counterName}`,
      category: "Queue",
      severity: "Info"
    };
    setAuditLogs(prevLogs => [audit, ...prevLogs]);
  };

  // Submit Handler for Composer Form
  const handleSubmitBroadcast = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!contentTvText && !contentVoiceTts && !contentAudioUpload) {
      showAdminToast("warning", "Please select at least one Content Type (Text, Voice TTS, or Audio).");
      return;
    }

    if ((contentTvText || contentVoiceTts) && !messageText.trim()) {
      showAdminToast("warning", "Please provide the text message content.");
      return;
    }

    if (contentAudioUpload && !audioFile) {
      showAdminToast("warning", "Please upload or drop an audio recording file.");
      return;
    }

    const selectedChannels: string[] = [];
    if (channelTv) selectedChannels.push("TV Display");
    if (channelAudio) selectedChannels.push("Audio/Speakers");
    if (channelMobile) selectedChannels.push("Mobile App");
    if (channelWeb) selectedChannels.push("Web Booking");

    if (selectedChannels.length === 0) {
      showAdminToast("warning", "Please select at least one delivery channel.");
      return;
    }

    let resolvedScope = targetScope === "All" ? "All Departments" : targetScope;

    let contentTypeStr = "";
    if (contentTvText && contentVoiceTts) contentTypeStr = "Text + Voice TTS";
    else if (contentTvText) contentTypeStr = "Text Display";
    else if (contentVoiceTts) contentTypeStr = "Voice TTS Only";
    else if (contentAudioUpload) contentTypeStr = "Audio Recording";

    if (scheduleMode === "now") {
      // Create immediate sent announcement
      const newAnn: AnnouncementItem = {
        id: "ann-new-" + Date.now(),
        timestamp: new Date().toISOString(),
        type: "General Announcement",
        message: messageText || `[Audio Playback] ${audioFile?.name}`,
        priority: priority,
        targetScope: resolvedScope,
        channels: selectedChannels,
        status: "Sent",
        createdBy: "Admin Console",
        contentType: contentTypeStr
      };

      setAnnouncements(prev => [newAnn, ...prev]);
      playAudioChime(priority);
      showAdminToast("success", `Broadcast dispatched successfully via SignalR across ${selectedChannels.join(", ")}!`);

      // Add audit log
      const audit: AuditLog = {
        id: "audit-new-" + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        user: "Admin (Console)",
        action: `Dispatched [${priority}] general announcement: "${messageText || audioFile?.name}"`,
        category: "System",
        severity: priority === "Emergency" ? "Critical" : priority === "Urgent" ? "Warning" : "Info"
      };
      setAuditLogs(prevLogs => [audit, ...prevLogs]);

      // Clear Form Fields
      setMessageText("");
      setAudioFile(null);
    } else if (scheduleMode === "scheduled") {
      if (!scheduledDate || !scheduledTimeInput) {
        showAdminToast("warning", "Please enter a valid date and time for scheduling.");
        return;
      }

      const parsedDateTime = new Date(`${scheduledDate}T${scheduledTimeInput}`);
      if (parsedDateTime <= new Date()) {
        showAdminToast("warning", "Scheduled time must be in the future.");
        return;
      }

      const newAnn: AnnouncementItem = {
        id: "ann-new-sched-" + Date.now(),
        timestamp: new Date().toISOString(),
        type: "General Announcement",
        message: messageText || `[Audio Playback] ${audioFile?.name}`,
        priority: priority,
        targetScope: resolvedScope,
        channels: selectedChannels,
        status: "Scheduled",
        createdBy: "Admin Console",
        contentType: contentTypeStr,
        scheduledTime: parsedDateTime.toLocaleString()
      };

      setAnnouncements(prev => [newAnn, ...prev]);
      showAdminToast("success", `Announcement scheduled successfully for ${parsedDateTime.toLocaleString()}!`);

      // Add audit log
      const audit: AuditLog = {
        id: "audit-sched-" + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        user: "Admin (Console)",
        action: `Scheduled [${priority}] announcement for ${parsedDateTime.toLocaleString()}`,
        category: "System",
        severity: "Info"
      };
      setAuditLogs(prevLogs => [audit, ...prevLogs]);

      // Reset
      setMessageText("");
      setAudioFile(null);
    } else if (scheduleMode === "recurring") {
      if (!scheduledTimeInput) {
        showAdminToast("warning", "Please enter a time for the recurring pattern.");
        return;
      }

      const newRule: RecurringRule = {
        id: "rule-new-" + Date.now(),
        message: messageText || `[Audio Playback] ${audioFile?.name}`,
        priority: priority,
        targetScope: resolvedScope,
        channels: selectedChannels,
        pattern: recurrencePattern,
        time: scheduledTimeInput,
        days: recurrencePattern === "weekly" ? selectedWeekdays : undefined,
        isActive: true
      };

      setRecurringRules(prev => [newRule, ...prev]);
      showAdminToast("success", `Recurring rule registered. Will trigger daily at ${scheduledTimeInput}!`);

      // Add audit log
      const audit: AuditLog = {
        id: "audit-rec-" + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        user: "Admin (Console)",
        action: `Created active recurring announcement rule at ${scheduledTimeInput}`,
        category: "System",
        severity: "Info"
      };
      setAuditLogs(prevLogs => [audit, ...prevLogs]);

      // Reset
      setMessageText("");
      setAudioFile(null);
    }
  };

  // Fast forward trigger for testing scheduled items
  const handleFastForwardScheduled = (annId: string) => {
    setAnnouncements(prev => {
      return prev.map(ann => {
        if (ann.id === annId && ann.status === "Scheduled") {
          showAdminToast("success", `Fast-forwarding time! Dispatched: "${ann.message}"`);
          playAudioChime(ann.priority);
          return {
            ...ann,
            status: "Sent" as const,
            timestamp: new Date().toISOString()
          };
        }
        return ann;
      });
    });
  };

  // Cancelling/Deleting items
  const handleCancelScheduled = (id: string) => {
    setAnnouncements(prev => {
      return prev.map(ann => {
        if (ann.id === id) {
          showAdminToast("info", "Scheduled announcement has been cancelled.");
          return {
            ...ann,
            status: "Cancelled" as const
          };
        }
        return ann;
      });
    });
  };

  const handleToggleRecurringRule = (id: string) => {
    setRecurringRules(prev => {
      return prev.map(rule => {
        if (rule.id === id) {
          const nextState = !rule.isActive;
          showAdminToast("info", `Recurring rule is now ${nextState ? "active" : "paused"}.`);
          return { ...rule, isActive: nextState };
        }
        return rule;
      });
    });
  };

  const handleDeleteRecurringRule = (id: string) => {
    setRecurringRules(prev => prev.filter(r => r.id !== id));
    showAdminToast("success", "Recurring announcement rule deleted successfully.");
  };

  // Audio Upload Simulator
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setAudioFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB"
      });
      showAdminToast("success", `Uploaded ${file.name} successfully.`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB"
      });
      showAdminToast("success", `Uploaded ${file.name} successfully.`);
    }
  };

  // Simulate play/pause of audio uploader
  const toggleAudioPlay = () => {
    if (isAudioPlaying) {
      setIsAudioPlaying(false);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    } else {
      setIsAudioPlaying(true);
      setAudioProgress(0);
      audioIntervalRef.current = setInterval(() => {
        setAudioProgress(p => {
          if (p >= 100) {
            setIsAudioPlaying(false);
            if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
            return 100;
          }
          return p + 5;
        });
      }, 150);
    }
  };

  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  // Filter & Search logic for Ledger list
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(ann => {
      // Type filter
      if (filterType !== "All" && ann.type !== filterType) return false;

      // Priority filter
      if (filterPriority !== "All" && ann.priority !== filterPriority) return false;

      // Status filter
      if (filterStatus !== "All" && ann.status !== filterStatus) return false;

      // Channel filter
      if (filterChannel !== "All" && !ann.channels.includes(filterChannel)) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesMsg = ann.message.toLowerCase().includes(query);
        const matchesScope = ann.targetScope.toLowerCase().includes(query);
        const matchesCreator = ann.createdBy.toLowerCase().includes(query);
        if (!matchesMsg && !matchesScope && !matchesCreator) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [announcements, filterType, filterPriority, filterChannel, filterStatus, searchQuery]);

  // Compute pagination
  const paginatedAnnouncements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAnnouncements.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAnnouncements, currentPage]);

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage) || 1;

  // Toggle day selections
  const toggleWeekday = (day: string) => {
    setSelectedWeekdays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const weekdaysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="space-y-6">
      {/* 1. Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 tracking-wide uppercase mb-1">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand-navy">Announcements</span>
          </div>
          <h2 className="font-outfit text-2xl font-black text-brand-navy tracking-tight uppercase">
            Announcements & Audio Broadcast Control
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Compose instant announcements, configure recurring cadence notices, or coordinate real-time speaker system chimes.
          </p>
        </div>

        <button
          onClick={triggerSimulatedTokenCall}
          className="mt-3 md:mt-0 bg-[#FDFCF9] hover:bg-[#F3EFE0] border border-slate-200 text-brand-navy text-[10px] font-extrabold px-3.5 py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Simulate Token Call (SignalR)
        </button>
      </div>

      {/* 2. Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sent Today */}
        <div className="bg-[#FDFCF9] border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sent Today</span>
            <div className="font-outfit text-3xl font-extrabold text-brand-navy mt-1">
              {stats.sentToday}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Dispatched live broadcasts</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center text-brand-navy">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        {/* Scheduled / Upcoming */}
        <div className="bg-[#FDFCF9] border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Scheduled / Upcoming</span>
            <div className="font-outfit text-3xl font-extrabold text-brand-navy mt-1">
              {stats.scheduled}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Pending queue timers</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-ocean/5 flex items-center justify-center text-brand-ocean">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Active Recurring */}
        <div className="bg-[#FDFCF9] border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Recurring</span>
            <div className="font-outfit text-3xl font-extrabold text-brand-navy mt-1">
              {stats.activeRecurring}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Interval rules running</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-navy">
            <Repeat className="w-5 h-5" />
          </div>
        </div>

        {/* Emergency Alerts */}
        <div className="bg-red-50/45 border border-red-100 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-red-500 tracking-wider">Emergency Alerts (30d)</span>
            <div className="font-outfit text-3xl font-extrabold text-red-600 mt-1">
              {stats.emergency30Days}
            </div>
            <p className="text-[10px] text-red-400 mt-1 font-medium">Critical takeover signals</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-100/50 flex items-center justify-center text-red-600">
            <AlertCircle className="w-5 h-5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 3. Sub Tabs Selector */}
      <div className="flex border-b border-slate-200/80">
        <button
          onClick={() => setActiveSubTab("create")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === "create"
              ? "border-brand-navy text-brand-navy font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Compose & Broadcast
        </button>
        <button
          onClick={() => setActiveSubTab("history")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === "history"
              ? "border-brand-navy text-brand-navy font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Unified History Ledger ({filteredAnnouncements.length})
        </button>
      </div>

      {/* 4. Tab Content */}
      <AnimatePresence mode="wait">
        {activeSubTab === "create" ? (
          <motion.div
            key="compose-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Form Composer Panel */}
            <div className="lg:col-span-7 bg-[#FDFCF9] border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-outfit text-base font-extrabold text-brand-navy uppercase tracking-tight">
                  Announcement Composer
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                  Combine visual text displays, synthetic TTS voice readers, and audio chimes into one multi-channel signal.
                </p>
              </div>

              <form onSubmit={handleSubmitBroadcast} className="space-y-6">
                {/* A. CONTENT TYPES COMBINATIONS */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    1. Compose Media Format (Combine or Select Single)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {/* TV Text */}
                    <button
                      type="button"
                      onClick={() => setContentTvText(!contentTvText)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        contentTvText 
                          ? "border-brand-navy bg-brand-navy/5 text-brand-navy ring-1 ring-brand-navy"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Tv className="w-4 h-4" />
                        <span className={`w-2 h-2 rounded-full ${contentTvText ? "bg-brand-navy" : "bg-transparent"}`}></span>
                      </div>
                      <div className="mt-3">
                        <h5 className="text-[11px] font-extrabold uppercase">Text Display</h5>
                        <p className="text-[9px] text-slate-400 leading-tight mt-0.5 font-medium">Banners on lobby screens</p>
                      </div>
                    </button>

                    {/* Voice TTS */}
                    <button
                      type="button"
                      onClick={() => setContentVoiceTts(!contentVoiceTts)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        contentVoiceTts 
                          ? "border-brand-navy bg-brand-navy/5 text-brand-navy ring-1 ring-brand-navy"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Volume2 className="w-4 h-4" />
                        <span className={`w-2 h-2 rounded-full ${contentVoiceTts ? "bg-brand-navy" : "bg-transparent"}`}></span>
                      </div>
                      <div className="mt-3">
                        <h5 className="text-[11px] font-extrabold uppercase">Voice (TTS)</h5>
                        <p className="text-[9px] text-slate-400 leading-tight mt-0.5 font-medium">Audio announcement reader</p>
                      </div>
                    </button>

                    {/* Audio Upload */}
                    <button
                      type="button"
                      onClick={() => setContentAudioUpload(!contentAudioUpload)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        contentAudioUpload 
                          ? "border-brand-navy bg-brand-navy/5 text-brand-navy ring-1 ring-brand-navy"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <FileAudio className="w-4 h-4" />
                        <span className={`w-2 h-2 rounded-full ${contentAudioUpload ? "bg-brand-navy" : "bg-transparent"}`}></span>
                      </div>
                      <div className="mt-3">
                        <h5 className="text-[11px] font-extrabold uppercase">Audio File</h5>
                        <p className="text-[9px] text-slate-400 leading-tight mt-0.5 font-medium">Upload custom pre-recorded file</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* B. MESSAGE CONTENT (TEXT / TTS) */}
                {(contentTvText || contentVoiceTts) && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      2. Broadcast Message Text
                    </label>
                    <textarea
                      rows={3}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Enter announcement text to display on screens or generate voice readers..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-navy/15 focus:border-brand-navy text-slate-700 transition-all placeholder:text-slate-350"
                    />
                  </div>
                )}

                {/* C. AUDIO FILE ZONE */}
                {contentAudioUpload && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      3. Custom Pre-Recorded Audio File
                    </label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleFileDrop}
                      className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                        isDragging 
                          ? "border-brand-cyan bg-brand-navy/5" 
                          : audioFile 
                            ? "border-slate-200 bg-[#FCFBF7]" 
                            : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />

                      {!audioFile ? (
                        <div className="space-y-2 py-2">
                          <Upload className="w-7 h-7 mx-auto text-slate-400" />
                          <div>
                            <span className="text-[11px] font-bold text-brand-navy block">Drag & drop your recording file here</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">Supports WAV, MP3, M4A (Max 15MB)</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-3 shadow-xs">
                          <div className="flex items-center gap-2.5 text-left">
                            <div className="p-2 bg-brand-navy/5 rounded-lg text-brand-navy">
                              <FileAudio className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[11px] font-bold text-brand-navy block truncate max-w-[180px]">
                                {audioFile.name}
                              </span>
                              <span className="text-[9px] text-slate-400 block">
                                {audioFile.size} • Waveform parsed
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Simulator Player */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); toggleAudioPlay(); }}
                              className="w-7 h-7 bg-brand-navy text-white rounded-lg hover:bg-brand-ocean flex items-center justify-center transition-all cursor-pointer"
                            >
                              {isAudioPlaying ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5 pl-0.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setAudioFile(null); setIsAudioPlaying(false); }}
                              className="w-7 h-7 bg-slate-50 text-slate-400 rounded-lg hover:text-red-500 flex items-center justify-center transition-all cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Canvas sound simulation indicator */}
                      {isAudioPlaying && (
                        <div className="mt-3 flex items-center justify-center gap-0.5 h-4">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(bar => (
                            <div
                              key={bar}
                              style={{
                                height: `${Math.random() * 100}%`,
                                animationDelay: `${bar * 0.05}s`
                              }}
                              className="w-1 bg-brand-navy rounded-sm animate-bounce duration-300"
                            ></div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* D. PRIORITY CONTROLS */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    4. Dispatch Alert Priority
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPriority("Normal")}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                        priority === "Normal" 
                          ? "border-brand-navy bg-brand-navy/5 text-brand-navy ring-1 ring-brand-navy"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <Info className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-extrabold uppercase">Normal</h5>
                        <p className="text-[8px] text-slate-400 font-medium">Standard alert</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPriority("Urgent")}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                        priority === "Urgent" 
                          ? "border-amber-400 bg-amber-500/5 text-amber-600 ring-1 ring-amber-400"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-500">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-extrabold uppercase">Urgent</h5>
                        <p className="text-[8px] text-slate-400 font-medium">Accent attention</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPriority("Emergency")}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                        priority === "Emergency" 
                          ? "border-red-500 bg-red-500/5 text-red-600 ring-1 ring-red-500"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center text-red-600 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-extrabold uppercase">Emergency</h5>
                        <p className="text-[8px] text-slate-400 font-medium">Full TV takeover</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* E. SCOPE AND CHANNELS (GRID) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Scope */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      5. Target Venue Scope
                    </label>
                    <select
                      value={targetScope}
                      onChange={(e) => setTargetScope(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-navy"
                    >
                      <option value="All">All Venue Departments & Screens</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name} (Department)</option>
                      ))}
                      {counters.map(c => (
                        <option key={c.id} value={c.name}>{c.name} (Specific Counter)</option>
                      ))}
                    </select>
                  </div>

                  {/* Delivery Channels */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      6. Delivery Channels (Manual Choice)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 p-2 bg-white border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={channelTv}
                          onChange={(e) => setChannelTv(e.target.checked)}
                          className="rounded text-brand-navy focus:ring-brand-navy"
                        />
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Tv className="w-3.5 h-3.5" /> <span>TV Screen</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 p-2 bg-white border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={channelAudio}
                          onChange={(e) => setChannelAudio(e.target.checked)}
                          className="rounded text-brand-navy focus:ring-brand-navy"
                        />
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Volume2 className="w-3.5 h-3.5" /> <span>Speakers</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 p-2 bg-white border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={channelMobile}
                          onChange={(e) => setChannelMobile(e.target.checked)}
                          className="rounded text-brand-navy focus:ring-brand-navy"
                        />
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Smartphone className="w-3.5 h-3.5" /> <span>Mobile App</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 p-2 bg-white border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={channelWeb}
                          onChange={(e) => setChannelWeb(e.target.checked)}
                          className="rounded text-brand-navy focus:ring-brand-navy"
                        />
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Globe className="w-3.5 h-3.5" /> <span>Web Booking</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* F. SCHEDULING CONTROLS */}
                <div className="border-t border-slate-200/60 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      7. Delivery Schedule Mode
                    </label>
                    <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setScheduleMode("now")}
                        className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${
                          scheduleMode === "now" ? "bg-white text-brand-navy shadow-xs" : "text-slate-400"
                        }`}
                      >
                        Send Now
                      </button>
                      <button
                        type="button"
                        onClick={() => setScheduleMode("scheduled")}
                        className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${
                          scheduleMode === "scheduled" ? "bg-white text-brand-navy shadow-xs" : "text-slate-400"
                        }`}
                      >
                        Future
                      </button>
                      <button
                        type="button"
                        onClick={() => setScheduleMode("recurring")}
                        className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${
                          scheduleMode === "recurring" ? "bg-white text-brand-navy shadow-xs" : "text-slate-400"
                        }`}
                      >
                        Recurring
                      </button>
                    </div>
                  </div>

                  {scheduleMode === "scheduled" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Date</label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Time</label>
                        <input
                          type="time"
                          value={scheduledTimeInput}
                          onChange={(e) => setScheduledTimeInput(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer"
                        />
                      </div>
                    </motion.div>
                  )}

                  {scheduleMode === "recurring" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <label className="text-[10px] font-bold text-slate-600">Recurrence Pattern:</label>
                        <label className="flex items-center gap-1 text-xs font-semibold cursor-pointer text-slate-600">
                          <input
                            type="radio"
                            name="recurrence"
                            checked={recurrencePattern === "daily"}
                            onChange={() => setRecurrencePattern("daily")}
                            className="text-brand-navy focus:ring-brand-navy"
                          />
                          Daily
                        </label>
                        <label className="flex items-center gap-1 text-xs font-semibold cursor-pointer text-slate-600">
                          <input
                            type="radio"
                            name="recurrence"
                            checked={recurrencePattern === "weekly"}
                            onChange={() => setRecurrencePattern("weekly")}
                            className="text-brand-navy focus:ring-brand-navy"
                          />
                          Weekly Days
                        </label>
                      </div>

                      {recurrencePattern === "weekly" && (
                        <div className="flex flex-wrap gap-1">
                          {weekdaysList.map(day => {
                            const isSel = selectedWeekdays.includes(day);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleWeekday(day)}
                                className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-md border transition-all ${
                                  isSel 
                                    ? "bg-brand-navy border-brand-navy text-white" 
                                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                                }`}
                              >
                                {day.substring(0, 3)}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="w-1/2">
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Execution Time</label>
                        <input
                          type="time"
                          value={scheduledTimeInput}
                          onChange={(e) => setScheduledTimeInput(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* G. SUBMIT */}
                <button
                  type="submit"
                  className="w-full bg-brand-navy hover:bg-brand-ocean text-white font-extrabold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md shadow-brand-navy/15 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  {scheduleMode === "now" 
                    ? "Dispatch Immediate Broadcast Signals" 
                    : scheduleMode === "scheduled" 
                      ? "Register Future Scheduled Broadcast" 
                      : "Install Active Recurring Rule Pattern"}
                </button>
              </form>
            </div>

            {/* Live Styling & Layout Preview Column */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 1: Broadcast Priority Preview on TV Screen Mock */}
              <div className="bg-[#FDFCF9] border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h4 className="font-outfit text-xs font-black text-brand-navy uppercase tracking-wider">
                    Signage TV Display Takeover Preview
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    This displays how the TV screens will render your broadcast live in the venue.
                  </p>
                </div>

                <div className="relative aspect-[16/9] bg-[#050B2E] border border-slate-800 rounded-xl overflow-hidden shadow-inner flex flex-col justify-between p-3 text-white">
                  {/* Outer Grid lines decoration */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-1">
                    <span className="text-[7px] font-mono tracking-widest text-brand-cyan uppercase">
                      Lobby Announcement Board
                    </span>
                    <span className="text-[7px] font-mono text-slate-400">12:30 PM UTC</span>
                  </div>

                  {/* Central Takeover view depending on priority */}
                  <div className="flex-1 flex flex-col justify-center items-center py-2 text-center relative z-10">
                    {priority === "Normal" ? (
                      <div className="space-y-1.5 max-w-[85%]">
                        <div className="w-6 h-6 rounded-lg bg-brand-navy border border-brand-cyan/25 flex items-center justify-center text-brand-cyan mx-auto">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <h5 className="text-[10px] font-black text-white leading-tight truncate">
                          {messageText || "Lobby General Notice"}
                        </h5>
                        <p className="text-[7px] text-slate-350 leading-normal line-clamp-2">
                          {messageText || "This notice will stream at the footer of main waiting room TV displays without blocking called ticket number rows."}
                        </p>
                      </div>
                    ) : priority === "Urgent" ? (
                      <div className="space-y-1.5 max-w-[85%] border border-amber-500/20 bg-amber-500/5 rounded-lg p-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-white mx-auto animate-bounce">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <h5 className="text-[10px] font-black text-amber-400 leading-tight">
                          URGENT NOTICE
                        </h5>
                        <p className="text-[8px] text-slate-100 font-bold leading-normal truncate">
                          {messageText || "Reduced staff desk service advisory"}
                        </p>
                        <p className="text-[7px] text-slate-300 leading-normal line-clamp-1">
                          Flashing banner overlay on sidebars.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 w-full border border-red-500 bg-red-600/90 rounded-lg p-2 py-3 text-center animate-pulse">
                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-red-600 mx-auto">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <h5 className="text-[11px] font-black text-white tracking-widest">
                          EMERGENCY TAKEOVER
                        </h5>
                        <p className="text-[8px] font-black text-white leading-normal uppercase">
                          {messageText || "CRITICAL VENUE ALERT TAKING OVER SCREENS"}
                        </p>
                        <p className="text-[6px] text-red-100 font-semibold uppercase">
                          All ticket call rotations paused. Fullscreen Blockade.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-[6px] font-mono text-slate-500">
                    <span>Scope: {targetScope === "All" ? "All Venue" : targetScope}</span>
                    <span>Channels: TV Display, Speakers</span>
                  </div>
                </div>

                {/* Priority Description helper text */}
                <div className="p-3 bg-brand-navy/[0.02] border border-slate-200/50 rounded-xl">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Priority Visual & Chime Matrix
                  </span>
                  <div className="space-y-2">
                    {priority === "Normal" && (
                      <div className="flex gap-2 text-[10px] text-slate-500 leading-normal font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-navy mt-1 shrink-0"></div>
                        <p><strong>Standard treatment:</strong> Soft symphonic chime, subtle banner crawls along footer, no active ticket interrupts.</p>
                      </div>
                    )}
                    {priority === "Urgent" && (
                      <div className="flex gap-2 text-[10px] text-slate-500 leading-normal font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0"></div>
                        <p><strong>Urgent treatment:</strong> Fast double-ping chime, side column flashes amber highlights, stays on screen until acknowledged by terminal.</p>
                      </div>
                    )}
                    {priority === "Emergency" && (
                      <div className="flex gap-2 text-[10px] text-slate-500 leading-normal font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0 animate-ping"></div>
                        <p className="text-red-600/90"><strong>Emergency treatment:</strong> High pitch horn alert, absolute fullscreen takeover blockade, blocks ticket rotation lists instantly on all venue displays.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Active Recurring Rules List manager */}
              <div className="bg-[#FDFCF9] border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-outfit text-xs font-black text-brand-navy uppercase tracking-wider">
                      Active Cadence Rules ({recurringRules.length})
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      Manage active interval-driven repeating announcements.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {recurringRules.map(rule => (
                    <div
                      key={rule.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        rule.isActive 
                          ? "bg-white border-slate-200 shadow-xs" 
                          : "bg-slate-50 border-slate-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-black uppercase text-brand-navy tracking-wider flex items-center gap-1">
                              <Repeat className="w-3 h-3" /> {rule.pattern} @ {rule.time}
                            </span>
                            {rule.days && (
                              <span className="text-[8px] bg-brand-navy/5 text-brand-navy font-black px-1.5 py-0.5 rounded uppercase">
                                {rule.days.map(d => d.substring(0, 3)).join(", ")}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-600 leading-normal font-semibold">
                            {rule.message}
                          </p>
                          <span className="text-[8px] text-slate-400 font-mono block">
                            Scope: {rule.targetScope} | Channels: {rule.channels.join(", ")}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleRecurringRule(rule.id)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
                              rule.isActive 
                                ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100" 
                                : "bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200"
                            }`}
                            title={rule.isActive ? "Pause Rule" : "Activate Rule"}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRecurringRule(rule.id)}
                            className="w-6 h-6 bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Filter Bar Panel */}
            <div className="bg-[#FDFCF9] border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
                <div className="flex items-center gap-1 text-slate-400 text-xs font-bold shrink-0">
                  <Filter className="w-3.5 h-3.5" /> <span>Filters:</span>
                </div>

                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                  className="bg-white border border-slate-200 text-[11px] font-bold text-slate-600 rounded-xl px-2.5 py-1.5 cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="Token Call">Token Call Only</option>
                  <option value="General Announcement">General Announcement</option>
                </select>

                {/* Priority Filter */}
                <select
                  value={filterPriority}
                  onChange={(e) => { setFilterPriority(e.target.value); setCurrentPage(1); }}
                  className="bg-white border border-slate-200 text-[11px] font-bold text-slate-600 rounded-xl px-2.5 py-1.5 cursor-pointer"
                >
                  <option value="All">All Priorities</option>
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="bg-white border border-slate-200 text-[11px] font-bold text-slate-600 rounded-xl px-2.5 py-1.5 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Sent">Sent</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                {/* Channel Filter */}
                <select
                  value={filterChannel}
                  onChange={(e) => { setFilterChannel(e.target.value); setCurrentPage(1); }}
                  className="bg-white border border-slate-200 text-[11px] font-bold text-slate-600 rounded-xl px-2.5 py-1.5 cursor-pointer"
                >
                  <option value="All">All Channels</option>
                  <option value="TV Display">TV Display</option>
                  <option value="Audio/Speakers">Speakers</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Web Booking">Web Booking</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ledger..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-xl pl-9 pr-3.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-navy"
                />
              </div>
            </div>

            {/* Unified History List Table */}
            <div className="bg-[#FDFCF9] border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5">Format Type</th>
                    <th className="px-5 py-3.5 w-1/3">Message Summary</th>
                    <th className="px-5 py-3.5">Priority</th>
                    <th className="px-5 py-3.5">Scope</th>
                    <th className="px-5 py-3.5">Channels</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Created By</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {paginatedAnnouncements.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400 text-xs font-semibold">
                        No matching announcements found in the unified history.
                      </td>
                    </tr>
                  ) : (
                    paginatedAnnouncements.map(ann => (
                      <tr 
                        key={ann.id} 
                        className={`hover:bg-slate-50/50 transition-colors ${
                          ann.priority === "Emergency" ? "bg-red-500/[0.01]" : ""
                        }`}
                      >
                        {/* Timestamp */}
                        <td className="px-5 py-4 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(ann.timestamp).toLocaleString([], {
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                          })}
                        </td>

                        {/* Format Type */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${
                            ann.type === "Token Call" 
                              ? "bg-slate-100 text-slate-600" 
                              : "bg-brand-navy/5 text-brand-navy border border-brand-navy/10"
                          }`}>
                            {ann.type}
                          </span>
                        </td>

                        {/* Message Summary */}
                        <td className="px-5 py-4 font-semibold text-slate-800 leading-relaxed">
                          {ann.message}
                        </td>

                        {/* Priority Badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {ann.priority === "Normal" ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-100/60 px-2 py-0.5 rounded-md">
                              Normal
                            </span>
                          ) : ann.priority === "Urgent" ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                              Urgent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 animate-pulse">
                              Emergency
                            </span>
                          )}
                        </td>

                        {/* Target Scope */}
                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                          {ann.targetScope}
                        </td>

                        {/* Delivery Channels */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex gap-1.5 text-slate-400">
                            {ann.channels.includes("TV Display") && <Tv className="w-3.5 h-3.5" aria-label="TV Display" />}
                            {ann.channels.includes("Audio/Speakers") && <Volume2 className="w-3.5 h-3.5" aria-label="Audio Speakers" />}
                            {ann.channels.includes("Mobile App") && <Smartphone className="w-3.5 h-3.5" aria-label="Mobile App" />}
                            {ann.channels.includes("Web Booking") && <Globe className="w-3.5 h-3.5" aria-label="Web Booking" />}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {ann.status === "Sent" ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Sent
                            </span>
                          ) : ann.status === "Scheduled" ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase text-brand-ocean bg-blue-50 px-2 py-0.5 rounded-md animate-pulse">
                              Scheduled
                            </span>
                          ) : ann.status === "Cancelled" ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                              Cancelled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                              Failed
                            </span>
                          )}
                        </td>

                        {/* Created By */}
                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                          {ann.createdBy}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          {ann.status === "Scheduled" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleFastForwardScheduled(ann.id)}
                                className="text-[10px] font-black uppercase tracking-wider text-brand-ocean hover:text-brand-navy cursor-pointer transition-all bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded"
                                title="Instantly trigger schedule countdown"
                              >
                                Fire Now
                              </button>
                              <button
                                onClick={() => handleCancelScheduled(ann.id)}
                                className="text-[10px] font-black uppercase tracking-wider text-red-500 hover:text-red-700 cursor-pointer transition-all bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-300 select-none">No Action</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination Footer */}
              {totalPages > 1 && (
                <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredAnnouncements.length)}</strong> of <strong>{filteredAnnouncements.length}</strong> announcements
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-[10px] font-black uppercase rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Prev
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`w-7 h-7 text-xs font-black rounded-lg transition-all cursor-pointer ${
                          currentPage === idx + 1 
                            ? "bg-brand-navy text-white" 
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-[10px] font-black uppercase rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
