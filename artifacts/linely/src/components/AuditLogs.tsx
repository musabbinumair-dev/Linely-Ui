import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Bell, 
  History, 
  Cpu, 
  UserCheck, 
  Shield, 
  ChevronRight,
  Inbox,
  Filter
} from "lucide-react";

type LogSource = "Staff" | "Admin" | "System";
type LogCategory = "Security" | "Queue" | "Shifts" | "Settings" | "Auth";
type LogSeverity = "Info" | "Warning" | "Critical";

interface AuditLogEntry {
  id: string;
  timestamp: string; // Absolute time: "09:14 AM"
  fullDate: string; // For sorting/filtering: "2026-07-04"
  actorName: string;
  actorRole: "Admin" | "Staff" | "System";
  actorAvatar?: string;
  action: string;
  target?: string;
  category: LogCategory;
  source: LogSource;
  severity: LogSeverity;
}

const INITIAL_LOGS: AuditLogEntry[] = [
  {
    id: "log-1",
    timestamp: "03:45 PM",
    fullDate: "2026-07-04",
    actorName: "Sophia",
    actorRole: "Admin",
    action: "cancelled token A102",
    target: "A102",
    category: "Queue",
    source: "Admin",
    severity: "Critical"
  },
  {
    id: "log-2",
    timestamp: "03:42 PM",
    fullDate: "2026-07-04",
    actorName: "Marcus Brody",
    actorRole: "Staff",
    action: "started shift 'Afternoon Peak'",
    target: "Afternoon Peak",
    category: "Shifts",
    source: "Staff",
    severity: "Info"
  },
  {
    id: "log-3",
    timestamp: "03:30 PM",
    fullDate: "2026-07-04",
    actorName: "System",
    actorRole: "System",
    action: "auto-closed token B-204 due to inactivity",
    target: "B-204",
    category: "Queue",
    source: "System",
    severity: "Warning"
  },
  {
    id: "log-4",
    timestamp: "03:15 PM",
    fullDate: "2026-07-04",
    actorName: "Admin (Console)",
    actorRole: "Admin",
    action: "updated SLA threshold for Billing from 12m to 15m",
    target: "Billing",
    category: "Settings",
    source: "Admin",
    severity: "Warning"
  },
  {
    id: "log-5",
    timestamp: "02:50 PM",
    fullDate: "2026-07-04",
    actorName: "Elena Rostova",
    actorRole: "Staff",
    action: "called token C-112 to Counter 04",
    target: "C-112",
    category: "Queue",
    source: "Staff",
    severity: "Info"
  },
  {
    id: "log-6",
    timestamp: "02:10 PM",
    fullDate: "2026-07-04",
    actorName: "System",
    actorRole: "System",
    action: "auto-extended shift 'Midday' by 30 mins",
    target: "Midday",
    category: "Shifts",
    source: "System",
    severity: "Info"
  },
  {
    id: "log-7",
    timestamp: "01:45 PM",
    fullDate: "2026-07-04",
    actorName: "Jordan Vance",
    actorRole: "Staff",
    action: "marked customer 'Arthur Dent' as no-show",
    target: "Arthur Dent",
    category: "Queue",
    source: "Staff",
    severity: "Warning"
  },
  {
    id: "log-8",
    timestamp: "01:20 PM",
    fullDate: "2026-07-04",
    actorName: "Admin (Security)",
    actorRole: "Admin",
    action: "blocked IP 192.168.1.55 after failed login attempts",
    target: "192.168.1.55",
    category: "Security",
    source: "Admin",
    severity: "Critical"
  },
  {
    id: "log-9",
    timestamp: "12:55 PM",
    fullDate: "2026-07-04",
    actorName: "System",
    actorRole: "System",
    action: "dispatched daily report to admin@linely.com",
    target: "admin@linely.com",
    category: "Settings",
    source: "System",
    severity: "Info"
  },
  {
    id: "log-10",
    timestamp: "12:30 PM",
    fullDate: "2026-07-04",
    actorName: "Amira Patel",
    actorRole: "Staff",
    action: "completed service for token P-405",
    target: "P-405",
    category: "Queue",
    source: "Staff",
    severity: "Info"
  },
  {
    id: "log-11",
    timestamp: "05:15 PM",
    fullDate: "2026-07-03",
    actorName: "Sophia",
    actorRole: "Admin",
    action: "provisioned new kiosk unit 'Kiosk East'",
    target: "Kiosk East",
    category: "Settings",
    source: "Admin",
    severity: "Info"
  },
  {
    id: "log-12",
    timestamp: "04:30 PM",
    fullDate: "2026-07-03",
    actorName: "Elena Rostova",
    actorRole: "Staff",
    action: "served queue ticket G-801 successfully",
    target: "G-801",
    category: "Queue",
    source: "Staff",
    severity: "Info"
  },
  {
    id: "log-13",
    timestamp: "09:14 AM",
    fullDate: "2026-07-03",
    actorName: "System",
    actorRole: "System",
    action: "synchronized active configurations with secure vault",
    target: "Secure Vault",
    category: "Security",
    source: "System",
    severity: "Info"
  },
  {
    id: "log-14",
    timestamp: "11:20 AM",
    fullDate: "2026-07-02",
    actorName: "Sophia",
    actorRole: "Admin",
    action: "configured backup databases on SQL Server replica",
    target: "SQL Server",
    category: "Settings",
    source: "Admin",
    severity: "Info"
  }
];

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_LOGS);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<{
    source: LogSource | null;
    actionType: LogCategory | null;
    severity: LogSeverity | null;
    dateRange: "Today" | "Yesterday" | "Older" | null;
  }>({
    source: null,
    actionType: null,
    severity: null,
    dateRange: null
  });
  const [visibleCount, setVisibleCount] = useState(8);
  const [flashLogId, setFlashLogId] = useState<string | null>(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeFilters.source) count++;
    if (activeFilters.actionType) count++;
    if (activeFilters.severity) count++;
    if (activeFilters.dateRange) count++;
    return count;
  }, [activeFilters]);

  // Loading skeleton simulation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Silent SignalR live simulation (Background only, no debug buttons)
  useEffect(() => {
    const interval = setInterval(() => {
      const liveActors: { name: string; role: "Admin" | "Staff" | "System" }[] = [
        { name: "Sophia", role: "Admin" },
        { name: "Marcus Brody", role: "Staff" },
        { name: "System", role: "System" },
        { name: "Elena Rostova", role: "Staff" }
      ];
      const liveActions = [
        { action: "completed service for token K-120", category: "Queue", target: "K-120", severity: "Info" as const },
        { action: "started shift 'Weekend Rush'", category: "Shifts", target: "Weekend Rush", severity: "Info" as const },
        { action: "automatically extended active window SLA", category: "Settings", target: "SLA", severity: "Warning" as const },
        { action: "unlocked operator desk B-02 login session", category: "Security", target: "B-02", severity: "Info" as const }
      ];

      const chosenActor = liveActors[Math.floor(Math.random() * liveActors.length)];
      const chosenAction = liveActions[Math.floor(Math.random() * liveActions.length)];
      const sourceMap: Record<string, LogSource> = {
        Admin: "Admin",
        Staff: "Staff",
        System: "System"
      };

      const newLog: AuditLogEntry = {
        id: `log-live-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullDate: "2026-07-04",
        actorName: chosenActor.name,
        actorRole: chosenActor.role,
        action: chosenAction.action,
        target: chosenAction.target,
        category: chosenAction.category as LogCategory,
        source: sourceMap[chosenActor.role],
        severity: chosenAction.severity
      };

      setLogs(prev => [newLog, ...prev]);
      setFlashLogId(newLog.id);

      // Clear the temporary subtle flash highlight after 2.5 seconds
      const flashTimer = setTimeout(() => {
        setFlashLogId(null);
      }, 2500);

      return () => clearTimeout(flashTimer);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Filter & Search computation
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // 1. Text Search matching text, actor, or target
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        log.actorName.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        (log.target && log.target.toLowerCase().includes(searchLower));

      // 2. Source/Role filter
      const matchesSource = !activeFilters.source || log.source === activeFilters.source;

      // 3. Action type (category) filter
      const matchesActionType = !activeFilters.actionType || log.category === activeFilters.actionType;

      // 4. Severity filter
      const matchesSeverity = !activeFilters.severity || log.severity === activeFilters.severity;

      // 5. Date Range filter
      let matchesDate = true;
      if (activeFilters.dateRange === "Today") {
        matchesDate = log.fullDate === "2026-07-04";
      } else if (activeFilters.dateRange === "Yesterday") {
        matchesDate = log.fullDate === "2026-07-03";
      } else if (activeFilters.dateRange === "Older") {
        matchesDate = log.fullDate < "2026-07-03";
      }

      return matchesSearch && matchesSource && matchesActionType && matchesSeverity && matchesDate;
    });
  }, [logs, searchQuery, activeFilters]);

  const displayedLogs = useMemo(() => {
    return filteredLogs.slice(0, visibleCount);
  }, [filteredLogs, visibleCount]);

  const toggleFilter = (type: keyof typeof activeFilters, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? null : value
    }));
    setVisibleCount(8); // Reset to first page
  };

  const getSourceIcon = (source: LogSource) => {
    switch (source) {
      case "Staff": return <UserCheck className="w-3.5 h-3.5 text-white" />;
      case "Admin": return <Shield className="w-3.5 h-3.5 text-white" />;
      case "System": return <Cpu className="w-3.5 h-3.5 text-white" />;
    }
  };

  // High intensity colors for better visual grouping as requested - bold/saturated Linely brand colors
  const getSourceColorClass = (source: LogSource) => {
    switch (source) {
      case "Staff": return "bg-blue-600 border-blue-700 shadow-sm";
      case "Admin": return "bg-[#0D1A5E] border-[#091244] shadow-sm";
      case "System": return "bg-slate-600 border-slate-700 shadow-sm";
    }
  };

  const getRoleColorClass = (role: string) => {
    switch (role) {
      case "Admin": return "text-[#0D1A5E]";
      case "Staff": return "text-blue-600";
      case "System": return "text-slate-600";
      default: return "text-slate-900";
    }
  };

  const getSeverityBadgeClass = (severity: LogSeverity) => {
    switch (severity) {
      case "Info": return "bg-blue-50 text-blue-700 border border-blue-100";
      case "Warning": return "bg-amber-50 text-amber-800 border border-amber-200";
      case "Critical": return "bg-rose-50 text-rose-700 border border-rose-200";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-8 w-8 bg-slate-100 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Toolbar Skeleton */}
        <div className="h-24 bg-slate-50 border border-slate-150 rounded-2xl animate-pulse" />

        {/* Timeline Feed Skeleton */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/3 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-slate-50 rounded animate-pulse" />
              </div>
              <div className="h-4 w-16 bg-slate-100 rounded animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans select-none">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          {/* Breadcrumb path */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 font-outfit font-medium tracking-wide">
            <span className="hover:text-brand-navy cursor-pointer">Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-600">Audit Logs</span>
          </nav>
          <h1 className="font-outfit text-xl sm:text-2xl font-bold text-brand-navy tracking-tight">
            System Audit Logs
          </h1>
        </div>

        {/* Header Right Widgets: Notification Bell Button only (avatars stack removed) */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-all focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-cyan rounded-full ring-1 ring-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar / Filters Panel */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-150 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition-all font-sans text-slate-700 placeholder:text-slate-400 min-h-[44px] sm:min-h-0"
            />
          </div>

          {/* Controls: Filters Toggle + Reset Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {activeFiltersCount > 0 && (
              <button
                onClick={() => setActiveFilters({ source: null, actionType: null, severity: null, dateRange: null })}
                className="px-3 py-2 text-xs font-outfit font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer flex items-center gap-1 min-h-[44px] sm:min-h-0"
              >
                Reset ({activeFiltersCount})
              </button>
            )}

            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-outfit font-bold border transition-all focus:outline-none min-h-[44px] sm:min-h-0 cursor-pointer ${
                isFilterDropdownOpen 
                  ? "bg-[#0D1A5E] border-[#0D1A5E] text-white" 
                  : activeFiltersCount > 0 
                  ? "bg-brand-cyan/10 border-brand-cyan text-brand-navy"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-brand-cyan text-brand-navy font-extrabold text-[10px]">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Selected Active Filters Overview (shown when collapsed for quick reference) */}
        {!isFilterDropdownOpen && activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-dashed border-slate-100">
            <span className="text-[11px] font-outfit font-bold text-slate-400 mr-1 uppercase tracking-wide">Active:</span>
            {activeFilters.source && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0D1A5E]/10 text-[#0D1A5E] text-xs font-semibold">
                Role: {activeFilters.source}
                <button onClick={() => toggleFilter("source", activeFilters.source)} className="hover:text-rose-600 font-extrabold ml-1 px-0.5">×</button>
              </span>
            )}
            {activeFilters.severity && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 text-xs font-semibold">
                Severity: {activeFilters.severity}
                <button onClick={() => toggleFilter("severity", activeFilters.severity)} className="hover:text-rose-600 font-extrabold ml-1 px-0.5">×</button>
              </span>
            )}
            {activeFilters.actionType && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-cyan/20 text-brand-navy text-xs font-semibold">
                Category: {activeFilters.actionType}
                <button onClick={() => toggleFilter("actionType", activeFilters.actionType)} className="hover:text-rose-600 font-extrabold ml-1 px-0.5">×</button>
              </span>
            )}
            {activeFilters.dateRange && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#091244]/10 text-[#091244] text-xs font-semibold">
                Date: {activeFilters.dateRange}
                <button onClick={() => toggleFilter("dateRange", activeFilters.dateRange)} className="hover:text-rose-600 font-extrabold ml-1 px-0.5">×</button>
              </span>
            )}
          </div>
        )}

        {/* Collapsible Filters Dropdown / Grid Panel */}
        <AnimatePresence>
          {isFilterDropdownOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                
                {/* 1. Role / Source */}
                <div className="space-y-2">
                  <span className="block text-[11px] font-outfit font-bold text-slate-400 uppercase tracking-wide">Role</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Admin", "Staff", "System"].map((source) => {
                      const isSelected = activeFilters.source === source;
                      return (
                        <button
                          key={source}
                          onClick={() => toggleFilter("source", source as LogSource)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-outfit font-semibold transition-all min-h-[40px] sm:min-h-0 flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? "bg-[#0D1A5E] text-white shadow-sm"
                              : "bg-slate-50 border border-slate-150 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {source}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Severity */}
                <div className="space-y-2">
                  <span className="block text-[11px] font-outfit font-bold text-slate-400 uppercase tracking-wide">Severity</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Info", "Warning", "Critical"].map((sev) => {
                      const isSelected = activeFilters.severity === sev;
                      const activeColors = {
                        Info: "bg-blue-600 text-white shadow-sm",
                        Warning: "bg-amber-500 text-brand-navy font-bold shadow-sm",
                        Critical: "bg-rose-600 text-white shadow-sm"
                      };
                      return (
                        <button
                          key={sev}
                          onClick={() => toggleFilter("severity", sev as LogSeverity)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-outfit font-semibold transition-all min-h-[40px] sm:min-h-0 flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? activeColors[sev as LogSeverity]
                              : "bg-slate-50 border border-slate-150 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {sev}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Category */}
                <div className="space-y-2">
                  <span className="block text-[11px] font-outfit font-bold text-slate-400 uppercase tracking-wide">Category</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Queue", "Shifts", "Settings", "Security"].map((cat) => {
                      const isSelected = activeFilters.actionType === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleFilter("actionType", cat as LogCategory)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-outfit font-semibold transition-all min-h-[40px] sm:min-h-0 flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? "bg-brand-cyan text-brand-navy font-bold shadow-sm"
                              : "bg-slate-50 border border-slate-150 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Date Range */}
                <div className="space-y-2">
                  <span className="block text-[11px] font-outfit font-bold text-slate-400 uppercase tracking-wide">Date Range</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Today", "Yesterday", "Older"].map((range) => {
                      const isSelected = activeFilters.dateRange === range;
                      return (
                        <button
                          key={range}
                          onClick={() => toggleFilter("dateRange", range as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-outfit font-semibold transition-all min-h-[40px] sm:min-h-0 flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? "bg-[#091244] text-brand-cyan font-bold shadow-sm"
                              : "bg-slate-50 border border-slate-150 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {range}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Feed Activity Section */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <AnimatePresence mode="popLayout">
          {displayedLogs.length > 0 ? (
            <div className="relative">
              {/* Vertical line connecting timeline dots (Desktop/Tablet only) */}
              <div className="hidden sm:block absolute left-[15px] top-3 bottom-3 w-[1px] bg-slate-100" />

              <div className="space-y-6 sm:space-y-4">
                {displayedLogs.map((log) => {
                  const isNewFlash = flashLogId === log.id;
                  return (
                    <motion.div
                      key={log.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        backgroundColor: isNewFlash ? "rgba(0, 195, 227, 0.08)" : "transparent"
                      }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-2.5 rounded-2xl sm:rounded-none border sm:border-0 border-slate-100 shadow-sm sm:shadow-none bg-slate-50/40 sm:bg-transparent"
                    >
                      {/* Timeline Dot (Desktop/Tablet version only) */}
                      <div className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center z-10">
                        <div className={`w-6 h-6 rounded-full border border-white flex items-center justify-center ring-4 ring-white ${getSourceColorClass(log.source)}`}>
                          {getSourceIcon(log.source)}
                        </div>
                      </div>

                      {/* Main log content */}
                      <div className="sm:pl-12 flex-1 flex items-center gap-3">
                        {/* Mobile view top indicator */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <div className={`sm:hidden w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${getSourceColorClass(log.source)}`}>
                            {getSourceIcon(log.source)}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Inline avatar wrapper */}
                            <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-outfit font-bold text-slate-500 flex items-center justify-center shrink-0">
                              {log.actorName.slice(0, 2).toUpperCase()}
                            </div>

                            {/* Text structure */}
                            <p className="text-sm font-sans text-slate-700 leading-normal">
                              <span className={`font-semibold mr-1 ${getRoleColorClass(log.actorRole)}`}>
                                {log.actorName} ({log.actorRole})
                              </span>
                              {log.action}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Metadata / Timestamp */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 border-t border-slate-100 sm:border-t-0 pt-2 sm:pt-0 shrink-0">
                        <span className="font-mono text-xs text-slate-400 font-medium">
                          {log.timestamp}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-outfit font-bold tracking-widest text-slate-400 uppercase">
                            {log.category}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-outfit font-bold uppercase tracking-wider ${getSeverityBadgeClass(log.severity)}`}>
                            {log.severity}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {visibleCount < filteredLogs.length && (
                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-center">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 6)}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-outfit font-bold text-slate-600 hover:text-brand-navy hover:bg-slate-50 border border-slate-200 transition-all focus:outline-none min-h-[44px] cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    Load More Activity
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center max-w-sm mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center mx-auto text-slate-400">
                <Inbox className="w-5 h-5" />
              </div>
              <h3 className="font-outfit text-base font-bold text-slate-800">
                No activity matches these filters
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                No system log records fit the selected criteria. Try resetting the filters or modifying your search parameter.
              </p>
              <button
                onClick={() => setActiveFilters({ source: null, actionType: null, severity: null, dateRange: null })}
                className="text-xs font-outfit font-bold text-brand-cyan hover:underline hover:text-cyan-600 pt-2 block mx-auto cursor-pointer"
              >
                Clear all active filters
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
