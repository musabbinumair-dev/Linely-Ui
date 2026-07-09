import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Clock, 
  Volume2, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  SkipForward, 
  Ban, 
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  MonitorSmartphone,
  Smartphone,
  MousePointerClick,
  DoorOpen,
  Circle,
  Accessibility,
  AlertTriangle,
  Star,
  Baby,
  PersonStanding,
  ChevronDown,
  LayoutTemplate,
  Calendar,
  Columns,
  CheckSquare,
  Square,
  ArrowUp,
  ArrowDown
} from "lucide-react";

type PriorityTier = "Normal" | "Elderly" | "Pregnant" | "Disabled" | "Emergency" | "VIP";
type TicketStatus = "Waiting" | "Called" | "Serving" | "Completed" | "No-show" | "Skipped" | "Cancelled" | "Transferred";
type Channel = "Kiosk" | "Mobile App" | "Web Booking" | "Walk-in";

interface QueueTicket {
  id: string;
  tokenId: string;
  customerName: string;
  serviceType: string;
  priority: PriorityTier;
  channel: Channel;
  status: TicketStatus;
  counterName?: string;
  operatorName?: string;
  createdAt: Date;
  calledAt?: Date;
  isNew?: boolean;
}

const PRIORITY_CONFIG: Record<PriorityTier, { color: string; icon: any }> = {
  "Normal": { color: "text-slate-600 bg-slate-100", icon: Circle },
  "Elderly": { color: "text-brand-cyan bg-cyan-50", icon: PersonStanding },
  "Pregnant": { color: "text-pink-600 bg-pink-50", icon: Baby },
  "Disabled": { color: "text-blue-600 bg-blue-50", icon: Accessibility },
  "Emergency": { color: "text-red-600 bg-red-50", icon: AlertTriangle },
  "VIP": { color: "text-amber-600 bg-amber-50", icon: Star },
};

const STATUS_CONFIG: Record<TicketStatus, { color: string; icon: any }> = {
  "Waiting": { color: "text-blue-600 bg-blue-50", icon: Clock },
  "Called": { color: "text-brand-cyan bg-cyan-50", icon: Volume2 },
  "Serving": { color: "text-emerald-600 bg-emerald-50", icon: UserCheck },
  "Completed": { color: "text-slate-500 bg-slate-100", icon: CheckCircle2 },
  "No-show": { color: "text-rose-600 bg-rose-50", icon: XCircle },
  "Skipped": { color: "text-orange-600 bg-orange-50", icon: SkipForward },
  "Cancelled": { color: "text-slate-600 bg-slate-100", icon: Ban },
  "Transferred": { color: "text-purple-600 bg-purple-50", icon: ArrowRightLeft },
};

const CHANNEL_CONFIG: Record<Channel, { icon: any; label: string }> = {
  "Kiosk": { icon: MonitorSmartphone, label: "Kiosk" },
  "Mobile App": { icon: Smartphone, label: "Mobile App" },
  "Web Booking": { icon: MousePointerClick, label: "Web Booking" },
  "Walk-in": { icon: DoorOpen, label: "Walk-in" },
};

const INITIAL_MOCK_TICKETS: QueueTicket[] = [
  { id: "1", tokenId: "A102", customerName: "Sarah Jenkins", serviceType: "Deposit", priority: "Normal", channel: "Walk-in", status: "Waiting", createdAt: new Date(Date.now() - 1000 * 60 * 3) },
  { id: "2", tokenId: "B045", customerName: "Robert Chen", serviceType: "Consultation", priority: "Elderly", channel: "Web Booking", status: "Serving", counterName: "Counter 3", operatorName: "Sophia Lee", createdAt: new Date(Date.now() - 1000 * 60 * 25), calledAt: new Date(Date.now() - 1000 * 60 * 5) },
  { id: "3", tokenId: "C012", customerName: "Maria Garcia", serviceType: "Complaint", priority: "Emergency", channel: "Walk-in", status: "Called", counterName: "Counter 1", operatorName: "Marcus Brody", createdAt: new Date(Date.now() - 1000 * 60 * 12), calledAt: new Date(Date.now() - 1000 * 60 * 1) },
  { id: "4", tokenId: "A101", customerName: "James Wilson", serviceType: "Withdrawal", priority: "VIP", channel: "Mobile App", status: "Completed", counterName: "Counter 2", operatorName: "Elena Rostova", createdAt: new Date(Date.now() - 1000 * 60 * 45), calledAt: new Date(Date.now() - 1000 * 60 * 30) },
  { id: "5", tokenId: "D088", customerName: "Emily Davis", serviceType: "Loan Setup", priority: "Pregnant", channel: "Kiosk", status: "Waiting", createdAt: new Date(Date.now() - 1000 * 60 * 7) },
  { id: "6", tokenId: "A100", customerName: "Michael Brown", serviceType: "Deposit", priority: "Disabled", channel: "Walk-in", status: "No-show", counterName: "Counter 3", operatorName: "Sophia Lee", createdAt: new Date(Date.now() - 1000 * 60 * 60), calledAt: new Date(Date.now() - 1000 * 60 * 40) },
  { id: "7", tokenId: "B046", customerName: "Lisa Wong", serviceType: "Consultation", priority: "Normal", channel: "Web Booking", status: "Waiting", createdAt: new Date(Date.now() - 1000 * 60 * 16) },
  { id: "8", tokenId: "C013", customerName: "David Miller", serviceType: "Complaint", priority: "Normal", channel: "Mobile App", status: "Waiting", createdAt: new Date(Date.now() - 1000 * 60 * 2) },
  { id: "9", tokenId: "B047", customerName: "Anna Kowalski", serviceType: "Consultation", priority: "Normal", channel: "Kiosk", status: "Waiting", createdAt: new Date(Date.now()) },
  { id: "10", tokenId: "D089", customerName: "John Smith", serviceType: "Loan Setup", priority: "Normal", channel: "Walk-in", status: "Waiting", createdAt: new Date(Date.now() - 1000 * 60 * 18) },
];

function WaitTimer({ createdAt, calledAt, status }: { createdAt: Date, calledAt?: Date, status: TicketStatus }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (status === "Completed" || status === "No-show" || status === "Cancelled" || status === "Skipped" || status === "Transferred") {
      setElapsed(calledAt ? calledAt.getTime() - createdAt.getTime() : Date.now() - createdAt.getTime());
      return;
    }

    const startTime = (status === "Called" || status === "Serving") && calledAt ? calledAt.getTime() : createdAt.getTime();
    
    // Update immediately
    setElapsed(Date.now() - startTime);

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt, calledAt, status]);

  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  
  const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  let colorClass = "text-emerald-500";
  if (status !== "Completed" && status !== "No-show" && status !== "Cancelled" && status !== "Skipped" && status !== "Transferred") {
    if (minutes >= 15) colorClass = "text-red-600 font-bold";
    else if (minutes >= 10) colorClass = "text-orange-500 font-bold";
    else if (minutes >= 5) colorClass = "text-amber-500 font-bold";
    else colorClass = "text-emerald-500 font-bold";
  } else {
    colorClass = "text-slate-500";
  }

  return <span className={`font-mono font-bold text-sm ${colorClass}`}>{formatted}</span>;
}

export default function QueueTickets() {
  const [tickets, setTickets] = useState<QueueTicket[]>(INITIAL_MOCK_TICKETS);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [channelFilter, setChannelFilter] = useState<string>("All");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>("All");
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: keyof QueueTicket | "waitTimer"; direction: "asc" | "desc" }>({ key: "createdAt", direction: "desc" });

  // Column visibility state
  const ALL_COLUMNS = ["Token ID", "Customer", "Service Type", "Priority", "Channel", "Status", "Counter / Agent", "Created", "Called At", "Wait Timer", "Action"];
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(ALL_COLUMNS));

  // Selection state
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // UI state
  const [isNewTokenModalOpen, setIsNewTokenModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<string | null>(null);

  // Filter dropdown visibility
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);

  // Simulate live incoming tickets
  useEffect(() => {
    const interval = setInterval(() => {
      const newId = Math.random().toString(36).substring(7);
      const types = ["Deposit", "Withdrawal", "Consultation", "Loan Setup", "Complaint"];
      const newTicket: QueueTicket = {
        id: newId,
        tokenId: `E${Math.floor(Math.random() * 900) + 100}`,
        customerName: ["John Doe", "Jane Smith", "Alice Jones", "Bob Builder"][Math.floor(Math.random() * 4)],
        serviceType: types[Math.floor(Math.random() * types.length)],
        priority: "Normal",
        channel: "Walk-in",
        status: "Waiting",
        createdAt: new Date(),
        isNew: true
      };
      
      setTickets(prev => [newTicket, ...prev]);
      
      // Remove 'isNew' flag after animation
      setTimeout(() => {
        setTickets(prev => prev.map(t => t.id === newId ? { ...t, isNew: false } : t));
      }, 3000);
      
    }, 20000); // New ticket every 20s
    return () => clearInterval(interval);
  }, []);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.action-menu-container')) setActionMenuOpenId(null);
      if (!(e.target as Element).closest('.filter-dropdown-container')) setActiveFilterDropdown(null);
      if (!(e.target as Element).closest('.notification-container')) setIsNotificationOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handlers
  const handleSort = (key: keyof QueueTicket | "waitTimer") => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTicketIds(new Set(paginatedTickets.map(t => t.id)));
    } else {
      setSelectedTicketIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedTicketIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedTicketIds(newSelected);
  };

  const updateTicketStatus = (id: string, updates: Partial<QueueTicket>) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    setActionMenuOpenId(null);
  };

  const handleBulkAction = (action: string) => {
    setTickets(prev => prev.map(t => {
      if (selectedTicketIds.has(t.id)) {
        if (action === "cancel") return { ...t, status: "Cancelled" };
        if (action === "no-show") return { ...t, status: "No-show" };
      }
      return t;
    }));
    setSelectedTicketIds(new Set());
  };

  const handleExport = () => {
    // Generate CSV
    const headers = ["Token ID", "Customer", "Service Type", "Priority", "Channel", "Status", "Created"];
    const rows = filteredAndSortedTickets.map(t => [
      t.tokenId, t.customerName, t.serviceType, t.priority, t.channel, t.status, t.createdAt.toISOString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "queue_tickets_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Derived state
  const serviceTypes = Array.from(new Set(tickets.map(t => t.serviceType)));
  
  const waitingNow = tickets.filter(t => t.status === "Waiting").length;
  const totalServed = tickets.filter(t => t.status === "Completed").length;
  const noShows = tickets.filter(t => t.status === "No-show").length;
  const scheduled = tickets.filter(t => t.channel === "Web Booking" || t.channel === "Mobile App").length;

  const filteredAndSortedTickets = useMemo(() => {
    let result = tickets.filter(t => 
      (statusFilter === "All" || t.status === statusFilter) &&
      (priorityFilter === "All" || t.priority === priorityFilter) &&
      (channelFilter === "All" || t.channel === channelFilter) &&
      (serviceTypeFilter === "All" || t.serviceType === serviceTypeFilter) &&
      (dateFilter === "All" || (
        dateFilter === "Today" ? (t.createdAt >= new Date(new Date().setHours(0,0,0,0))) :
        dateFilter === "Yesterday" ? (t.createdAt >= new Date(new Date().setDate(new Date().getDate() - 1)) && t.createdAt < new Date(new Date().setHours(0,0,0,0))) :
        dateFilter === "This Week" ? (t.createdAt >= new Date(new Date().setDate(new Date().getDate() - 7))) :
        dateFilter === "Last 30 Days" ? (t.createdAt >= new Date(new Date().setDate(new Date().getDate() - 30))) : true
      )) &&
      (
        t.tokenId.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    result.sort((a, b) => {
      let valA: any = a[sortConfig.key as keyof QueueTicket];
      let valB: any = b[sortConfig.key as keyof QueueTicket];
      
      if (sortConfig.key === "waitTimer") {
        valA = a.calledAt ? a.calledAt.getTime() - a.createdAt.getTime() : Date.now() - a.createdAt.getTime();
        valB = b.calledAt ? b.calledAt.getTime() - b.createdAt.getTime() : Date.now() - b.createdAt.getTime();
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [tickets, searchQuery, statusFilter, priorityFilter, channelFilter, serviceTypeFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedTickets.length / itemsPerPage);
  const paginatedTickets = filteredAndSortedTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return <ArrowDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === "asc" ? <ArrowUp className="w-3 h-3 text-brand-cyan" /> : <ArrowDown className="w-3 h-3 text-brand-cyan" />;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div className="text-[13px] font-medium text-slate-500 font-space tracking-wide">
          Dashboard <span className="mx-2 text-slate-300">/</span> <span className="text-slate-900 font-bold">Queue Tickets</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2 mr-2">
             <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 z-30 shadow-sm">ML</div>
             <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 z-20 shadow-sm">SJ</div>
             <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-cream flex items-center justify-center text-xs font-bold text-brand-navy z-10 shadow-sm">+3</div>
          </div>
          
          <div className="relative notification-container">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors bg-white border border-slate-200 rounded-xl shadow-sm"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-slate-100 bg-slate-50 font-bold text-sm text-slate-800">Notifications</div>
                  <div className="p-4 text-sm text-slate-600 space-y-3">
                    <div className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full bg-brand-cyan mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">VIP Arrival</p>
                        <p className="text-xs text-slate-500">Token A101 (James Wilson) has arrived.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setIsNewTokenModalOpen(true)}
            className="flex items-center gap-2 bg-brand-navy hover:bg-brand-deepnavy text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_2px_10px_rgba(26,35,114,0.2)]"
          >
            <Plus className="w-4 h-4" />
            New Token
          </button>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
               <Clock className="w-5 h-5 text-brand-cyan" />
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-4xl font-bold font-outfit text-slate-900 tracking-tight">{waitingNow}</div>
             <span className="relative flex h-3 w-3 mt-1">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-cyan"></span>
             </span>
          </div>
          <div className="text-sm font-space font-medium text-slate-500 mt-1">Waiting Now</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
               <UserCheck className="w-5 h-5 text-emerald-600" />
             </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-4xl font-bold font-outfit text-slate-900 tracking-tight">{totalServed}</div>
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 mb-2 bg-emerald-50 px-2 py-0.5 rounded-full">
               <ArrowUp className="w-3 h-3" />
               +12%
            </div>
          </div>
          <div className="text-sm font-space font-medium text-slate-500 mt-1">Total Served (Today)</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
               <XCircle className="w-5 h-5 text-rose-600" />
             </div>
          </div>
          <div className="text-4xl font-bold font-outfit text-slate-900 tracking-tight">{noShows}</div>
          <div className="text-sm font-space font-medium text-amber-600 mt-1">No-Shows (Today)</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
               <LayoutTemplate className="w-5 h-5 text-slate-600" />
             </div>
          </div>
          <div className="text-4xl font-bold font-outfit text-slate-900 tracking-tight">{scheduled}</div>
          <div className="text-sm font-space font-medium text-slate-500 mt-1">Scheduled Tokens</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search token, customer, service..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative filter-dropdown-container">
            <button onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'status' ? null : 'status')} className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              Status: {statusFilter} <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {activeFilterDropdown === 'status' && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                {["All", ...Object.keys(STATUS_CONFIG)].map(status => (
                  <button key={status} onClick={() => { setStatusFilter(status); setActiveFilterDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Priority Filter */}
          <div className="relative filter-dropdown-container">
            <button onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'priority' ? null : 'priority')} className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              Priority: {priorityFilter} <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {activeFilterDropdown === 'priority' && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                {["All", ...Object.keys(PRIORITY_CONFIG)].map(p => (
                  <button key={p} onClick={() => { setPriorityFilter(p); setActiveFilterDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Channel Filter */}
          <div className="hidden sm:block relative filter-dropdown-container">
            <button onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'channel' ? null : 'channel')} className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              Channel: {channelFilter} <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {activeFilterDropdown === 'channel' && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                {["All", ...Object.keys(CHANNEL_CONFIG)].map(c => (
                  <button key={c} onClick={() => { setChannelFilter(c); setActiveFilterDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Service Type Filter */}
          <div className="hidden lg:block relative filter-dropdown-container">
            <button onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'service' ? null : 'service')} className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              Service: {serviceTypeFilter} <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {activeFilterDropdown === 'service' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                {["All", ...serviceTypes].map(s => (
                  <button key={s} onClick={() => { setServiceTypeFilter(s); setActiveFilterDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="hidden xl:block relative filter-dropdown-container">
            <button onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'date' ? null : 'date')} className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {dateFilter === "All" ? "Date Range" : dateFilter} <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {activeFilterDropdown === 'date' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-2 px-3">
                <div className="text-xs font-bold text-slate-400 mb-2 uppercase">Filter by Date</div>
                
                <button onClick={() => { setDateFilter("All"); setActiveFilterDropdown(null); }} className="w-full text-left py-1 text-sm text-slate-700 hover:text-brand-cyan">All Time</button>
                <button onClick={() => { setDateFilter("Today"); setActiveFilterDropdown(null); }} className="w-full text-left py-1 text-sm text-slate-700 hover:text-brand-cyan">Today</button>
                <button onClick={() => { setDateFilter("Yesterday"); setActiveFilterDropdown(null); }} className="w-full text-left py-1 text-sm text-slate-700 hover:text-brand-cyan">Yesterday</button>
                <button onClick={() => { setDateFilter("This Week"); setActiveFilterDropdown(null); }} className="w-full text-left py-1 text-sm text-slate-700 hover:text-brand-cyan">This Week</button>
                <button onClick={() => { setDateFilter("Last 30 Days"); setActiveFilterDropdown(null); }} className="w-full text-left py-1 text-sm text-slate-700 hover:text-brand-cyan">Last 30 Days</button>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="hidden xl:block relative filter-dropdown-container">
            <button onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'sort' ? null : 'sort')} className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              Sort <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400 rotate-90" />
            </button>
            {activeFilterDropdown === 'sort' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                {ALL_COLUMNS.filter(c => c !== "Action" && c !== "Counter / Agent" && c !== "Called At").map(col => (
                  <button key={col} onClick={() => { handleSort(col === "Token ID" ? "tokenId" : col === "Customer" ? "customerName" : col === "Service Type" ? "serviceType" : col === "Priority" ? "priority" : col === "Channel" ? "channel" : col === "Status" ? "status" : col === "Created" ? "createdAt" : "waitTimer"); setActiveFilterDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    {col}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
        
        <div className="flex items-center gap-2">
           <div className="relative filter-dropdown-container">
             <button onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'columns' ? null : 'columns')} className="p-2.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl shadow-sm transition-colors">
               <Columns className="w-4 h-4" />
             </button>
             {activeFilterDropdown === 'columns' && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-2 px-3">
                <div className="text-xs font-bold text-slate-400 mb-2 uppercase">Visible Columns</div>
                {ALL_COLUMNS.map(col => (
                  <label key={col} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={visibleColumns.has(col)}
                      onChange={(e) => {
                        const newCols = new Set(visibleColumns);
                        if (e.target.checked) newCols.add(col);
                        else newCols.delete(col);
                        setVisibleColumns(newCols);
                      }}
                      className="rounded border-slate-300 text-brand-cyan focus:ring-brand-cyan"
                    />
                    <span className="text-sm text-slate-700">{col}</span>
                  </label>
                ))}
              </div>
            )}
           </div>

           <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             <Download className="w-4 h-4 text-slate-400" /> Export
           </button>

           <div className="relative filter-dropdown-container">
            <button 
              disabled={selectedTicketIds.size === 0}
              onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'bulk' ? null : 'bulk')} 
              className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              Bulk Action ({selectedTicketIds.size}) <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {activeFilterDropdown === 'bulk' && selectedTicketIds.size > 0 && (
              <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                <button onClick={() => { handleBulkAction('no-show'); setActiveFilterDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Mark No-show</button>
                <button onClick={() => { handleBulkAction('cancel'); setActiveFilterDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Cancel Selected</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200">
                <th className="px-4 py-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={paginatedTickets.length > 0 && selectedTicketIds.size === paginatedTickets.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-brand-cyan focus:ring-brand-cyan cursor-pointer"
                  />
                </th>
                {visibleColumns.has("Token ID") && (
                  <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space cursor-pointer group" onClick={() => handleSort("tokenId")}>
                    <div className="flex items-center gap-1">Token ID <SortIcon columnKey="tokenId" /></div>
                  </th>
                )}
                {visibleColumns.has("Customer") && (
                  <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space cursor-pointer group" onClick={() => handleSort("customerName")}>
                    <div className="flex items-center gap-1">Customer <SortIcon columnKey="customerName" /></div>
                  </th>
                )}
                {visibleColumns.has("Service Type") && (
                  <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space cursor-pointer group" onClick={() => handleSort("serviceType")}>
                    <div className="flex items-center gap-1">Service Type <SortIcon columnKey="serviceType" /></div>
                  </th>
                )}
                {visibleColumns.has("Priority") && (
                  <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space cursor-pointer group" onClick={() => handleSort("priority")}>
                    <div className="flex items-center gap-1">Priority <SortIcon columnKey="priority" /></div>
                  </th>
                )}
                {visibleColumns.has("Channel") && (
                  <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space cursor-pointer group" onClick={() => handleSort("channel")}>
                    <div className="flex items-center gap-1">Channel <SortIcon columnKey="channel" /></div>
                  </th>
                )}
                {visibleColumns.has("Status") && (
                  <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space cursor-pointer group" onClick={() => handleSort("status")}>
                    <div className="flex items-center gap-1">Status <SortIcon columnKey="status" /></div>
                  </th>
                )}
                {visibleColumns.has("Counter / Agent") && (
                  <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space">Counter / Agent</th>
                )}
                {visibleColumns.has("Created") && (
                  <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space cursor-pointer group" onClick={() => handleSort("createdAt")}>
                    <div className="flex items-center gap-1">Created <SortIcon columnKey="createdAt" /></div>
                  </th>
                )}
                {visibleColumns.has("Called At") && (
                  <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space">Called At</th>
                )}
                {visibleColumns.has("Wait Timer") && (
                  <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space cursor-pointer group" onClick={() => handleSort("waitTimer")}>
                    <div className="flex items-center gap-1">Wait Timer <SortIcon columnKey="waitTimer" /></div>
                  </th>
                )}
                {visibleColumns.has("Action") && (
                  <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {paginatedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.size + 1} className="px-6 py-16 text-center">
                       <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-4 border border-slate-100">
                         <Clock className="w-5 h-5 text-slate-400" />
                       </div>
                       <h3 className="text-sm font-bold text-slate-900 mb-1 font-outfit text-base">No tickets found</h3>
                       <p className="text-[13px] text-slate-500">There are no tickets matching your current view.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((ticket) => {
                    const PriorityIcon = PRIORITY_CONFIG[ticket.priority].icon;
                    const StatusIcon = STATUS_CONFIG[ticket.status].icon;
                    const ChannelIcon = CHANNEL_CONFIG[ticket.channel].icon;
  
                    return (
                      <motion.tr 
                        key={ticket.id}
                        initial={ticket.isNew ? { backgroundColor: "#e0f2fe", y: -10 } : { opacity: 0, y: 10 }}
                        animate={{ backgroundColor: "#ffffff", opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                        className="hover:bg-slate-50/60 transition-colors group relative"
                      >
                        <td className="px-4 py-4">
                          <input 
                            type="checkbox" 
                            checked={selectedTicketIds.has(ticket.id)}
                            onChange={() => handleSelectRow(ticket.id)}
                            className="rounded border-slate-300 text-brand-cyan focus:ring-brand-cyan cursor-pointer"
                          />
                        </td>
                        {/* Token ID */}
                        {visibleColumns.has("Token ID") && (
                          <td className="px-4 py-4">
                            <span className="font-mono font-bold text-brand-navy text-[15px]">{ticket.tokenId}</span>
                          </td>
                        )}
  
                        {/* Customer */}
                        {visibleColumns.has("Customer") && (
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-navy/5 border border-brand-navy/10 flex items-center justify-center text-[11px] font-bold text-brand-navy shrink-0">
                                {ticket.customerName.charAt(0)}
                              </div>
                              <span className="text-[13px] font-bold text-slate-800">{ticket.customerName}</span>
                            </div>
                          </td>
                        )}
  
                        {/* Service Type */}
                        {visibleColumns.has("Service Type") && (
                          <td className="px-4 py-4">
                            <span className="text-[13px] font-medium text-slate-600">{ticket.serviceType}</span>
                          </td>
                        )}
  
                        {/* Priority */}
                        {visibleColumns.has("Priority") && (
                          <td className="px-4 py-4">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${PRIORITY_CONFIG[ticket.priority].color}`}>
                              <PriorityIcon className="w-3.5 h-3.5" />
                              {ticket.priority}
                            </div>
                          </td>
                        )}
  
                        {/* Channel */}
                        {visibleColumns.has("Channel") && (
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-slate-500">
                              <ChannelIcon className="w-4 h-4" />
                              <span className="text-[13px] font-medium">{CHANNEL_CONFIG[ticket.channel].label}</span>
                            </div>
                          </td>
                        )}
  
                        {/* Status */}
                        {visibleColumns.has("Status") && (
                          <td className="px-4 py-4">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_CONFIG[ticket.status].color}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {ticket.status}
                            </div>
                          </td>
                        )}
  
                        {/* Counter / Agent */}
                        {visibleColumns.has("Counter / Agent") && (
                          <td className="px-4 py-4">
                            {ticket.counterName ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-brand-cream text-brand-navy flex items-center justify-center text-[9px] font-bold shrink-0">
                                  {ticket.operatorName?.charAt(0) || "C"}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[12px] font-bold text-slate-800">{ticket.counterName}</span>
                                  <span className="text-[11px] font-medium text-slate-500">{ticket.operatorName}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-slate-400">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                  <Circle className="w-3 h-3 text-slate-300" />
                                </div>
                                <span className="text-[12px] italic">Unassigned</span>
                              </div>
                            )}
                          </td>
                        )}

                        {/* Created */}
                        {visibleColumns.has("Created") && (
                          <td className="px-4 py-4">
                            <span className="font-mono text-[12px] text-slate-600">
                              {ticket.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                        )}

                        {/* Called At */}
                        {visibleColumns.has("Called At") && (
                          <td className="px-4 py-4">
                            <span className="font-mono text-[12px] text-slate-600">
                              {ticket.calledAt ? ticket.calledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                            </span>
                          </td>
                        )}
  
                        {/* Wait Timer */}
                        {visibleColumns.has("Wait Timer") && (
                          <td className="px-4 py-4">
                            <WaitTimer createdAt={ticket.createdAt} calledAt={ticket.calledAt} status={ticket.status} />
                          </td>
                        )}
  
                        {/* Action */}
                        {visibleColumns.has("Action") && (
                          <td className="px-4 py-4 text-right">
                            <div className="relative inline-block text-left action-menu-container">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActionMenuOpenId(actionMenuOpenId === ticket.id ? null : ticket.id);
                                }}
                                className="p-1.5 text-slate-400 hover:text-brand-navy hover:bg-slate-100 rounded-lg transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              <AnimatePresence>
                                {actionMenuOpenId === ticket.id && (
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                                  >
                                    <div className="py-1">
                                      {ticket.status === "Waiting" && (
                                        <button onClick={() => updateTicketStatus(ticket.id, { status: "Called", calledAt: new Date() })} className="w-full text-left px-4 py-2 text-sm text-brand-navy hover:bg-slate-50 font-bold">
                                          Call Next
                                        </button>
                                      )}
                                      {(ticket.status === "Waiting" || ticket.status === "Called" || ticket.status === "Serving") && (
                                        <>
                                          <button onClick={() => { setIsTransferModalOpen(ticket.id); setActionMenuOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                            Transfer...
                                          </button>
                                          <button onClick={() => updateTicketStatus(ticket.id, { status: "No-show" })} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                            Mark No-show
                                          </button>
                                        </>
                                      )}
                                      {ticket.status !== "Cancelled" && (
                                        <button onClick={() => { setIsCancelModalOpen(ticket.id); setActionMenuOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                          Cancel
                                        </button>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 gap-4">
          <p className="text-[13px] text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + (filteredAndSortedTickets.length > 0 ? 1 : 0)}</span>–<span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredAndSortedTickets.length)}</span> of <span className="font-bold text-slate-900">{filteredAndSortedTickets.length}</span>
          </p>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               <span className="text-[13px] text-slate-500 font-medium">Rows per page:</span>
               <div className="relative">
                 <select 
                   value={itemsPerPage}
                   onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                   className="bg-white border border-slate-200 text-[13px] font-bold text-slate-700 py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:border-brand-cyan appearance-none shadow-sm cursor-pointer"
                 >
                   <option value={5}>5</option>
                   <option value={10}>10</option>
                   <option value={25}>25</option>
                   <option value={50}>50</option>
                 </select>
                 <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
               </div>
             </div>
             <div className="flex gap-1.5">
               <button 
                 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                 disabled={currentPage === 1}
                 className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors shadow-sm"
               >
                 <ChevronLeft className="w-4 h-4" />
               </button>
               <button 
                 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                 disabled={currentPage >= totalPages || totalPages === 0}
                 className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors shadow-sm"
               >
                 <ChevronRight className="w-4 h-4" />
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isNewTokenModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold font-rethink text-slate-900">Issue New Token</h3>
                <button onClick={() => setIsNewTokenModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newTicket: QueueTicket = {
                    id: Math.random().toString(36).substring(7),
                    tokenId: formData.get("tokenId") as string,
                    customerName: formData.get("customerName") as string,
                    serviceType: formData.get("serviceType") as string,
                    priority: formData.get("priority") as PriorityTier,
                    channel: formData.get("channel") as Channel,
                    status: "Waiting",
                    createdAt: new Date(),
                    isNew: true
                  };
                  setTickets(prev => [newTicket, ...prev]);
                  setIsNewTokenModalOpen(false);
                  
                  setTimeout(() => {
                    setTickets(prev => prev.map(t => t.id === newTicket.id ? { ...t, isNew: false } : t));
                  }, 3000);
                }} 
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Customer Name</label>
                  <input required name="customerName" type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-navy" placeholder="e.g. John Doe" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Token ID</label>
                    <input required name="tokenId" type="text" defaultValue={`M${Math.floor(Math.random() * 900) + 100}`} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-navy font-mono font-bold text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Service Type</label>
                    <select name="serviceType" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-navy bg-white">
                      {["Deposit", "Withdrawal", "Consultation", "Loan Setup", "Complaint"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Priority</label>
                    <select name="priority" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-navy bg-white">
                      {Object.keys(PRIORITY_CONFIG).map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Channel</label>
                    <select name="channel" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-navy bg-white">
                      <option value="Walk-in">Walk-in</option>
                      <option value="Kiosk">Kiosk</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsNewTokenModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-brand-navy hover:bg-brand-deepnavy text-white text-sm font-bold rounded-xl transition-colors shadow-md">Issue Token</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isTransferModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4">Transfer Token</h3>
              <p className="text-sm text-slate-500 mb-4">Select a new counter or department to transfer this token to.</p>
              <select id="transfer-select" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-navy bg-white mb-6">
                <option>Counter 1 (Marcus Brody)</option>
                <option>Counter 2 (Elena Rostova)</option>
                <option>Counter 3 (Sophia Lee)</option>
                <option>General Queue (Unassigned)</option>
              </select>
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsTransferModalOpen(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button onClick={() => {
                  const val = (document.getElementById('transfer-select') as HTMLSelectElement).value;
                  const isUnassigned = val.includes("Unassigned");
                  updateTicketStatus(isTransferModalOpen, { 
                    status: "Transferred", 
                    counterName: isUnassigned ? undefined : val.split(" (")[0],
                    operatorName: isUnassigned ? undefined : val.split("(")[1].replace(")", "")
                  });
                  setIsTransferModalOpen(null);
                }} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-md">Transfer</button>
              </div>
            </motion.div>
          </div>
        )}

        {isCancelModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 border-t-4 border-red-500"
            >
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-bold text-slate-900">Cancel Token?</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6 mt-2">Are you sure you want to cancel this token? This action cannot be undone.</p>
              
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsCancelModalOpen(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Keep Token</button>
                <button onClick={() => {
                  updateTicketStatus(isCancelModalOpen, { status: "Cancelled" });
                  setIsCancelModalOpen(null);
                }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md">Cancel Token</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
