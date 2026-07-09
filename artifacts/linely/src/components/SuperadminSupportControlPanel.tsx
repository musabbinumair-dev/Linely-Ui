import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  X,
  Check,
  Plus,
  Download,
  RefreshCw,
  AlertTriangle,
  Trash2,
  CheckCircle,
  Eye,
  Shield,
  Clock,
  User,
  Users,
  Mail,
  Calendar,
  Building,
  Lock,
  MessageSquare,
  Send,
  UserX,
  History,
  XCircle,
  Copy,
  Info,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  CornerDownRight,
  Sparkles,
  Bookmark
} from "lucide-react";

// Types
export interface TicketMessage {
  id: string;
  sender: "Tenant" | "Support Agent" | "Superadmin";
  senderName: string;
  avatarUrl?: string;
  message: string;
  timestamp: string;
  isInternal: boolean;
}

export interface SupportTicket {
  id: string;
  tenantId: string;
  tenantName: string;
  subject: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Pending" | "Overdue" | "Resolved";
  assignee: string;
  requesterName: string;
  requesterEmail: string;
  createdAt: string; // ISO format or pretty
  updatedAt: string; // ISO format or pretty
  category: "Billing" | "Configuration" | "Infrastructure" | "Hardware Integration";
  slaDue: string; // relative
  internalNotes: string;
  thread: TicketMessage[];
}

// Mock Initial Tickets
const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "TKT-9102",
    tenantId: "ten-004",
    tenantName: "Wayne Enterprises",
    subject: "Websocket disconnected on branch 4 main TV display",
    description: "The live queue display terminal at our Gotham Plaza branch frequently drops WebSocket connection. It flashes 'Trying to reconnect' every 10 minutes. Network bandwidth logs look stable.",
    priority: "Critical",
    status: "Open",
    assignee: "Sarah Connor",
    requesterName: "Lucius Fox",
    requesterEmail: "l.fox@wayne.corp",
    createdAt: "2026-07-08 02:15",
    updatedAt: "2026-07-08 05:10",
    category: "Infrastructure",
    slaDue: "Overdue by 15 mins",
    internalNotes: "Suspect standard timeout configuration on Nginx proxy container. Needs custom keep-alive parameters.",
    thread: [
      {
        id: "msg-101",
        sender: "Tenant",
        senderName: "Lucius Fox",
        message: "Hello Superadmin. We are experiencing high-frequency screen blinking on our active operator lobby queue screen. This is halting walk-in registrations.",
        timestamp: "2026-07-08 02:15",
        isInternal: false
      },
      {
        id: "msg-102",
        sender: "Support Agent",
        senderName: "Sarah Connor",
        message: "Lucius, I'm checking the live connection pool logs. I see the socket connection being closed by host peer with code 1006. Let me provision a bypass port.",
        timestamp: "2026-07-08 03:40",
        isInternal: false
      }
    ]
  },
  {
    id: "TKT-8441",
    tenantId: "ten-001",
    tenantName: "Acme Corporation",
    subject: "API requests throttling at peak queue volume",
    description: "Our automated barcode scanner microservice is hitting HTTP 429 Rate Limit error during peak hours (14:00 - 16:00 UTC). We require an immediate platform limit override.",
    priority: "High",
    status: "Open",
    assignee: "Sarah Connor",
    requesterName: "Wile E. Coyote",
    requesterEmail: "coyote@acme.com",
    createdAt: "2026-07-07 14:32",
    updatedAt: "2026-07-08 04:50",
    category: "Configuration",
    slaDue: "Due in 1h 45m",
    internalNotes: "Acme is on Premium Enterprise tier. Their limit is currently set to standard 100 req/min. We should scale this specific route to 500 req/min.",
    thread: [
      {
        id: "msg-201",
        sender: "Tenant",
        senderName: "Wile E. Coyote",
        message: "We are integration-testing the new smart conveyor gate. Whenever 50 users register at once, the API rejects with 429. This is critical for our QMS launch tomorrow.",
        timestamp: "2026-07-07 14:32",
        isInternal: false
      }
    ]
  },
  {
    id: "TKT-7033",
    tenantId: "ten-002",
    tenantName: "Stark Industries",
    subject: "Invoice billing discrepancy on customized operator seats",
    description: "We were charged for 15 operator seats but we only have 10 active check-in counters provisioned. Can we reconcile the bill before the cycle autopays?",
    priority: "Medium",
    status: "Pending",
    assignee: "John Connor",
    requesterName: "Pepper Potts",
    requesterEmail: "p.potts@stark.com",
    createdAt: "2026-07-07 09:12",
    updatedAt: "2026-07-07 16:30",
    category: "Billing",
    slaDue: "Due in 4h 10m",
    internalNotes: "Confirmed 5 counters were deleted on June 28th. Discrepancy is valid. Refunding $150 credit on Stark Stripe profile.",
    thread: [
      {
        id: "msg-301",
        sender: "Tenant",
        senderName: "Pepper Potts",
        message: "Our accounting team noted a discrepancy on the invoice dated July 1st. Please recalculate seats dynamically.",
        timestamp: "2026-07-07 09:12",
        isInternal: false
      },
      {
        id: "msg-302",
        sender: "Support Agent",
        senderName: "John Connor",
        message: "Hi Pepper, analyzing. I see the 5 counters were active for 28 days of the billing cycle, which triggers a pro-rated charge. I'll ask billing team for an administrative waiver.",
        timestamp: "2026-07-07 16:30",
        isInternal: false
      }
    ]
  },
  {
    id: "TKT-5120",
    tenantId: "ten-003",
    tenantName: "Initech LLC",
    subject: "Operator rating CSV export encoding glitch on legacy Windows client",
    description: "When downloading the QMS compliance report, the special characters in the operators names are garbled (e.g., 'Renée' shows as 'RenÃ©e'). Customer uses old Windows Excel format.",
    priority: "Low",
    status: "Resolved",
    assignee: "Unassigned",
    requesterName: "Peter Gibbons",
    requesterEmail: "peter.gibbons@initech.com",
    createdAt: "2026-07-06 10:00",
    updatedAt: "2026-07-06 16:00",
    category: "Hardware Integration",
    slaDue: "Resolved",
    internalNotes: "Changed download header encoding to UTF-8 with BOM bytes. Verified legacy Excel parsing is now correct.",
    thread: [
      {
        id: "msg-401",
        sender: "Tenant",
        senderName: "Peter Gibbons",
        message: "Excel is displaying weird text characters in operator ratings exports. It makes compliance filings painful.",
        timestamp: "2026-07-06 10:00",
        isInternal: false
      },
      {
        id: "msg-402",
        sender: "Support Agent",
        senderName: "Sarah Connor",
        message: "Hi Peter, we just deployed a server patch injecting UTF-8 BOM headers. Please download the file again, it should render René and other names perfectly.",
        timestamp: "2026-07-06 15:45",
        isInternal: false
      },
      {
        id: "msg-403",
        sender: "Tenant",
        senderName: "Peter Gibbons",
        message: "Tested and confirmed resolved. Thanks for the quick turn!",
        timestamp: "2026-07-06 16:00",
        isInternal: false
      }
    ]
  },
  {
    id: "TKT-3112",
    tenantId: "ten-005",
    tenantName: "Hooli",
    subject: "SLA Warning: SMS delivery lag detected in India nodes",
    description: "The global webhook queue for SMS alerts is reporting a delivery latency spike of 4.5 seconds for mobile operators in New Delhi. Standard SLA requires delivery under 2.0s.",
    priority: "High",
    status: "Overdue",
    assignee: "Sarah Connor",
    requesterName: "Richard Hendricks",
    requesterEmail: "richard@piedpiper.io",
    createdAt: "2026-07-05 11:20",
    updatedAt: "2026-07-08 01:10",
    category: "Infrastructure",
    slaDue: "Overdue by 2h 30m",
    internalNotes: "Temporary carrier congestion at national gateway. Routing SMS notifications through secondary Twilio API cluster.",
    thread: [
      {
        id: "msg-501",
        sender: "Tenant",
        senderName: "Richard Hendricks",
        message: "Our customers are complaining they receive queue codes after they have already left the counter. Delivery is extremely slow.",
        timestamp: "2026-07-05 11:20",
        isInternal: false
      }
    ]
  }
];

interface SuperadminSupportControlPanelProps {
  tenants: any[];
  addAuditLog: (action: string, target: string, severity: "Info" | "Warning" | "Critical") => void;
  triggerToast: (message: string, type: "success" | "info" | "warning" | "error") => void;
}

export default function SuperadminSupportControlPanel({
  tenants,
  addAuditLog,
  triggerToast
}: SuperadminSupportControlPanelProps) {
  // Developer states to toggle various display scenarios
  const [isSimulatingLoading, setIsSimulatingLoading] = useState(false);
  const [isSimulatingError, setIsSimulatingError] = useState(false);
  const [isSimulatingEmpty, setIsSimulatingEmpty] = useState(false);
  const [isSimulatingDenied, setIsSimulatingDenied] = useState(false);

  // Core Data State
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [dateRangeFilter, setDateRangeFilter] = useState("All");

  // Selection/Drawer State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Detail Drawer Interactive Work State
  const [newReplyMessage, setNewReplyMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [internalNoteText, setInternalNoteText] = useState("");

  // Creation State (Simple Modal)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    tenantId: "",
    subject: "",
    description: "",
    priority: "Medium" as SupportTicket["priority"],
    assignee: "Sarah Connor",
    requesterName: "",
    requesterEmail: "",
    category: "Configuration" as SupportTicket["category"]
  });

  // Calculate Metrics based on active state (or empty state)
  const stats = useMemo(() => {
    if (isSimulatingEmpty) {
      return { open: 0, pending: 0, overdue: 0, resolved: 0 };
    }
    const open = tickets.filter(t => t.status === "Open").length;
    const pending = tickets.filter(t => t.status === "Pending").length;
    const overdue = tickets.filter(t => t.status === "Overdue" || t.slaDue.includes("Overdue")).length;
    const resolved = tickets.filter(t => t.status === "Resolved").length;
    return { open, pending, overdue, resolved };
  }, [tickets, isSimulatingEmpty]);

  // Filtering Logic
  const filteredTickets = useMemo(() => {
    if (isSimulatingEmpty) return [];

    return tickets.filter(t => {
      // Search Box (Matches subject, ticket ID, tenant name, requester email)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = q === "" ||
        t.id.toLowerCase().includes(q) ||
        t.tenantName.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.requesterEmail.toLowerCase().includes(q) ||
        t.requesterName.toLowerCase().includes(q);

      // Status
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;

      // Priority
      const matchesPriority = priorityFilter === "All" || t.priority === priorityFilter;

      // Assignee
      const matchesAssignee = assigneeFilter === "All" ||
        (assigneeFilter === "Unassigned" && t.assignee === "Unassigned") ||
        (assigneeFilter === "Me" && t.assignee === "Sarah Connor") ||
        t.assignee === assigneeFilter;

      // Date Range (Mock)
      let matchesDate = true;
      if (dateRangeFilter !== "All") {
        if (dateRangeFilter === "Today") {
          matchesDate = t.createdAt.includes("2026-07-08") || t.createdAt.includes("Just now");
        } else if (dateRangeFilter === "Last 7 Days") {
          matchesDate = true; // all in our mock
        }
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesDate;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, assigneeFilter, dateRangeFilter, isSimulatingEmpty]);

  // Action: Select single ticket & load details
  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setInternalNoteText(ticket.internalNotes || "");
    setIsDrawerOpen(true);
  };

  // Action: Add new reply/comment to conversational thread
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newReplyMessage.trim()) return;

    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: "Superadmin",
      senderName: "Sarah Connor (Superadmin)",
      message: newReplyMessage.trim(),
      timestamp: "Just now",
      isInternal: isInternalNote
    };

    // If it is an internal note, write to internal notes instead of public thread
    let updatedTicket = { ...selectedTicket };
    if (isInternalNote) {
      const formattedNote = `[Note - Just now] ${newReplyMessage.trim()}\n${selectedTicket.internalNotes || ""}`;
      updatedTicket.internalNotes = formattedNote;
      setInternalNoteText(formattedNote);
      addAuditLog(`Added internal compliance log note to ticket ${selectedTicket.id}`, selectedTicket.tenantName, "Info");
      triggerToast("Internal compliance note saved.", "success");
    } else {
      updatedTicket.thread = [...selectedTicket.thread, newMsg];
      updatedTicket.updatedAt = "Just now";
      // Change status to pending since support replied
      updatedTicket.status = "Pending";
      addAuditLog(`Dispatched official support response email to ${selectedTicket.requesterEmail}`, selectedTicket.id, "Info");
      triggerToast(`Response email transmitted to ${selectedTicket.requesterName}.`, "success");
    }

    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
    setNewReplyMessage("");
  };

  // Action: Update internal notes directly
  const handleUpdateNotes = () => {
    if (!selectedTicket) return;
    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicket.id) {
        return { ...t, internalNotes: internalNoteText };
      }
      return t;
    }));
    setSelectedTicket(prev => prev ? { ...prev, internalNotes: internalNoteText } : null);
    addAuditLog(`Superadmin updated internal notes for support ticket ${selectedTicket.id}`, selectedTicket.tenantName, "Info");
    triggerToast("Support notebook saved successfully.", "success");
  };

  // Action: Quick Status Updates
  const handleUpdateStatus = (ticketId: string, newStatus: SupportTicket["status"]) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: newStatus, updatedAt: "Just now" };
      }
      return t;
    }));

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus, updatedAt: "Just now" } : null);
    }

    addAuditLog(`Re-classified support ticket ${ticketId} status to ${newStatus}`, "Global Support", "Info");
    triggerToast(`Ticket status transitioned to ${newStatus}.`, "success");
  };

  // Action: Submit custom ticket creation
  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.subject || !newTicketForm.requesterEmail || !newTicketForm.description) {
      triggerToast("Please populate all required fields.", "error");
      return;
    }

    const tenantName = tenants.find(t => t.id === newTicketForm.tenantId)?.name || "External Workspace";

    const created: SupportTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: newTicketForm.tenantId || "ten-ext",
      tenantName,
      subject: newTicketForm.subject,
      description: newTicketForm.description,
      priority: newTicketForm.priority,
      status: "Open",
      assignee: newTicketForm.assignee,
      requesterName: newTicketForm.requesterName || "Anonymous Operator",
      requesterEmail: newTicketForm.requesterEmail,
      createdAt: "Just now",
      updatedAt: "Just now",
      category: newTicketForm.category,
      slaDue: "Due in 8 hours",
      internalNotes: "Manually registered superadmin support request.",
      thread: [
        {
          id: `msg-${Date.now()}`,
          sender: "Tenant",
          senderName: newTicketForm.requesterName || "Anonymous Operator",
          message: newTicketForm.description,
          timestamp: "Just now",
          isInternal: false
        }
      ]
    };

    setTickets(prev => [created, ...prev]);
    setIsCreateModalOpen(false);
    addAuditLog(`Manually created support ticket ${created.id} on behalf of tenant`, tenantName, "Info");
    triggerToast(`Ticket ${created.id} registered successfully.`, "success");

    // Clear form
    setNewTicketForm({
      tenantId: "",
      subject: "",
      description: "",
      priority: "Medium",
      assignee: "Sarah Connor",
      requesterName: "",
      requesterEmail: "",
      category: "Configuration"
    });
  };

  // Action: Export CSV
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["Ticket ID,Tenant,Subject,Priority,Status,Assignee,Updated At"].join("\n") + "\n" +
      filteredTickets.map(t => `${t.id},"${t.tenantName}","${t.subject.replace(/"/g, '""')}",${t.priority},${t.status},"${t.assignee}","${t.updatedAt}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `qms_support_tickets_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Exported support queue logs to CSV.", "success");
  };

  // Quick Action: Simulate refreshing
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast("Fetched latest real-time support queues from tenant nodes.", "success");
    }, 600);
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans" id="superadmin-support-panel-root">

      {/* DEV TOOLS SIMULATOR */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-3xs" id="dev-simulators">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wide">Developer Simulation Tools</span>
          <div className="h-4 w-px bg-slate-200 mx-1"></div>
          <span className="text-[11px] text-slate-400">Test UI states specified in the technical product brief:</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => {
              setIsSimulatingLoading(prev => !prev);
              if (!isSimulatingLoading) triggerToast("Loading state loaded.", "info");
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isSimulatingLoading ? "bg-indigo-600 text-white border-indigo-700" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {isSimulatingLoading ? "● Loading: ON" : "Loading"}
          </button>

          <button
            onClick={() => {
              setIsSimulatingError(prev => !prev);
              if (!isSimulatingError) triggerToast("Simulated VPC Database handshake failure.", "warning");
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isSimulatingError ? "bg-rose-600 text-white border-rose-700" : "bg-white text-slate-600 border-slate-200 hover:bg-rose-50"
            }`}
          >
            {isSimulatingError ? "● Error State: ON" : "Error State"}
          </button>

          <button
            onClick={() => {
              setIsSimulatingEmpty(prev => !prev);
              triggerToast(isSimulatingEmpty ? "Mock tickets restored." : "Cleared active support directory.", "info");
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isSimulatingEmpty ? "bg-slate-800 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {isSimulatingEmpty ? "● Empty Queue: ON" : "Empty State"}
          </button>

          <button
            onClick={() => {
              setIsSimulatingDenied(prev => !prev);
              triggerToast(isSimulatingDenied ? "Restored full root permissions." : "Simulated Superadmin session downgrade.", "error");
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isSimulatingDenied ? "bg-amber-600 text-white border-amber-700" : "bg-white text-slate-600 border-slate-200 hover:bg-amber-50"
            }`}
          >
            {isSimulatingDenied ? "● Perm Denied: ON" : "Permission Denied"}
          </button>
        </div>
      </div>

      {/* CORE ROUTING HANDLERS */}
      {isSimulatingDenied ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-3xs max-w-xl mx-auto my-12" id="simulated-denied-view">
          <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-outfit text-brand-navy">SECURE SCHIELD ACCESS BLOCK</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Your support credentials do not carry the required <strong className="font-mono text-xs">ROOT_BYPASS_COMPLIANCE</strong> claim to modify live merchant ticket buffers. Contact global infrastructure security to elevate.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => {
                setIsSimulatingDenied(false);
                triggerToast("Session restored with root privileges.", "success");
              }}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Acquire Admin Claims
            </button>
          </div>
        </div>
      ) : isSimulatingError ? (
        <div className="bg-white border border-rose-200 rounded-2xl p-12 text-center shadow-3xs max-w-xl mx-auto my-12" id="simulated-error-view">
          <div className="w-14 h-14 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-outfit text-rose-700">DATABASE HANDSHAKE FAILURE</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed font-medium">
            Could not retrieve active ticket clusters. Connection to Azure Active Directory server failed (Response Code <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-mono text-[11px]">504 GATEWAY_TIMEOUT</code>).
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => {
                setIsSimulatingError(false);
                triggerToast("Cleared simulated errors.", "success");
              }}
              className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Dismiss Simulation
            </button>
            <button
              onClick={handleManualRefresh}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Sync
            </button>
          </div>
        </div>
      ) : isSimulatingLoading ? (
        <div className="space-y-6" id="simulated-loading-skeleton">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-200 rounded-md animate-pulse"></div>
              <div className="h-4 w-72 bg-slate-200 rounded-md animate-pulse"></div>
            </div>
            <div className="h-9 w-32 bg-slate-200 rounded-md animate-pulse"></div>
          </div>
          {/* Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
                <div className="h-3 w-16 bg-slate-200 rounded-md animate-pulse"></div>
                <div className="h-7 w-24 bg-slate-200 rounded-md animate-pulse"></div>
              </div>
            ))}
          </div>
          {/* Table Skeleton */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="h-9 w-full bg-slate-100 rounded-md animate-pulse"></div>
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="h-12 w-full bg-slate-100/50 rounded-md animate-pulse"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6" id="real-support-page-view">
          
          {/* TITLE HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black font-outfit text-brand-navy tracking-tight">Support Tickets</h1>
                <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase">
                  Service Desk
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                Manage operational escalations, resolve configuration discrepancies, and respond to critical tenant webhooks.
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualRefresh}
                className={`h-9 w-9 bg-white border border-slate-200 text-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-all cursor-pointer shadow-3xs ${isRefreshing ? "animate-spin" : ""}`}
                title="Refresh Tickets Cache"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleExportCSV}
                className="h-9 px-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-3xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Queue</span>
              </button>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Ticket
              </button>
            </div>
          </div>

          {/* KPI ROW (FOUR CARDS) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="support-kpi-row">
            {/* KPI 1: Open Tickets */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Open Escalations</span>
                <MessageSquare className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-black text-brand-navy font-outfit leading-none tabular-nums">
                  {stats.open}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Awaiting diagnostics</p>
              </div>
            </div>

            {/* KPI 2: Pending Replies */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Pending Replies</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-black text-amber-600 font-outfit leading-none tabular-nums">
                  {stats.pending}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Staff response issued</p>
              </div>
            </div>

            {/* KPI 3: Overdue SLA */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Overdue SLA</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-black text-rose-600 font-outfit leading-none tabular-nums">
                  {stats.overdue}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Breaching contract limits</p>
              </div>
            </div>

            {/* KPI 4: Resolved Today */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Resolved Today</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-black text-emerald-600 font-outfit leading-none tabular-nums">
                  {stats.resolved}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">SLA target optimal</p>
              </div>
            </div>
          </div>

          {/* COMPACT FILTER BAR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs" id="support-filter-bar">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative md:col-span-1.5 sm:col-span-2">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search ID, subject, tenant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-xs font-semibold placeholder-slate-400 text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Status */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Assignee */}
              <div>
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="All">All Assignees</option>
                  <option value="Me">Assigned to Me</option>
                  <option value="John Connor">John Connor</option>
                  <option value="Unassigned">Unassigned</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="All">All Time</option>
                  <option value="Today">Opened Today</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs" id="support-table-container">
            {filteredTickets.length === 0 ? (
              <div className="p-12 text-center" id="no-results-state">
                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-brand-navy">No tickets found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-normal">
                  No ticket records match your filter criteria. Clear some inputs to try again.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("All");
                      setPriorityFilter("All");
                      setAssigneeFilter("All");
                      setDateRangeFilter("All");
                    }}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    Reset all filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" id="tickets-table">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono uppercase font-black text-slate-500 tracking-wider">
                      <th className="py-3 px-5 text-center w-24">ID</th>
                      <th className="py-3 px-4">Tenant Workspace</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4 text-center w-28">Priority</th>
                      <th className="py-3 px-4 text-center w-28">Status</th>
                      <th className="py-3 px-4">Assignee</th>
                      <th className="py-3 px-4 w-32">Updated</th>
                      <th className="py-3 px-5 text-right w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTickets.map((t) => (
                      <tr
                        key={t.id}
                        className="group hover:bg-slate-50/40 transition-all cursor-pointer text-xs"
                        onClick={() => handleViewTicket(t)}
                      >
                        {/* ID */}
                        <td className="py-3 px-5 font-mono text-[11px] font-bold text-slate-500 text-center">
                          <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-sm">
                            {t.id}
                          </span>
                        </td>

                        {/* Tenant */}
                        <td className="py-3 px-4 font-bold text-[#0F172A] font-outfit">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[140px]">{t.tenantName}</span>
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="py-3 px-4 max-w-[280px]">
                          <div className="font-semibold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                            {t.subject}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            Requester: {t.requesterName} ({t.requesterEmail})
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase border ${
                            t.priority === "Critical"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : t.priority === "High"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : t.priority === "Medium"
                                  ? "bg-slate-50 text-slate-600 border-slate-200"
                                  : "bg-slate-50 text-slate-400 border-slate-200"
                          }`}>
                            {t.priority}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase border ${
                            t.status === "Open"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : t.status === "Pending"
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : t.status === "Overdue"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}>
                            {t.status}
                          </span>
                        </td>

                        {/* Assignee */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-slate-600 font-semibold">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t.assignee}</span>
                          </div>
                        </td>

                        {/* Updated At */}
                        <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">
                          {t.updatedAt}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleViewTicket(t)}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Inspect Ticket Drawer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {t.status !== "Resolved" ? (
                              <button
                                onClick={() => handleUpdateStatus(t.id, "Resolved")}
                                className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                title="Mark Resolved"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(t.id, "Open")}
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-colors"
                                title="Reopen Escalation"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAILED RIGHT-SIDE CONVERSATIONAL DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && selectedTicket && (
          <div className="fixed inset-0 z-50 overflow-hidden" id="ticket-drawer-portal">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsDrawerOpen(false)}
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col h-full border-l border-slate-200"
              >
                {/* Drawer Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-600">
                      {selectedTicket.id}
                    </span>
                    <span className="h-4 w-px bg-slate-300 mx-1"></span>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedTicket.tenantName}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Drawer Contents Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Subject and Primary Details */}
                  <div className="space-y-3">
                    <h2 className="text-base font-black font-outfit text-brand-navy leading-snug">
                      {selectedTicket.subject}
                    </h2>
                    
                    {/* Status/Priority Tags Bar */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase border ${
                        selectedTicket.priority === "Critical" ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse" : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        Priority: {selectedTicket.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase border ${
                        selectedTicket.status === "Open" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        Status: {selectedTicket.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase bg-slate-100 border border-slate-200 text-slate-500">
                        Cat: {selectedTicket.category}
                      </span>
                    </div>
                  </div>

                  {/* Requester Info Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Client Requester Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Contact Person:</span>
                        <strong className="text-slate-700">{selectedTicket.requesterName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Email Destination:</span>
                        <strong className="text-slate-700 font-mono text-[11px] select-all">{selectedTicket.requesterEmail}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">SLA Response Window:</span>
                        <strong className="text-slate-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {selectedTicket.slaDue}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Active Assignee:</span>
                        <select
                          value={selectedTicket.assignee}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, assignee: val } : t));
                            setSelectedTicket(prev => prev ? { ...prev, assignee: val } : null);
                            addAuditLog(`Reassigned support ticket ${selectedTicket.id} to ${val}`, selectedTicket.tenantName, "Info");
                            triggerToast(`Assigned ticket to ${val}.`, "info");
                          }}
                          className="mt-0.5 h-6 bg-white border border-slate-200 rounded text-[11px] font-semibold text-slate-700 focus:outline-hidden"
                        >
                          <option value="Sarah Connor">Sarah Connor</option>
                          <option value="John Connor">John Connor</option>
                          <option value="Unassigned">Unassigned</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Description of Original Bug */}
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Problem Statement
                    </h4>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 leading-relaxed font-medium">
                      {selectedTicket.description}
                    </div>
                  </div>

                  {/* CONVERSATION THREAD */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Communication History ({selectedTicket.thread.length})</span>
                      <span className="text-emerald-500 flex items-center gap-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Secure SSL Tunnel
                      </span>
                    </h4>

                    <div className="space-y-4">
                      {selectedTicket.thread.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col gap-1.5 max-w-[85%] ${
                            msg.sender === "Superadmin" ? "ml-auto items-end" : "mr-auto items-start"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span className="font-bold text-slate-600">{msg.senderName}</span>
                            <span>•</span>
                            <span className="font-mono">{msg.timestamp}</span>
                          </div>
                          
                          <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-medium ${
                            msg.sender === "Superadmin"
                              ? "bg-indigo-600 text-white rounded-tr-none"
                              : "bg-slate-100 text-slate-700 rounded-tl-none"
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* INTERNAL COLLAB NOTEBOOK */}
                  <div className="space-y-2 border-t border-slate-100 pt-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Bookmark className="w-3 h-3 text-slate-400" />
                        Internal Superadmin Compliance Log Book
                      </h4>
                      <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 rounded font-bold uppercase">
                        Restricted Notes
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <textarea
                        value={internalNoteText}
                        onChange={(e) => setInternalNoteText(e.target.value)}
                        placeholder="Enter internal diagnostic notes, server port bypass variables, or compliance references..."
                        className="w-full h-20 p-3 bg-amber-50/40 border border-amber-200/60 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden placeholder-amber-400 focus:border-amber-300"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleUpdateNotes}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-black transition-colors cursor-pointer"
                        >
                          Save Log Notes
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* REPLY COMPOSER FOOTER */}
                <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3 shrink-0">
                  <form onSubmit={handleSendReply} className="space-y-3">
                    
                    {/* Toggle between customer email and internal note */}
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                        <input
                          type="radio"
                          checked={!isInternalNote}
                          onChange={() => setIsInternalNote(false)}
                          className="text-indigo-600"
                        />
                        Send Public Email Reply
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                        <input
                          type="radio"
                          checked={isInternalNote}
                          onChange={() => setIsInternalNote(true)}
                          className="text-indigo-600"
                        />
                        Prepend to Internal Notebook
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={
                          isInternalNote 
                            ? "Prepend note: e.g., 'Checked Nginx, port bypass set successfully'" 
                            : "Draft response to tenant contact person..."
                        }
                        value={newReplyMessage}
                        onChange={(e) => setNewReplyMessage(e.target.value)}
                        className="flex-1 h-10 px-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={!newReplyMessage.trim()}
                        className={`h-10 px-4 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                          newReplyMessage.trim()
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm"
                            : "bg-slate-100 text-slate-300 cursor-not-allowed"
                        }`}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>

                  {/* Drawer Bottom Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                    <div className="flex items-center gap-2">
                      {selectedTicket.status !== "Resolved" ? (
                        <button
                          onClick={() => handleUpdateStatus(selectedTicket.id, "Resolved")}
                          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Resolve Ticket
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(selectedTicket.id, "Open")}
                          className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Reopen Escalation
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
                          setIsDrawerOpen(false);
                          addAuditLog(`Permanently deleted support ticket logs ${selectedTicket.id}`, selectedTicket.tenantName, "Critical");
                          triggerToast(`Deleted support ticket ${selectedTicket.id}.`, "success");
                        }}
                        className="h-8 px-3 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        title="Delete ticket archive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                    
                    <span className="text-[10px] text-slate-400 font-mono">
                      SSL Active
                    </span>
                  </div>

                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE MANUAL TICKET MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" id="create-ticket-modal">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in text-xs">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <h3 className="font-outfit text-sm font-bold text-slate-700">Register Support Ticket</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="p-6 space-y-4">
              {/* Tenant context */}
              <div>
                <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">Target Tenant Workspace</label>
                <select
                  value={newTicketForm.tenantId}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, tenantId: e.target.value })}
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
                  required
                >
                  <option value="">Select Tenant Pool...</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Requester Profile */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">Requester Name</label>
                  <input
                    type="text"
                    placeholder="Wile E. Coyote"
                    value={newTicketForm.requesterName}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, requesterName: e.target.value })}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">Destination Email</label>
                  <input
                    type="email"
                    placeholder="coyote@acme.com"
                    value={newTicketForm.requesterEmail}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, requesterEmail: e.target.value })}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">Escalation Priority</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value as SupportTicket["priority"] })}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">Problem Category</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value as SupportTicket["category"] })}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Configuration">Configuration</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Billing">Billing</option>
                    <option value="Hardware Integration">Hardware Integration</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">Ticket Subject Line</label>
                <input
                  type="text"
                  placeholder="e.g. Rate limits exceeded during automated check-in"
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">Details of request</label>
                <textarea
                  placeholder="Provide precise network logs or step-by-step reproduction instructions..."
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  className="w-full h-24 p-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-9 px-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg transition-colors cursor-pointer"
                >
                  Create and Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
