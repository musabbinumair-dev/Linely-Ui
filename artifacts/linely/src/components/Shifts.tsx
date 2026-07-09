import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Bell, AlignLeft, Calendar, Clock, User, Briefcase, AlertTriangle, List,
  Columns, LayoutGrid, Search, Filter, MoreVertical, XCircle, CheckCircle2,
  ChevronLeft, ChevronRight, X, Coffee, Play, Square, MapPin
} from "lucide-react";

export type ShiftStatus = "Upcoming" | "Active" | "On Break" | "Ending Soon" | "Ended";
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface BreakWindow {
  id: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface Shift {
  id: string;
  templateName: string;
  department: string;
  staffName: string;
  counterName: string;
  isRecurring: boolean;
  daysOfWeek: DayOfWeek[];
  specificDate?: string;
  startTime: string;
  endTime: string;
  breaks: BreakWindow[];
  status: ShiftStatus;
  autoExtendBuffer: number;
  pendingExtensionRequest?: number;
}

const CONFIG = {
  autoExtendBufferMins: 15,
};

export const AvailabilityEngine = {
  checkDepartmentOpen: (
    department: string, 
    businessHours: { start: string, end: string },
    isAlwaysOpen: boolean,
    activeShifts: Shift[],
    currentTime: Date = new Date()
  ) => {
    if (isAlwaysOpen) {
      return { isOpen: true, nextOpenTime: null, reason: null };
    }

    const currentHHmm = currentTime.getHours().toString().padStart(2, '0') + ':' + currentTime.getMinutes().toString().padStart(2, '0');
    const withinBusinessHours = currentHHmm >= businessHours.start && currentHHmm <= businessHours.end;
    
    const hasActiveShift = activeShifts.some(s => 
      s.department === department && 
      (s.status === "Active" || s.status === "Ending Soon")
    );

    const isOpen = withinBusinessHours && hasActiveShift;

    let nextOpenTime = null;
    let reason = null;
    
    if (!isOpen) {
      if (!withinBusinessHours) {
        reason = "Outside business hours";
        nextOpenTime = `Tomorrow at ${businessHours.start}`;
      } else if (!hasActiveShift) {
        reason = "No active staff";
        const futureShifts = activeShifts
          .filter(s => s.department === department && s.startTime > currentHHmm)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        if (futureShifts.length > 0) {
          nextOpenTime = `Today at ${futureShifts[0].startTime}`;
        } else {
          nextOpenTime = `Tomorrow at ${businessHours.start}`;
        }
      }
    }

    return { isOpen, nextOpenTime, reason };
  }
};

export function CustomerClosedMessage({ department, businessHours, isAlwaysOpen, activeShifts, currentTime = new Date() }: { department: string, businessHours: any, isAlwaysOpen: boolean, activeShifts: Shift[], currentTime?: Date }) {
  const status = AvailabilityEngine.checkDepartmentOpen(department, businessHours, isAlwaysOpen, activeShifts, currentTime);
  
  if (status.isOpen) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center max-w-sm mx-auto my-4 shadow-sm">
      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock className="w-6 h-6 text-slate-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 font-outfit mb-2">Currently Closed</h3>
      <p className="text-sm text-slate-600 mb-4">{status.reason === "Outside business hours" ? "We are currently outside of our normal operating hours." : "There are currently no staff members available for this service."}</p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm">
        Opens: <span className="text-brand-navy">{status.nextOpenTime}</span>
      </div>
    </div>
  );
}

const INITIAL_SHIFTS: Shift[] = [
  {
    id: "s1",
    templateName: "Morning Shift",
    department: "Customer Service",
    staffName: "Sarah Jenkins",
    counterName: "Counter 1",
    isRecurring: true,
    daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    startTime: "08:00",
    endTime: "16:00",
    breaks: [{ id: "b1", startTime: "12:00", endTime: "12:30" }],
    status: "Active",
    autoExtendBuffer: CONFIG.autoExtendBufferMins
  },
  {
    id: "s2",
    templateName: "Mid Shift",
    department: "Loans",
    staffName: "Robert Chen",
    counterName: "Counter 3",
    isRecurring: true,
    daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    startTime: "10:00",
    endTime: "18:00",
    breaks: [{ id: "b2", startTime: "14:00", endTime: "14:30" }],
    status: "Upcoming",
    autoExtendBuffer: CONFIG.autoExtendBufferMins
  }
];

const DEPARTMENTS = ["Customer Service", "Loans", "Complaints", "Teller", "Emergency (Always Open)"];
const STAFF = ["Sarah Jenkins", "Robert Chen", "Maria Garcia", "James Wilson", "Elena Rostova", "Sophia Lee"];
const COUNTERS = ["Counter 1", "Counter 2", "Counter 3", "Counter 4", "Counter 5"];

export default function Shifts() {
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [view, setView] = useState<"list" | "timeline">("timeline"); // default to timeline to test drag
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Drag to create / resize state
  const [dragAction, setDragAction] = useState<{type: "create" | "resizeStart" | "resizeEnd", shiftId?: string, staff?: string, startMins?: number, currentMins?: number} | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const currentHHmm = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      
      setShifts(prev => prev.map(shift => {
        let newStatus = shift.status;
        if (currentHHmm < shift.startTime) newStatus = "Upcoming";
        else if (currentHHmm >= shift.startTime && currentHHmm < shift.endTime) {
          newStatus = "Active";
          for (const b of shift.breaks) {
            if (currentHHmm >= b.startTime && currentHHmm < b.endTime) {
              newStatus = "On Break";
              break;
            }
          }
          if (newStatus === "Active") {
            const [endH, endM] = shift.endTime.split(':').map(Number);
            const endTotalMins = endH * 60 + endM;
            const curTotalMins = now.getHours() * 60 + now.getMinutes();
            if (endTotalMins - curTotalMins <= 30 && endTotalMins - curTotalMins > 0) {
              newStatus = "Ending Soon";
            }
          }
        } else {
          // Auto extend logic
          const [endH, endM] = shift.endTime.split(':').map(Number);
          const endTotalMins = endH * 60 + endM;
          const curTotalMins = now.getHours() * 60 + now.getMinutes();
          
          if (curTotalMins >= endTotalMins && curTotalMins < endTotalMins + shift.autoExtendBuffer) {
             // We are inside the auto-extend buffer! Let's pretend the shift is still active but ending soon
             newStatus = "Ending Soon";
          } else {
             newStatus = "Ended";
          }
        }
        if (newStatus !== shift.status) return { ...shift, status: newStatus };
        return shift;
      }));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const activeNow = shifts.filter(s => s.status === "Active" || s.status === "Ending Soon").length;
  const onBreak = shifts.filter(s => s.status === "On Break").length;
  const endingSoon = shifts.filter(s => s.status === "Ending Soon").length;
  const uncoveredCount = DEPARTMENTS.filter(d => 
    d !== "Emergency (Always Open)" && !shifts.some(s => s.department === d && (s.status === "Active" || s.status === "Ending Soon"))
  ).length;

  const handleApproveExtension = (shiftId: string, minutes: number) => {
    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        const [h, m] = s.endTime.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m + minutes);
        const newEndTime = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
        return { ...s, endTime: newEndTime, pendingExtensionRequest: undefined, status: "Active" };
      }
      return s;
    }));
    setIsNotificationOpen(false);
  };

  const handleDenyExtension = (shiftId: string) => {
    setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, pendingExtensionRequest: undefined } : s));
    setIsNotificationOpen(false);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setShifts(prev => {
         const hasPending = prev.some(s => s.pendingExtensionRequest);
         if (!hasPending && prev.length > 0) {
            return prev.map((s, i) => i === 0 ? { ...s, pendingExtensionRequest: 30 } : s);
         }
         return prev;
      });
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  const getMinsFromEvent = (e: React.MouseEvent | MouseEvent) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 192; // 192 is staff column width
    const totalWidth = rect.width - 192;
    const pct = Math.max(0, Math.min(1, x / totalWidth));
    // Timeline is 8:00 to 18:00 (10 hours = 600 mins)
    let rawMins = pct * 600;
    // Snap to 15 min intervals
    rawMins = Math.round(rawMins / 15) * 15;
    return rawMins;
  };

  const minsToTimeStr = (mins: number) => {
    const total = mins + (8 * 60); // add 8 hours
    const h = Math.floor(total / 60);
    const m = Math.floor(total % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const timeStrToMins = (str: string) => {
    const [h, m] = str.split(':').map(Number);
    return (h - 8) * 60 + m;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragAction) return;
    const currentMins = getMinsFromEvent(e);
    setDragAction(prev => prev ? { ...prev, currentMins } : null);
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!dragAction) return;
    const finalMins = getMinsFromEvent(e);
    
    if (dragAction.type === "create") {
       const start = Math.min(dragAction.startMins!, finalMins);
       const end = Math.max(dragAction.startMins!, finalMins);
       if (end - start >= 30) {
         // Open create modal with pre-filled times
         setEditingShift({
           id: "s" + Date.now(),
           templateName: "New Custom Shift",
           department: DEPARTMENTS[0],
           staffName: dragAction.staff!,
           counterName: COUNTERS[0],
           isRecurring: false,
           daysOfWeek: [],
           specificDate: new Date().toISOString().split('T')[0],
           startTime: minsToTimeStr(start),
           endTime: minsToTimeStr(end),
           breaks: [],
           status: "Upcoming",
           autoExtendBuffer: CONFIG.autoExtendBufferMins
         });
         setIsCreateModalOpen(true);
       }
    } else if (dragAction.type === "resizeStart" || dragAction.type === "resizeEnd") {
       setShifts(prev => prev.map(s => {
         if (s.id === dragAction.shiftId) {
            let newStart = timeStrToMins(s.startTime);
            let newEnd = timeStrToMins(s.endTime);
            if (dragAction.type === "resizeStart") {
               newStart = Math.min(finalMins, newEnd - 30);
            } else {
               newEnd = Math.max(finalMins, newStart + 30);
            }
            return {
              ...s,
              startTime: minsToTimeStr(newStart),
              endTime: minsToTimeStr(newEnd)
            };
         }
         return s;
       }));
    }
    
    setDragAction(null);
  };

  useEffect(() => {
    if (dragAction) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
    return undefined;
  }, [dragAction]);

  return (
    <div className="space-y-6 font-sans select-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div className="text-[13px] font-medium text-slate-500 font-space tracking-wide">
          Dashboard <span className="mx-2 text-slate-300">/</span> <span className="text-slate-900 font-bold">Shifts</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2 mr-2">
             <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 z-30 shadow-sm">ML</div>
             <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 z-20 shadow-sm">SJ</div>
             <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-cream flex items-center justify-center text-xs font-bold text-brand-navy z-10 shadow-sm">+3</div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors bg-white border border-slate-200 rounded-xl shadow-sm"
            >
              <Bell className="w-4 h-4" />
              {shifts.some(s => s.pendingExtensionRequest) && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-slate-100 bg-slate-50 font-bold text-sm text-slate-800">Pending Requests</div>
                  <div className="p-0 text-sm text-slate-600">
                    {shifts.filter(s => s.pendingExtensionRequest).length === 0 ? (
                      <div className="p-4 text-slate-500 text-center">No pending requests.</div>
                    ) : (
                      shifts.filter(s => s.pendingExtensionRequest).map(shift => (
                        <div key={shift.id} className="p-4 border-b border-slate-100 last:border-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-slate-800">{shift.staffName}</p>
                              <p className="text-xs text-slate-500">Requests +{shift.pendingExtensionRequest}m extension</p>
                            </div>
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">Action Needed</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => handleApproveExtension(shift.id, shift.pendingExtensionRequest!)} className="flex-1 bg-brand-navy text-white text-xs font-bold py-2 rounded-lg hover:bg-brand-deepnavy transition-colors">Approve</button>
                            <button onClick={() => handleDenyExtension(shift.id)} className="flex-1 bg-slate-100 text-slate-700 text-xs font-bold py-2 rounded-lg hover:bg-slate-200 transition-colors">Deny</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => { setEditingShift(null); setIsCreateModalOpen(true); }}
            className="flex items-center gap-2 bg-brand-navy hover:bg-brand-deepnavy text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_2px_10px_rgba(26,35,114,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Create Shift
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center"><Briefcase className="w-5 h-5 text-brand-cyan" /></div>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-4xl font-bold font-outfit text-slate-900 tracking-tight">{activeNow}</div>
          </div>
          <div className="text-sm font-space font-medium text-slate-500 mt-1">Active Shifts Now</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><Coffee className="w-5 h-5 text-slate-600" /></div>
          </div>
          <div className="text-4xl font-bold font-outfit text-slate-900 tracking-tight">{onBreak}</div>
          <div className="text-sm font-space font-medium text-slate-500 mt-1">Staff on Break</div>
        </div>

        <div className="bg-white border border-amber-200 rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Clock className="w-5 h-5 text-amber-600" /></div>
          </div>
          <div className="text-4xl font-bold font-outfit text-slate-900 tracking-tight">{endingSoon}</div>
          <div className="text-sm font-space font-medium text-amber-600 mt-1">Ending Soon ({'<'}30 min)</div>
        </div>

        <div className="bg-white border border-rose-200 rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-rose-600" /></div>
          </div>
          <div className="text-4xl font-bold font-outfit text-slate-900 tracking-tight">{uncoveredCount}</div>
          <div className="text-sm font-space font-medium text-rose-600 mt-1">Uncovered Counters</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button onClick={() => setView("list")} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === "list" ? "bg-white text-brand-navy shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            <AlignLeft className="w-4 h-4" /> List View
          </button>
          <button onClick={() => setView("timeline")} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === "timeline" ? "bg-white text-brand-navy shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            <Calendar className="w-4 h-4" /> Timeline
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] min-h-[400px]">
        {view === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space">Shift & Dept</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space">Staff / Counter</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space">Schedule</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space">Time</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-[13px]">{shift.templateName}</span>
                        <span className="text-[12px] text-slate-500">{shift.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-navy/5 border border-brand-navy/10 flex items-center justify-center text-[11px] font-bold text-brand-navy shrink-0">{shift.staffName.charAt(0)}</div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-slate-800">{shift.staffName}</span>
                          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {shift.counterName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {shift.isRecurring ? (
                        <div className="flex gap-1">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                            <span key={d} className={`text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold ${shift.daysOfWeek.includes(d as DayOfWeek) ? 'bg-brand-navy text-white' : 'bg-slate-100 text-slate-400'}`}>{d.charAt(0)}</span>
                          ))}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold"><Calendar className="w-3.5 h-3.5 text-slate-500" />{shift.specificDate} (One-off)</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-[13px] text-slate-800 font-bold">{shift.startTime} – {shift.endTime}</span>
                        {shift.breaks.length > 0 && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><Coffee className="w-3 h-3" /> Break: {shift.breaks[0].startTime}-{shift.breaks[0].endTime}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4"><ShiftBadge status={shift.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setEditingShift(shift); setIsCreateModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-brand-navy hover:bg-slate-100 rounded-lg transition-colors font-bold text-xs uppercase tracking-wider">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col" ref={timelineRef}>
              <div className="flex border-b border-slate-200 bg-slate-50/80">
                <div className="w-48 shrink-0 border-r border-slate-200 p-3 text-[11px] font-bold text-slate-500 uppercase font-space flex items-center">Staff / Counter</div>
                <div className="flex-1 flex text-[11px] font-bold text-slate-400">
                  {[8,9,10,11,12,13,14,15,16,17,18].map(h => (
                    <div key={h} className="flex-1 p-2 border-r border-slate-100 last:border-0 relative">{h}:00</div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col divide-y divide-slate-100 bg-white relative">
                {currentTime.getHours() >= 8 && currentTime.getHours() <= 18 && (
                  <div className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none" style={{ left: `calc(192px + (((${currentTime.getHours()} - 8) * 60 + ${currentTime.getMinutes()}) / 600) * (100% - 192px))` }}>
                    <div className="absolute top-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                )}
                {STAFF.map(staff => {
                  const staffShifts = shifts.filter(s => s.staffName === staff);
                  return (
                    <div key={staff} className="flex min-h-[60px] hover:bg-slate-50/50 transition-colors group relative"
                         onMouseDown={(e) => {
                           if (e.target === e.currentTarget.children[1]) {
                             // Clicking empty space
                             const m = getMinsFromEvent(e);
                             setDragAction({ type: "create", staff, startMins: m, currentMins: m });
                           }
                         }}
                    >
                      <div className="w-48 shrink-0 border-r border-slate-200 p-3 flex items-center gap-3 bg-white z-10">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-600">{staff.charAt(0)}</div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[12px] font-bold text-slate-800 truncate">{staff}</span>
                          <span className="text-[10px] text-slate-500 truncate">{staffShifts[0]?.counterName || "Unassigned"}</span>
                        </div>
                      </div>
                      <div className="flex-1 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iOS4wOSUiIGhlaWdodD0iMTAwJSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA5LjA5JSAwIEwgOS4wOSUgMTAwJSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjFmNWY5IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]">
                        
                        {/* Drag to create preview block */}
                        {dragAction?.type === "create" && dragAction.staff === staff && (
                          <div 
                             className="absolute top-2 bottom-2 bg-brand-navy/30 border border-brand-navy/50 rounded-lg pointer-events-none"
                             style={{
                               left: `${(Math.min(dragAction.startMins!, dragAction.currentMins!) / 600) * 100}%`,
                               width: `${(Math.abs(dragAction.currentMins! - dragAction.startMins!) / 600) * 100}%`
                             }}
                          />
                        )}

                        {staffShifts.map(shift => {
                          const [sh, sm] = shift.startTime.split(':').map(Number);
                          const [eh, em] = shift.endTime.split(':').map(Number);
                          const startMins = Math.max(0, (sh - 8) * 60 + sm);
                          const endMins = Math.min(600, (eh - 8) * 60 + em);
                          
                          if (startMins >= 600 || endMins <= 0) return null;
                          
                          const leftPct = (startMins / 600) * 100;
                          const widthPct = ((endMins - startMins) / 600) * 100;

                          let bgColor = "bg-brand-navy";
                          if (shift.status === "On Break") bgColor = "bg-slate-400";
                          if (shift.status === "Ending Soon") bgColor = "bg-amber-500";
                          if (shift.status === "Ended") bgColor = "bg-slate-300";
                          if (shift.status === "Upcoming") bgColor = "bg-brand-cyan";

                          return (
                            <div 
                              key={shift.id}
                              className={`absolute top-2 bottom-2 rounded-lg ${bgColor} shadow-sm overflow-hidden flex flex-col justify-center px-2 cursor-pointer border border-white/20 transition-all hover:opacity-90 group/block`}
                              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                              onClick={() => { setEditingShift(shift); setIsCreateModalOpen(true); }}
                            >
                              <div className="flex items-center justify-between text-white select-none">
                                <span className="text-[10px] font-bold truncate">{shift.department}</span>
                                <span className="text-[9px] font-mono opacity-80">{shift.startTime}-{shift.endTime}</span>
                              </div>
                              {shift.breaks.map((brk, idx) => {
                                const [bsh, bsm] = brk.startTime.split(':').map(Number);
                                const [beh, bem] = brk.endTime.split(':').map(Number);
                                const bStartMins = (bsh - 8) * 60 + bsm;
                                const bEndMins = (beh - 8) * 60 + bem;
                                const bLeftPct = ((bStartMins - startMins) / (endMins - startMins)) * 100;
                                const bWidthPct = ((bEndMins - bStartMins) / (endMins - startMins)) * 100;
                                return (
                                  <div key={idx} className="absolute top-0 bottom-0 bg-white/30 border-x border-white/40 pointer-events-none" style={{ left: `${bLeftPct}%`, width: `${bWidthPct}%` }} />
                                );
                              })}
                              {/* Drag Handles */}
                              <div 
                                className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover/block:opacity-100 hover:bg-white/30 transition-colors"
                                onMouseDown={(e) => { e.stopPropagation(); setDragAction({ type: "resizeStart", shiftId: shift.id }); }}
                              />
                              <div 
                                className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover/block:opacity-100 hover:bg-white/30 transition-colors"
                                onMouseDown={(e) => { e.stopPropagation(); setDragAction({ type: "resizeEnd", shiftId: shift.id }); }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400 font-medium">Tip: Click and drag on the timeline to create a new shift, or drag the edges of an existing shift to resize it.</div>
          </div>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-slate-800 font-outfit mb-4 flex items-center gap-2">
          <Play className="w-4 h-4 text-brand-cyan" /> Availability Engine (Cross-Channel Mock)
        </h3>
        <p className="text-xs text-slate-500 mb-6">This engine calculates real-time queue availability across Kiosk, Web, and App channels based on active shifts and business hours. Shared component handles messaging consistently.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Mocking the three required channels */}
           <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-2">Kiosk Interface</div>
              <div className="flex-1 flex flex-col items-center justify-center min-h-[160px]">
                {AvailabilityEngine.checkDepartmentOpen("Customer Service", {start: "08:00", end: "18:00"}, false, shifts, currentTime).isOpen ? (
                  <button className="w-full py-4 bg-brand-navy text-white rounded-xl font-bold">Join Queue</button>
                ) : (
                  <CustomerClosedMessage department="Customer Service" businessHours={{start: "08:00", end: "18:00"}} isAlwaysOpen={false} activeShifts={shifts} currentTime={currentTime} />
                )}
              </div>
           </div>

           <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-2">Mobile App</div>
              <div className="flex-1 flex flex-col items-center justify-center min-h-[160px]">
                {AvailabilityEngine.checkDepartmentOpen("Customer Service", {start: "08:00", end: "18:00"}, false, shifts, currentTime).isOpen ? (
                  <button className="w-full py-4 bg-brand-navy text-white rounded-xl font-bold">Generate Digital Token</button>
                ) : (
                  <CustomerClosedMessage department="Customer Service" businessHours={{start: "08:00", end: "18:00"}} isAlwaysOpen={false} activeShifts={shifts} currentTime={currentTime} />
                )}
              </div>
           </div>

           <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-2">Web Booking</div>
              <div className="flex-1 flex flex-col items-center justify-center min-h-[160px]">
                {AvailabilityEngine.checkDepartmentOpen("Customer Service", {start: "08:00", end: "18:00"}, false, shifts, currentTime).isOpen ? (
                  <button className="w-full py-4 bg-brand-navy text-white rounded-xl font-bold">Book Appointment Now</button>
                ) : (
                  <CustomerClosedMessage department="Customer Service" businessHours={{start: "08:00", end: "18:00"}} isAlwaysOpen={false} activeShifts={shifts} currentTime={currentTime} />
                )}
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold font-outfit text-slate-900">{editingShift ? "Edit Shift" : "Create Shift"}</h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form 
                  id="create-shift-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    
                    const shiftData = {
                      templateName: formData.get("name") as string,
                      department: formData.get("department") as string,
                      staffName: formData.get("staff") as string,
                      counterName: formData.get("counter") as string,
                      isRecurring: formData.get("type") === "recurring",
                      daysOfWeek: formData.get("type") === "recurring" ? ["Mon", "Tue", "Wed", "Thu", "Fri"] as DayOfWeek[] : [],
                      specificDate: formData.get("type") === "oneoff" ? formData.get("date") as string : undefined,
                      startTime: formData.get("startTime") as string,
                      endTime: formData.get("endTime") as string,
                    };

                    if (editingShift) {
                       setShifts(prev => prev.map(s => s.id === editingShift.id ? { ...s, ...shiftData } : s));
                    } else {
                       setShifts(prev => [...prev, { ...shiftData, id: "s" + Date.now(), breaks: [], status: "Upcoming", autoExtendBuffer: CONFIG.autoExtendBufferMins }]);
                    }
                    setIsCreateModalOpen(false);
                    setEditingShift(null);
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider font-space">Shift Name</label>
                      <input name="name" required type="text" defaultValue={editingShift?.templateName} placeholder="e.g. Morning Shift" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-800 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan outline-none" />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider font-space">Department</label>
                      <select name="department" defaultValue={editingShift?.department} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-800 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan outline-none">
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider font-space">Staff Member</label>
                      <select name="staff" defaultValue={editingShift?.staffName} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-800 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan outline-none">
                        {STAFF.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider font-space">Counter Assignment</label>
                      <select name="counter" defaultValue={editingShift?.counterName} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-800 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan outline-none">
                        {COUNTERS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider font-space">Time Window</label>
                      <div className="flex items-center gap-2">
                        <input name="startTime" type="time" required defaultValue={editingShift?.startTime || "09:00"} className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-mono font-bold text-slate-800 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan outline-none" />
                        <span className="text-slate-400 font-medium">to</span>
                        <input name="endTime" type="time" required defaultValue={editingShift?.endTime || "17:00"} className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-mono font-bold text-slate-800 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan outline-none" />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-wider font-space">Schedule Type</label>
                      <div className="flex gap-4">
                        <label className="flex-1 relative cursor-pointer group">
                          <input type="radio" name="type" value="recurring" defaultChecked={!editingShift || editingShift.isRecurring} className="peer sr-only" />
                          <div className="p-4 border-2 border-slate-100 rounded-xl peer-checked:border-brand-navy peer-checked:bg-brand-navy/5 transition-all">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-slate-400 peer-checked:text-brand-navy" />
                              <span className="font-bold text-slate-800 text-sm">Recurring</span>
                            </div>
                            <p className="text-xs text-slate-500">Repeats weekly on selected days</p>
                          </div>
                        </label>
                        <label className="flex-1 relative cursor-pointer group">
                          <input type="radio" name="type" value="oneoff" defaultChecked={!!(editingShift && !editingShift.isRecurring)} className="peer sr-only" />
                          <div className="p-4 border-2 border-slate-100 rounded-xl peer-checked:border-brand-cyan peer-checked:bg-cyan-50 transition-all">
                            <div className="flex items-center gap-2 mb-1">
                              <Square className="w-4 h-4 text-slate-400 peer-checked:text-brand-cyan" />
                              <span className="font-bold text-slate-800 text-sm">One-off Override</span>
                            </div>
                            <p className="text-xs text-slate-500">Specific date only, ignores template</p>
                            <input name="date" type="date" defaultValue={editingShift?.specificDate || new Date().toISOString().split('T')[0]} className="mt-2 w-full px-2 py-1 bg-white border border-slate-200 rounded text-[13px] font-bold text-slate-800 opacity-50 peer-checked:opacity-100" />
                          </div>
                        </label>
                      </div>
                    </div>

                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                {editingShift && (
                  <button type="button" onClick={() => { setShifts(prev => prev.filter(s => s.id !== editingShift.id)); setIsCreateModalOpen(false); setEditingShift(null); }} className="mr-auto px-5 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                    Delete
                  </button>
                )}
                <button type="button" onClick={() => { setIsCreateModalOpen(false); setEditingShift(null); }} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" form="create-shift-form" className="px-5 py-2.5 bg-brand-navy hover:bg-brand-deepnavy text-white text-sm font-bold rounded-xl shadow-md transition-all">
                  {editingShift ? "Save Changes" : "Create Shift"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShiftBadge({ status }: { status: ShiftStatus }) {
  if (status === "Active") return <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-cyan/10 text-brand-cyan text-[11px] font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Active</div>;
  if (status === "Upcoming") return <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold"><Clock className="w-3.5 h-3.5" /> Upcoming</div>;
  if (status === "On Break") return <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold"><Coffee className="w-3.5 h-3.5" /> On Break</div>;
  if (status === "Ending Soon") return <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold animate-pulse"><AlertTriangle className="w-3.5 h-3.5" /> Ending Soon</div>;
  return <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 text-[11px] font-bold"><XCircle className="w-3.5 h-3.5" /> Ended</div>;
}
