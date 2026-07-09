import React, { useState, useMemo, useEffect, useRef } from "react";
import QueueTickets from "./QueueTickets";
import Shifts from "./Shifts";
import AuditLogs from "./AuditLogs";
import WaitingRoomTV, { DEFAULT_BRANDING } from "./WaitingRoomTV";
import Announcements from "./Announcements";
import AdminSidebar from "./AdminSidebar";
import { TVBrandingConfig } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart3, 
  Users, 
  Clock, 
  Settings, 
  Search, 
  Plus, 
  Check, 
  FileSpreadsheet, 
  Trash2, 
  Sliders, 
  MessageSquare, 
  Volume2, 
  VolumeX,
  ArrowUpRight, 
  TrendingUp, 
  Layers, 
  Laptop, 
  ShieldAlert, 
  Activity,
  Award,
  Bell,
  Calendar,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  FolderTree,
  ChevronRight,
  Maximize2,
  LayoutDashboard,
  Tv,
  GitBranch,
  UserCheck,
  Ticket,
  HelpCircle,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  LifeBuoy,
  LogOut,
  Atom,
  Cpu,
  Zap,
  ShieldCheck,
  TrendingDown,
  Edit2,
  UserPlus
} from "lucide-react";

import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";

// Types
interface Department {
  id: string;
  name: string;
  prefix: string;
  targetSla: number; // in minutes
  routeMode: "SLA-Optimized" | "Round-Robin" | "Load-Balanced";
  activeCount: number;
  tokenLimit?: number;
  overflowThreshold?: number;
  operatingHoursStart?: string;
  operatingHoursEnd?: string;
  openForScheduledBooking?: boolean;
}

interface Counter {
  id: string;
  name: string;
  departmentId: string;
  operatorName: string;
  chimeEnabled: boolean;
  status: "Active" | "Idle" | "Break";
  maxConcurrentTokens?: number;
}

interface Operator {
  id: string;
  name: string;
  role: "Junior Operator" | "Senior Operator" | "Specialist";
  departmentId: string;
  status: "Active" | "Break" | "Offline" | "Pending Invitation" | "Inactive";
  rating: number;
  email?: string;
  shift?: string;
}

interface Shift {
  id: string;
  name: string;
  timeRange: string;
  warningThreshold: number; // in minutes
  isActive: boolean;
}

interface QueueLog {
  id: string;
  ticketNumber: string;
  customerName: string;
  department: string;
  operator: string;
  waitTime: string; // MM:SS
  serviceTime: string; // MM:SS
  status: "Completed" | "No-Show" | "Skipped" | "In-Progress";
  timestamp: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: "Security" | "System" | "Settings" | "Shift";
  severity: "Info" | "Warning" | "Critical";
}

function TVPreviewContainer({ branding }: { branding: TVBrandingConfig }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25); // safe default until measured

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { width } = containerRef.current.getBoundingClientRect();
      const calculatedScale = width / 1920;
      setScale(calculatedScale);
    };

    handleResize();

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-[16/9] bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center select-none"
    >
      <div 
        style={{
          width: "1920px",
          height: "1080px",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <WaitingRoomTV 
          onGoBack={() => {}} 
          branding={branding}
          isPreviewMode={true}
        />
      </div>
    </div>
  );
}

export default function AdminDashboard({ 
  onLogout = () => {}, 
  onOpenTV = () => {}, 
  isPreviewMode = false 
}: { 
  onLogout?: () => void; 
  onOpenTV?: () => void; 
  isPreviewMode?: boolean; 
}) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("facility-overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    queues: false,
    analytics: false,
    management: false,
    history: false,
    tweaks: false,
  });
  const [isPromoDismissed, setIsPromoDismissed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Daily Summary Interactive States
  const [summaryDeptFilter, setSummaryDeptFilter] = useState<string>("All");
  const [summaryIsSyncing, setSummaryIsSyncing] = useState<boolean>(false);
  const [summaryChartMode, setSummaryChartMode] = useState<"traffic" | "service-time">("traffic");
  const [summaryNudges, setSummaryNudges] = useState<Record<string, boolean>>({});
  const [summaryDate, setSummaryDate] = useState<string>("2026-07-02");

  // Closure Calendar States
  const [closures, setClosures] = useState([
    { id: "cl1", date: "2026-07-04", reason: "Independence Day Holiday", scope: "Full Facility", affectedDept: "All" },
    { id: "cl2", date: "2026-07-15", reason: "Infrastructure Database Maintenance", scope: "Full Facility", affectedDept: "All" },
    { id: "cl3", date: "2026-07-28", reason: "Pharmacy Inventory Audit Day", scope: "Department Specific", affectedDept: "Pharmacy & Dispensary" },
  ]);
  const [newClosureDate, setNewClosureDate] = useState("2026-07-04");
  const [newClosureReason, setNewClosureReason] = useState("");
  const [newClosureScope, setNewClosureScope] = useState<"Full Facility" | "Department Specific">("Full Facility");
  const [newClosureDept, setNewClosureDept] = useState("Pharmacy & Dispensary");

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  // Mock Datasets
  const [departments, setDepartments] = useState<Department[]>([
    { id: "1", name: "Billing & Registration", prefix: "B", targetSla: 15, routeMode: "SLA-Optimized", activeCount: 14 },
    { id: "2", name: "Clinical Consultation", prefix: "C", targetSla: 25, routeMode: "Load-Balanced", activeCount: 22 },
    { id: "3", name: "Diagnostic Imaging", prefix: "D", targetSla: 20, routeMode: "Round-Robin", activeCount: 8 },
    { id: "4", name: "Pharmacy & Dispensary", prefix: "P", targetSla: 10, routeMode: "SLA-Optimized", activeCount: 19 },
  ]);

  const [counters, setCounters] = useState<Counter[]>([
    { id: "1", name: "Counter 01", departmentId: "1", operatorName: "Marcus Brody", chimeEnabled: true, status: "Active" },
    { id: "2", name: "Counter 02", departmentId: "2", operatorName: "Sarah Jenkins", chimeEnabled: true, status: "Break" },
    { id: "3", name: "Counter 03", departmentId: "1", operatorName: "Elena Rostova", chimeEnabled: false, status: "Active" },
    { id: "4", name: "Counter 04", departmentId: "3", operatorName: "Jordan Vance", chimeEnabled: true, status: "Active" },
    { id: "5", name: "Counter 05", departmentId: "4", operatorName: "Amira Patel", chimeEnabled: true, status: "Idle" },
    { id: "6", name: "Counter 06", departmentId: "2", operatorName: "Kenji Sato", chimeEnabled: false, status: "Active" },
  ]);

  const [operators, setOperators] = useState<Operator[]>([
    { id: "op1", name: "Marcus Brody", role: "Senior Operator", departmentId: "1", status: "Active", rating: 4.8, email: "marcus.brody@linely.com", shift: "Morning Peak Shift" },
    { id: "op2", name: "Sarah Jenkins", role: "Specialist", departmentId: "2", status: "Break", rating: 4.9, email: "sarah.jenkins@linely.com", shift: "Midday Balanced Shift" },
    { id: "op3", name: "Elena Rostova", role: "Junior Operator", departmentId: "1", status: "Active", rating: 4.5, email: "elena.rostova@linely.com", shift: "Midday Balanced Shift" },
    { id: "op4", name: "Jordan Vance", role: "Senior Operator", departmentId: "3", status: "Active", rating: 4.7, email: "jordan.vance@linely.com", shift: "Morning Peak Shift" },
    { id: "op5", name: "Amira Patel", role: "Junior Operator", departmentId: "4", status: "Active", rating: 4.6, email: "amira.patel@linely.com", shift: "Evening Recovery Shift" },
    { id: "op6", name: "Kenji Sato", role: "Specialist", departmentId: "2", status: "Active", rating: 4.9, email: "kenji.sato@linely.com", shift: "Night Support Window" },
    { id: "op7", name: "Theresa May", role: "Senior Operator", departmentId: "3", status: "Inactive", rating: 4.4, email: "theresa.may@linely.com", shift: "Evening Recovery Shift" },
    { id: "op8", name: "David Miller", role: "Junior Operator", departmentId: "1", status: "Active", rating: 4.3, email: "david.miller@linely.com", shift: "Morning Peak Shift" },
    { id: "op9", name: "Lisa Wong", role: "Specialist", departmentId: "2", status: "Active", rating: 4.8, email: "lisa.wong@linely.com", shift: "Midday Balanced Shift" },
    { id: "op10", name: "Carlos Mendez", role: "Senior Operator", departmentId: "3", status: "Break", rating: 4.7, email: "carlos.mendez@linely.com", shift: "Evening Recovery Shift" },
    { id: "op11", name: "Chloe Dubois", role: "Junior Operator", departmentId: "4", status: "Active", rating: 4.2, email: "chloe.dubois@linely.com", shift: "Morning Peak Shift" },
    { id: "op12", name: "Liam Henderson", role: "Specialist", departmentId: "1", status: "Active", rating: 4.9, email: "liam.henderson@linely.com", shift: "Midday Balanced Shift" },
    { id: "op13", name: "Zoe Kowalski", role: "Senior Operator", departmentId: "2", status: "Active", rating: 4.6, email: "zoe.kowalski@linely.com", shift: "Evening Recovery Shift" },
    { id: "op14", name: "Aidan Gallagher", role: "Junior Operator", departmentId: "3", status: "Active", rating: 4.5, email: "aidan.gallagher@linely.com", shift: "Night Support Window" },
    { id: "op15", name: "Sophia Rossi", role: "Specialist", departmentId: "4", status: "Break", rating: 4.7, email: "sophia.rossi@linely.com", shift: "Morning Peak Shift" },
    { id: "op16", name: "Omar Al-Fayed", role: "Senior Operator", departmentId: "1", status: "Active", rating: 4.8, email: "omar.fayed@linely.com", shift: "Midday Balanced Shift" },
    { id: "op17", name: "Yuki Tanaka", role: "Junior Operator", departmentId: "2", status: "Active", rating: 4.4, email: "yuki.tanaka@linely.com", shift: "Evening Recovery Shift" },
    { id: "op18", name: "Emily Bronte", role: "Specialist", departmentId: "3", status: "Inactive", rating: 4.5, email: "emily.bronte@linely.com", shift: "Night Support Window" },
    { id: "op19", name: "Siddharth Nair", role: "Senior Operator", departmentId: "4", status: "Active", rating: 4.7, email: "sid.nair@linely.com", shift: "Morning Peak Shift" },
    { id: "op20", name: "Nina Simone", role: "Junior Operator", departmentId: "1", status: "Active", rating: 4.6, email: "nina.simone@linely.com", shift: "Midday Balanced Shift" },
    { id: "op21", name: "Felix Carter", role: "Specialist", departmentId: "2", status: "Break", rating: 4.8, email: "felix.carter@linely.com", shift: "Evening Recovery Shift" },
    { id: "op22", name: "Grace Hopper", role: "Senior Operator", departmentId: "3", status: "Active", rating: 4.9, email: "grace.hopper@linely.com", shift: "Night Support Window" },
    { id: "op23", name: "Alan Turing", role: "Junior Operator", departmentId: "4", status: "Active", rating: 4.9, email: "alan.turing@linely.com", shift: "Morning Peak Shift" },
    { id: "op24", name: "Ada Lovelace", role: "Specialist", departmentId: "1", status: "Active", rating: 4.9, email: "ada.lovelace@linely.com", shift: "Midday Balanced Shift" },
    { id: "op25", name: "Margaret Hamilton", role: "Senior Operator", departmentId: "2", status: "Break", rating: 4.9, email: "margaret.hamilton@linely.com", shift: "Evening Recovery Shift" },
    { id: "op26", name: "Katherine Johnson", role: "Junior Operator", departmentId: "3", status: "Active", rating: 4.8, email: "katherine.johnson@linely.com", shift: "Night Support Window" },
    { id: "op27", name: "Dorothy Vaughan", role: "Specialist", departmentId: "4", status: "Active", rating: 4.7, email: "dorothy.vaughan@linely.com", shift: "Morning Peak Shift" },
    { id: "op28", name: "Mary Jackson", role: "Senior Operator", departmentId: "1", status: "Active", rating: 4.8, email: "mary.jackson@linely.com", shift: "Midday Balanced Shift" },
    { id: "op29", name: "Hedy Lamarr", role: "Junior Operator", departmentId: "2", status: "Inactive", rating: 4.5, email: "hedy.marra@linely.com", shift: "Evening Recovery Shift" },
    { id: "op30", name: "Rachel Carson", role: "Specialist", departmentId: "3", status: "Active", rating: 4.7, email: "rachel.carson@linely.com", shift: "Night Support Window" },
    { id: "op31", name: "Jane Goodall", role: "Senior Operator", departmentId: "4", status: "Active", rating: 4.8, email: "jane.goodall@linely.com", shift: "Morning Peak Shift" },
    { id: "op32", name: "Sylvia Earle", role: "Specialist", departmentId: "1", status: "Active", rating: 4.9, email: "sylvia.earle@linely.com", shift: "Midday Balanced Shift" },
  ]);

  const [shifts, setShifts] = useState<Shift[]>([
    { id: "s1", name: "Morning Peak Shift", timeRange: "08:00 AM - 12:00 PM", warningThreshold: 5, isActive: false },
    { id: "s2", name: "Midday Balanced Shift", timeRange: "12:00 PM - 04:00 PM", warningThreshold: 10, isActive: true },
    { id: "s3", name: "Evening Recovery Shift", timeRange: "04:00 PM - 08:00 PM", warningThreshold: 5, isActive: false },
    { id: "s4", name: "Night Support Window", timeRange: "08:00 PM - 12:00 AM", warningThreshold: 15, isActive: false },
  ]);

  const [queueHistory, setQueueHistory] = useState<QueueLog[]>([
    { id: "q1", ticketNumber: "B-102", customerName: "Arthur Pendelton", department: "Billing & Registration", operator: "Marcus Brody", waitTime: "11:24", serviceTime: "04:12", status: "Completed", timestamp: "03:14 PM" },
    { id: "q2", ticketNumber: "C-405", customerName: "Clara Oswald", department: "Clinical Consultation", operator: "Kenji Sato", waitTime: "22:15", serviceTime: "14:45", status: "Completed", timestamp: "03:10 PM" },
    { id: "q3", ticketNumber: "P-209", customerName: "Dmitri Volkov", department: "Pharmacy & Dispensary", operator: "Amira Patel", waitTime: "04:50", serviceTime: "03:22", status: "Completed", timestamp: "03:05 PM" },
    { id: "q4", ticketNumber: "D-112", customerName: "Eleanor Vance", department: "Diagnostic Imaging", operator: "Jordan Vance", waitTime: "18:40", serviceTime: "12:10", status: "Completed", timestamp: "02:59 PM" },
    { id: "q5", ticketNumber: "B-103", customerName: "Felix Henderson", department: "Billing & Registration", operator: "Elena Rostova", waitTime: "14:05", serviceTime: "00:00", status: "No-Show", timestamp: "02:50 PM" },
    { id: "q6", ticketNumber: "C-406", customerName: "Gary Oldman", department: "Clinical Consultation", operator: "Sarah Jenkins", waitTime: "28:10", serviceTime: "01:15", status: "Skipped", timestamp: "02:44 PM" },
    { id: "q7", ticketNumber: "P-210", customerName: "Hannah Abbott", department: "Pharmacy & Dispensary", operator: "Amira Patel", waitTime: "06:12", serviceTime: "04:05", status: "In-Progress", timestamp: "Active" },
    { id: "q8", ticketNumber: "B-104", customerName: "Ian McKellen", department: "Billing & Registration", operator: "Marcus Brody", waitTime: "08:35", serviceTime: "03:45", status: "In-Progress", timestamp: "Active" },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: "a1", timestamp: "03:14:22 PM", user: "Admin (Console)", action: "Announcements broadcast triggered: 'Please check your ticket number on digital boards'", category: "System", severity: "Info" },
    { id: "a2", timestamp: "03:12:05 PM", user: "Sarah Jenkins", action: "Requested 15-minute scheduled restroom break (Counter 02)", category: "Shift", severity: "Info" },
    { id: "a3", timestamp: "02:55:10 PM", user: "Admin (System)", action: "Billing & Registration target SLA changed from 12m to 15m", category: "Settings", severity: "Warning" },
    { id: "a4", timestamp: "02:40:01 PM", user: "Marcus Brody", action: "Counter 01 remote chime testing succeeded", category: "System", severity: "Info" },
    { id: "a5", timestamp: "02:15:30 PM", user: "Admin (Security)", action: "Operator 'Amira Patel' logged in from terminal IP 192.168.1.144", category: "Security", severity: "Info" },
    { id: "a6", timestamp: "01:00:15 PM", user: "Admin (Security)", action: "Unauthorised access blocked to system preferences config", category: "Security", severity: "Critical" },
  ]);

  // Toast System
  const [toasts, setToasts] = useState<{ id: string; type: "success" | "info" | "warning"; text: string }[]>([]);
  const showAdminToast = (type: "success" | "info" | "warning", text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // State for forms & creations
  const [searchQuery, setSearchQuery] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptPrefix, setNewDeptPrefix] = useState("");
  const [newDeptSla, setNewDeptSla] = useState(15);
  const [newDeptRoute, setNewDeptRoute] = useState<"SLA-Optimized" | "Round-Robin" | "Load-Balanced">("SLA-Optimized");

  // New department states for the full-content sub-page view
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [newDeptTokenLimit, setNewDeptTokenLimit] = useState<number>(150);
  const [newDeptOverflowThreshold, setNewDeptOverflowThreshold] = useState<number>(20);
  const [newDeptHoursStart, setNewDeptHoursStart] = useState<string>("08:00 AM");
  const [newDeptHoursEnd, setNewDeptHoursEnd] = useState<string>("05:00 PM");
  const [newDeptOpenForBooking, setNewDeptOpenForBooking] = useState<boolean>(true);

  const [newOperatorName, setNewOperatorName] = useState("");
  const [newOperatorRole, setNewOperatorRole] = useState<"Junior Operator" | "Senior Operator" | "Specialist">("Junior Operator");
  const [newOperatorDept, setNewOperatorDept] = useState("1");
  const [isAddingOperator, setIsAddingOperator] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [newOperatorEmail, setNewOperatorEmail] = useState("");
  const [newOperatorShift, setNewOperatorShift] = useState("Morning Peak Shift");
  const [deleteConfirmOperatorId, setDeleteConfirmOperatorId] = useState<string | null>(null);
  const [operatorSearchQuery, setOperatorSearchQuery] = useState("");
  const [operatorPage, setOperatorPage] = useState(1);

  const [newShiftName, setNewShiftName] = useState("");
  const [newShiftTime, setNewShiftTime] = useState("09:00 AM - 05:00 PM");
  const [newShiftWarning, setNewShiftWarning] = useState(10);

  // Counter management specific state
  const [counterSearchQuery, setCounterSearchQuery] = useState("");
  const [counterStatusFilter, setCounterStatusFilter] = useState("All");
  const [counterDeptFilter, setCounterDeptFilter] = useState("All");
  
  // Custom modals/forms state
  const [isAddCounterModalOpen, setIsAddCounterModalOpen] = useState(false);
  const [isAddingCounter, setIsAddingCounter] = useState(false);
  const [newCounterMaxTokens, setNewCounterMaxTokens] = useState<number>(3);
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [newCounterName, setNewCounterName] = useState("");
  const [newCounterDeptId, setNewCounterDeptId] = useState("1");
  const [newCounterOperator, setNewCounterOperator] = useState("Amira Patel");
  const [newCounterStatus, setNewCounterStatus] = useState<"Active" | "Idle" | "Break">("Idle");
  const [newCounterChime, setNewCounterChime] = useState(true);

  const [editingCounter, setEditingCounter] = useState<Counter | null>(null);
  const [editCounterName, setEditCounterName] = useState("");
  const [editCounterDeptId, setEditCounterDeptId] = useState("1");
  const [editCounterOperator, setEditCounterOperator] = useState("");
  const [editCounterStatus, setEditCounterStatus] = useState<"Active" | "Idle" | "Break">("Idle");
  const [editCounterChime, setEditCounterChime] = useState(true);
  const [editCounterMaxTokens, setEditCounterMaxTokens] = useState<number>(3);

  const [deleteConfirmCounterId, setDeleteConfirmCounterId] = useState<string | null>(null);

  // Redesigned Heatmap Specific State
  const [heatmapTimeframe, setHeatmapTimeframe] = useState<"Today" | "Yesterday" | "7Days" | "MonthToDate">("7Days");
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{
    deptName: string;
    hour: string;
    value: number;
    avgWait: string;
    activeCounters: number;
    compliance: string;
  } | null>(null);
  const [appliedRecs, setAppliedRecs] = useState<Record<string, boolean>>({});

  // High Fidelity Calendar Heatmap State Variables
  const [heatmapYearTitle2023, setHeatmapYearTitle2023] = useState("2023");
  const [heatmapSubtitle2023, setHeatmapSubtitle2023] = useState("Long-Term Arrival Density");
  const [heatmapYearTitle2024, setHeatmapYearTitle2024] = useState("2024");
  const [heatmapSubtitle2024, setHeatmapSubtitle2024] = useState("Active Operational Stress Index");
  const [heatmapSelectedTimeframe, setHeatmapSelectedTimeframe] = useState("Last 7 days");
  const [isEditingHeatmapHeaders, setIsEditingHeatmapHeaders] = useState(false);
  const [heatmapSelectedDept, setHeatmapSelectedDept] = useState<string>("All");
  const [heatmapSelectedMetric, setHeatmapSelectedMetric] = useState<"volume" | "wait-time" | "utilization">("volume");
  
  // Custom cell values state to allow editing values on the fly!
  const [customHeatmapValues, setCustomHeatmapValues] = useState<Record<string, { value?: number; level?: number }>>({});
  const [editingCellCoords, setEditingCellCoords] = useState<{ r: number; c: number } | null>(null);

  // Dropdowns State
  const [timeframeDropdownOpen, setTimeframeDropdownOpen] = useState(false);
  const [hourlyDropdownOpen, setHourlyDropdownOpen] = useState(false);
  const [monthlyDropdownOpen, setMonthlyDropdownOpen] = useState(false);

  // Redesigned Throughput Specific State
  const [throughputTimeframe, setThroughputTimeframe] = useState<"Today" | "Yesterday" | "7Days" | "MonthToDate">("7Days");
  const [selectedThroughputDept, setSelectedThroughputDept] = useState<string>("Clinical Consultation");
  const [throughputSearchQuery, setThroughputSearchQuery] = useState("");
  const [throughputSortField, setThroughputSortField] = useState<"volume" | "compliance" | "avgWait" | "avgService">("volume");

  // Customization Brand State
  const [brandLogoText, setBrandLogoText] = useState("Linely Enterprise");
  const [brandPrimaryColor, setBrandPrimaryColor] = useState("#1A2372");
  const [brandAccentColor, setBrandAccentColor] = useState("#00C3E3");
  const [brandWelcomeMessage, setBrandWelcomeMessage] = useState("Welcome to Main Medical Atrium. Please select a department to check in.");
  const [kioskPrintingEnabled, setKioskPrintingEnabled] = useState(true);
  const [smsNotificationEnabled, setSmsNotificationEnabled] = useState(true);

  // TV Branding Custom Presets
  const TV_PRESETS: Record<"Classic" | "Minimal" | "Bold", TVBrandingConfig> = {
    Classic: { ...DEFAULT_BRANDING },
    Minimal: {
      departmentLabelFontSize: "text-xs",
      departmentLabelColor: "#4B5563",
      logoText: "LINELY",
      logoFontFamily: "Outfit",
      logoColor: "#111827",
      tokenBgGradientFrom: "#111827",
      tokenBgGradientTo: "#111827",
      tokenTextColor: "#FFFFFF",
      nameTextColor: "#111827",
      counterCardBgFrom: "#F9FAFB",
      counterCardBgTo: "#F3F4F6",
      counterCardBorderColor: "#E5E7EB",
      counterRoomTextColor: "#111827",
      counterOperatorTextColor: "#4B5563",
      upNextLabelText: "NEXT IN QUEUE",
      upNextLabelColor: "#9CA3AF",
      nextItemsTextColor: "#374151",
      showSecondNextItem: false,
      bgPrimaryColor: "#FFFFFF",
      showDotMatrix: false,
      showGridLines: false,
      showAmbientBlobs: false,
      blob1Color: "#00000000",
      blob2Color: "#00000000",
      blob3Color: "#00000000",
      showWaves: false,
      wave1ColorFrom: "#00000000",
      wave1ColorTo: "#00000000",
      wave2ColorFrom: "#00000000",
      wave2ColorTo: "#00000000",
      wave3ColorFrom: "#00000000",
      wave3ColorTo: "#00000000",
      wave4ColorFrom: "#00000000",
      wave4ColorTo: "#00000000",
      showFloatingBubbles: false,
      autoplayIntervalSeconds: 10,
      ttsEnabledByDefault: true,
      chimeFrequencies: [554.37, 659.25],
    },
    Bold: {
      departmentLabelFontSize: "text-sm",
      departmentLabelColor: "#00C3E3",
      logoText: "Linely Premium",
      logoFontFamily: "Space Grotesk",
      logoColor: "#00C3E3",
      tokenBgGradientFrom: "#00C3E3",
      tokenBgGradientTo: "#0D1A5E",
      tokenTextColor: "#080B15",
      nameTextColor: "#FFFFFF",
      counterCardBgFrom: "#0F1322",
      counterCardBgTo: "#080B15",
      counterCardBorderColor: "#00C3E380",
      counterRoomTextColor: "#00C3E3",
      counterOperatorTextColor: "#E2E8F0",
      upNextLabelText: "UP NEXT IN CLINIC",
      upNextLabelColor: "#00C3E3",
      nextItemsTextColor: "#38BDF8",
      showSecondNextItem: true,
      bgPrimaryColor: "#080B15",
      showDotMatrix: true,
      showGridLines: true,
      showAmbientBlobs: true,
      blob1Color: "#00C3E330",
      blob2Color: "#0D1A5E40",
      blob3Color: "#11182750",
      showWaves: true,
      wave1ColorFrom: "#060913",
      wave1ColorTo: "#0B132B",
      wave2ColorFrom: "#0D1B2A",
      wave2ColorTo: "#1B263B",
      wave3ColorFrom: "#1B263B",
      wave3ColorTo: "#415A77",
      wave4ColorFrom: "#1F3A52",
      wave4ColorTo: "#00C3E3",
      showFloatingBubbles: true,
      autoplayIntervalSeconds: 6,
      ttsEnabledByDefault: true,
      chimeFrequencies: [587.33, 659.25],
    }
  };

  // TV Branding States
  const [tvDraftBranding, setTvDraftBranding] = useState<TVBrandingConfig>({ ...DEFAULT_BRANDING });
  const [tvPublishedBranding, setTvPublishedBranding] = useState<TVBrandingConfig>({ ...DEFAULT_BRANDING });
  const [selectedTvPreset, setSelectedTvPreset] = useState<"Classic" | "Minimal" | "Bold">("Classic");
  const [tvBrandingOpenSection, setTvBrandingOpenSection] = useState<"presets" | "logo" | "queue" | "bg" | "audio">("presets");

  // Deep comparison of draft and published branding to detect changes
  const hasTvUnpublishedChanges = useMemo(() => {
    return JSON.stringify(tvDraftBranding) !== JSON.stringify(tvPublishedBranding);
  }, [tvDraftBranding, tvPublishedBranding]);

  // Track previous sidebar collapse state to restore on exit
  const [wasSidebarCollapsedBeforeBranding, setWasSidebarCollapsedBeforeBranding] = useState<boolean>(false);
  
  useEffect(() => {
    if (activeTab === "branding-editor") {
      setWasSidebarCollapsedBeforeBranding(isSidebarCollapsed);
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(wasSidebarCollapsedBeforeBranding);
    }
  }, [activeTab]);

  // Broadcast Message State
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("All Counters");
  const [broadcastType, setBroadcastType] = useState<"Voice TTS" | "Screen Banner" | "Sound Chime">("Voice TTS");

  // Comparative Report State
  const [reportPeriod, setReportPeriod] = useState<"Today" | "Yesterday" | "7Days" | "30Days">("Today");
  const [comparisonSelector, setComparisonSelector] = useState<"BranchA_vs_BranchB" | "Q1_vs_Q2" | "Peak_vs_OffPeak">("BranchA_vs_BranchB");
  const [simpleCompareType, setSimpleCompareType] = useState<"departments" | "counters">("departments");
  const [simpleCompareIdA, setSimpleCompareIdA] = useState<string>("");
  const [simpleCompareIdB, setSimpleCompareIdB] = useState<string>("");

  // Operator Performance Analytics States
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);
  const [analyticsSearchQuery, setAnalyticsSearchQuery] = useState("");
  const [analyticsSelectedDept, setAnalyticsSelectedDept] = useState("All");
  const [analyticsSelectedShift, setAnalyticsSelectedShift] = useState("All");
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<"Today" | "7Days" | "30Days">("7Days");
  const [editingAssignmentOpId, setEditingAssignmentOpId] = useState<string | null>(null);
  const [editAssignmentDept, setEditAssignmentDept] = useState("");
  const [editAssignmentCounter, setEditAssignmentCounter] = useState("");
  const [revokeConfirmOpId, setRevokeConfirmOpId] = useState<string | null>(null);

  // Edit Queue Item States
  const [editingQueueItem, setEditingQueueItem] = useState<QueueLog | null>(null);
  const [editQueueTicketNumber, setEditQueueTicketNumber] = useState("");
  const [editQueueCustomerName, setEditQueueCustomerName] = useState("");
  const [editQueueDeptName, setEditQueueDeptName] = useState("");
  const [editQueueOperator, setEditQueueOperator] = useState("");
  const [editQueueWaitTime, setEditQueueWaitTime] = useState("");
  const [editQueueServiceTime, setEditQueueServiceTime] = useState("");
  const [editQueueStatus, setEditQueueStatus] = useState<"Completed" | "No-Show" | "Skipped" | "In-Progress">("In-Progress");

  // Add Department
  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptPrefix) {
      showAdminToast("warning", "Please fill in all department fields.");
      return;
    }
    const newId = (departments.length + 1).toString();
    const newDept: Department = {
      id: newId,
      name: newDeptName,
      prefix: newDeptPrefix.toUpperCase(),
      targetSla: newDeptSla,
      routeMode: newDeptRoute,
      activeCount: 0,
      tokenLimit: newDeptTokenLimit,
      overflowThreshold: newDeptOverflowThreshold,
      operatingHoursStart: newDeptHoursStart,
      operatingHoursEnd: newDeptHoursEnd,
      openForScheduledBooking: newDeptOpenForBooking
    };
    setDepartments([...departments, newDept]);
    showAdminToast("success", `Department '${newDeptName}' created successfully.`);
    setNewDeptName("");
    setNewDeptPrefix("");
    setNewDeptSla(15);
    setNewDeptRoute("SLA-Optimized");
    setNewDeptTokenLimit(150);
    setNewDeptOverflowThreshold(20);
    setNewDeptHoursStart("08:00 AM");
    setNewDeptHoursEnd("05:00 PM");
    setNewDeptOpenForBooking(true);
    setIsAddingDepartment(false);
  };

  // Add/Edit Operator Submit handler
  const handleAddOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOperatorName.trim()) {
      showAdminToast("warning", "Operator name cannot be empty.");
      return;
    }
    if (!newOperatorEmail.trim()) {
      showAdminToast("warning", "Operator email cannot be empty.");
      return;
    }

    if (editingOperator) {
      // Editing Mode
      const updated = operators.map(op => {
        if (op.id === editingOperator.id) {
          return {
            ...op,
            name: newOperatorName,
            role: newOperatorRole,
            departmentId: newOperatorDept,
            email: newOperatorEmail,
            shift: newOperatorShift,
          };
        }
        return op;
      });
      setOperators(updated);
      showAdminToast("success", `Operator '${newOperatorName}' parameters updated successfully.`);
    } else {
      // Creating Mode
      const newOp: Operator = {
        id: "op" + (operators.length + 1).toString(),
        name: newOperatorName,
        role: newOperatorRole,
        departmentId: newOperatorDept,
        status: "Pending Invitation",
        rating: 5.0,
        email: newOperatorEmail,
        shift: newOperatorShift,
      };
      setOperators([...operators, newOp]);
      showAdminToast("success", `Invitation link successfully dispatched to ${newOperatorEmail}`);
    }

    // Reset Form
    setNewOperatorName("");
    setNewOperatorEmail("");
    setNewOperatorDept("1");
    setNewOperatorRole("Junior Operator");
    setNewOperatorShift("Morning Peak Shift");
    setEditingOperator(null);
    setIsAddingOperator(false);
  };

  // Add Counter Submit handler
  const handleAddCounterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounterName.trim()) {
      showAdminToast("warning", "Counter name cannot be empty.");
      return;
    }
    const newCounter: Counter = {
      id: (counters.length + 1).toString(),
      name: newCounterName,
      departmentId: newCounterDeptId,
      operatorName: newCounterOperator,
      chimeEnabled: newCounterChime,
      status: newCounterStatus,
      maxConcurrentTokens: newCounterMaxTokens
    };
    setCounters([...counters, newCounter]);
    showAdminToast("success", `Counter '${newCounterName}' provisioned successfully.`);
    setNewCounterName("");
    setNewCounterMaxTokens(3);
    setIsAddCounterModalOpen(false);
    setIsAddingCounter(false);
  };

  // Edit Counter Submit handler
  const handleEditCounterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCounter) return;
    if (!editCounterName.trim()) {
      showAdminToast("warning", "Counter name cannot be empty.");
      return;
    }
    const updated = counters.map(c => {
      if (c.id === editingCounter.id) {
        return {
          ...c,
          name: editCounterName,
          departmentId: editCounterDeptId,
          operatorName: editCounterOperator,
          status: editCounterStatus,
          chimeEnabled: editCounterChime,
          maxConcurrentTokens: editCounterMaxTokens
        };
      }
      return c;
    });
    setCounters(updated);
    showAdminToast("success", `Counter '${editCounterName}' updated successfully.`);
    setEditingCounter(null);
  };

  // Edit Queue Item submit handler
  const handleEditQueueItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQueueItem) return;
    if (!editQueueTicketNumber.trim() || !editQueueCustomerName.trim()) {
      showAdminToast("warning", "Ticket number and customer name are required.");
      return;
    }
    const updated = queueHistory.map(q => {
      if (q.id === editingQueueItem.id) {
        return {
          ...q,
          ticketNumber: editQueueTicketNumber,
          customerName: editQueueCustomerName,
          department: editQueueDeptName,
          operator: editQueueOperator,
          waitTime: editQueueWaitTime,
          serviceTime: editQueueServiceTime,
          status: editQueueStatus
        };
      }
      return q;
    });
    setQueueHistory(updated);
    showAdminToast("success", `Ticket '${editQueueTicketNumber}' updated successfully.`);
    setEditingQueueItem(null);
  };

  // Add Shift Template
  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftName) {
      showAdminToast("warning", "Shift name cannot be empty.");
      return;
    }
    const newSft: Shift = {
      id: "s" + (shifts.length + 1),
      name: newShiftName,
      timeRange: newShiftTime,
      warningThreshold: newShiftWarning,
      isActive: false
    };
    setShifts([...shifts, newSft]);
    showAdminToast("success", `Shift template '${newShiftName}' created successfully.`);
    setNewShiftName("");
  };

  // Filtered counters memoized for the list filters
  const filteredCounters = useMemo(() => {
    return counters.filter(counter => {
      const matchesSearch = 
        counter.name.toLowerCase().includes(counterSearchQuery.toLowerCase()) ||
        counter.operatorName.toLowerCase().includes(counterSearchQuery.toLowerCase());
      
      const matchesDept = 
        counterDeptFilter === "All" || 
        counter.departmentId === counterDeptFilter;
      
      const matchesStatus = 
        counterStatusFilter === "All" || 
        counter.status === counterStatusFilter;
        
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [counters, counterSearchQuery, counterDeptFilter, counterStatusFilter]);

  // Trigger Broadcast
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) {
      showAdminToast("warning", "Broadcast message cannot be empty.");
      return;
    }
    const newLog: AuditLog = {
      id: "a" + (auditLogs.length + 1),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      user: "Admin (Console)",
      action: `Broadcast [${broadcastType}] sent to ${broadcastTarget}: "${broadcastText}"`,
      category: "System",
      severity: "Info"
    };
    setAuditLogs([newLog, ...auditLogs]);
    showAdminToast("success", `Broadcast announced successfully via ${broadcastType}!`);
    setBroadcastText("");
  };

  // Filtered queue history for search
  const filteredQueueHistory = useMemo(() => {
    return queueHistory.filter(q => 
      q.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [queueHistory, searchQuery]);

  return (
    <div className={`${isPreviewMode ? "w-full h-[650px] relative overflow-hidden flex flex-row" : "h-screen overflow-hidden flex flex-row"} bg-[#F8FAFC] text-slate-800 font-cabin antialiased`}>
      
      {/* Toast Overlay */}
      <div className="fixed top-5 right-5 z-[1000] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className={`p-4 rounded-xl border shadow-lg flex items-center gap-3 font-semibold text-xs pointer-events-auto ${
                t.type === "success" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : t.type === "warning"
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              <span className="material-symbols-outlined select-none text-[18px]">
                {t.type === "success" ? "check_circle" : t.type === "warning" ? "warning" : "info"}
              </span>
              <span>{t.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AdminSidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        profileName="Daemon Targaryen"
        profileEmail="daemon@targaryen.com"
        profileInitials="DT"
        showPromo={true}
        menuItems={[
          {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            subItems: [
              { id: "facility-overview", label: "Facility Overview" },
              { id: "daily-summary", label: "Daily Summary Tracker" }
            ]
          },
          {
            id: "departments-manager",
            label: "Departments SLA",
            icon: Layers,
            tabId: "departments-manager"
          },
          {
            id: "counters-manager",
            label: "Counters Setup",
            icon: Laptop,
            tabId: "counters-manager"
          },
          {
            id: "operators",
            label: "Operators",
            icon: UserCheck,
            subItems: [
              { id: "operators-manager", label: "Operators Directory" },
              { id: "operator-performance", label: "Operator Performance" }
            ]
          },
          {
            id: "queue-tickets",
            label: "Queue Tickets",
            icon: Ticket,
            tabId: "queue-tickets"
          },
          {
            id: "appointments",
            label: "Appointments",
            icon: Calendar,
            subItems: [
              { id: "shift-manager", label: "Shifts Manager" }
            ]
          },
          {
            id: "reports",
            label: "Reports",
            icon: FileSpreadsheet,
            subItems: [
              { id: "comparative-reports", label: "Simple Compare" }
            ]
          },
          {
            id: "analytics",
            label: "Analytics",
            icon: BarChart3,
            subItems: [
              { id: "peak-heatmap", label: "Peak Hours Heatmap" },
              { id: "dept-throughput", label: "Department Throughput" }
            ]
          },
          {
            id: "notifications",
            label: "Notifications",
            icon: Bell,
            subItems: [
              { id: "announcements-broadcast", label: "Announcements" },
              { id: "audit-logs", label: "System Audit Logs" }
            ]
          }
        ]}
      />
      {/* Main Dynamic Workspace Area */}
      <main className={`flex-1 flex flex-col min-w-0 ${isPreviewMode ? "max-h-[650px]" : "h-full overflow-hidden"}`}>
        
        {/* Dynamic Nav-Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-slate-100 w-full px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
              <span>Linely Console</span>
              <span>/</span>
              <span className="text-brand-ocean">{activeTab.replace("-", " ")}</span>
            </div>
            <h2 className="font-rethink text-xl font-black text-brand-navy mt-1 capitalize">{activeTab.replace("-", " ")}</h2>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Live active stats ticker in header */}
            <div className="hidden lg:flex items-center gap-4 bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 8 Operators Online</span>
              <span className="w-px h-3 bg-slate-200" />
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" /> SLA Compliance 91.8%</span>
            </div>

            <button
              onClick={onOpenTV}
              className="bg-brand-ocean hover:bg-[#00C3E3] hover:text-brand-navy border border-brand-ocean/20 text-white px-4.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Launch Waiting Room TV Display Screen"
            >
              <Tv className="w-3.5 h-3.5" /> Waiting Room TV
            </button>

            <button
              onClick={() => {
                const message = prompt("Enter short ticker or TTS announcement broadcast message:");
                if (message) {
                  const newLog: AuditLog = {
                    id: "a" + (auditLogs.length + 1),
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    user: "Admin (Header)",
                    action: `Emergency ticker broadcasted: "${message}"`,
                    category: "System",
                    severity: "Warning"
                  };
                  setAuditLogs([newLog, ...auditLogs]);
                  showAdminToast("success", "Emergency broadcast pushed successfully!");
                }
              }}
              className="bg-brand-navy hover:bg-brand-ocean text-white px-4.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" /> Quick Broadcaster
            </button>
          </div>
        </header>

        {/* Dynamic Views switching based on Active Tab */}
        <div className="flex-1 h-full overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: FACILITY OVERVIEW */}
          {activeTab === "facility-overview" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 facility-clean-font"
            >
              {/* Top Alert Banner for Actionable Recommendations */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 border border-amber-200/50">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-rethink font-bold text-sm text-amber-900">Recommended Operational Adjustment</h4>
                    <p className="text-xs text-amber-700 mt-1 max-w-2xl leading-relaxed">
                      Clinical Consultation is experiencing elevated service delays (+14 minutes above target SLA). High volume of walked-in patients. Recommendation: Reroute Counter 03 immediately.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const updated = counters.map(c => c.id === "3" ? { ...c, departmentId: "2" } : c);
                    setCounters(updated);
                    showAdminToast("success", "Counter 03 successfully rerouted to Clinical Consultation.");
                  }}
                  className="bg-amber-900 text-white hover:bg-amber-950 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm active:scale-95 animate-pulse"
                >
                  Reroute Counter 03
                </button>
              </div>

              {/* 1. DYNAMIC KPI OVERVIEW ROW - High-contrast & Spacious */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* KPI 1: Total Departments */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Total Sectors</span>
                    <h3 className="font-rethink text-3xl font-black text-brand-navy leading-none">
                      {departments.length}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium block">Configured Departments</span>
                  </div>
                  <div className="w-12 h-12 bg-brand-navy/5 rounded-xl flex items-center justify-center text-brand-navy border border-brand-navy/10">
                    <FolderTree className="w-6 h-6" />
                  </div>
                </div>

                {/* KPI 2: Service Counters */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Service Terminals</span>
                    <h3 className="font-rethink text-3xl font-black text-brand-navy leading-none">
                      {counters.filter(c => c.status === "Active").length} <span className="text-xs text-slate-400 font-semibold">/ {counters.length} Active</span>
                    </h3>
                    <span className="text-xs text-emerald-600 font-bold block">Live Counter Desks</span>
                  </div>
                  <div className="w-12 h-12 bg-brand-navy/5 rounded-xl flex items-center justify-center text-brand-navy border border-brand-navy/10">
                    <Laptop className="w-6 h-6" />
                  </div>
                </div>

                {/* KPI 3: Waiting Customers with Simulated Control */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between relative overflow-hidden">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Waiting Lobby</span>
                    <h3 className="font-rethink text-3xl font-black text-brand-navy leading-none flex items-baseline gap-1">
                      {departments.reduce((acc, d) => acc + d.activeCount, 0)}
                      <span className="text-xs text-slate-400 font-bold ml-1">Lobbyists</span>
                    </h3>
                    <button
                      onClick={() => {
                        const updated = departments.map(d => {
                          const randAdd = Math.floor(Math.random() * 2) + 1;
                          return { ...d, activeCount: d.activeCount + randAdd };
                        });
                        setDepartments(updated);
                        showAdminToast("success", "Simulated quick wave of new check-ins across the facility!");
                      }}
                      className="text-[10px] text-brand-cyan hover:text-brand-ocean font-extrabold uppercase tracking-wider block mt-1 underline cursor-pointer"
                    >
                      + Sim Inflow Wave
                    </button>
                  </div>
                  <div className="w-12 h-12 bg-brand-navy/5 rounded-xl flex items-center justify-center text-brand-navy border border-brand-navy/10 shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                {/* KPI 4: Online Operators */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Staff Coverage</span>
                    <h3 className="font-rethink text-3xl font-black text-brand-navy leading-none">
                      {operators.filter(o => o.status === "Active").length} <span className="text-xs text-slate-400 font-semibold">/ {operators.length}</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-medium block">Active Operators</span>
                  </div>
                  <div className="w-12 h-12 bg-brand-navy/5 rounded-xl flex items-center justify-center text-brand-navy border border-brand-navy/10">
                    <UserCheck className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* 2. DEPARTMENTS QUEUE STATUS MATRIX */}
              <div className="space-y-6 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-250/60">
                  <div>
                    <h3 className="font-rethink text-lg font-black text-brand-navy uppercase tracking-wider">Department Queues & Congestion Status</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Real-time load mapping, routing parameters, and active SLA targets per medical and business sector.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const updated = departments.map(d => ({ ...d, activeCount: 0 }));
                        setDepartments(updated);
                        showAdminToast("info", "Facility lobby queue cleared entirely.");
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Reset Queue Volumes
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {departments.map((dept) => {
                    const congestion = dept.activeCount < 10 
                      ? { text: "Low Congestion", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", indicator: "bg-emerald-500" } 
                      : dept.activeCount < 20 
                        ? { text: "Medium Flow", bg: "bg-amber-50 text-amber-700 border-amber-200", indicator: "bg-amber-500" }
                        : { text: "Heavy Queue", bg: "bg-rose-50 text-rose-700 border-rose-200", indicator: "bg-rose-500" };

                    return (
                      <div 
                        key={dept.id} 
                        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
                      >
                        {/* Status bar top */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="w-8 h-8 rounded-xl bg-brand-navy text-white flex items-center justify-center font-black text-xs shadow-sm">
                            {dept.prefix}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${congestion.bg}`}>
                            {congestion.text}
                          </span>
                        </div>

                        <div className="space-y-1 mb-4">
                          <h4 className="font-rethink text-sm font-bold text-brand-navy line-clamp-1 leading-tight" title={dept.name}>
                            {dept.name}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-semibold block">Target SLA: {dept.targetSla} mins</span>
                        </div>

                        {/* Visual Queue Depth */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between gap-3 mb-4">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-black block tracking-wider">In Lobby Waiting</span>
                            <span className="font-rethink font-black text-2xl text-brand-navy block mt-0.5">
                              {dept.activeCount} <span className="text-xs text-slate-400 font-bold">clients</span>
                            </span>
                          </div>
                          
                          {/* Visual queue depth indicator bar */}
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((bar) => {
                              const isActive = dept.activeCount >= bar * 5;
                              return (
                                <span 
                                  key={bar} 
                                  className={`w-2 h-7 rounded-md transition-all ${
                                    isActive 
                                      ? dept.activeCount >= 20 ? "bg-rose-500 animate-pulse" : dept.activeCount >= 10 ? "bg-amber-500" : "bg-emerald-500"
                                      : "bg-slate-200"
                                  }`} 
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* SLA Routing mode selection dropdown */}
                        <div className="mb-4">
                          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">Routing Algorithm</label>
                          <select
                            value={dept.routeMode}
                            onChange={(e) => {
                              const updated = departments.map(d => d.id === dept.id ? { ...d, routeMode: e.target.value as any } : d);
                              setDepartments(updated);
                              showAdminToast("success", `Routing algorithm for ${dept.name} changed to ${e.target.value}.`);
                            }}
                            className="bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer w-full focus:outline-none focus:ring-1 focus:ring-brand-navy"
                          >
                            <option value="SLA-Optimized">SLA-Optimized (Load)</option>
                            <option value="Load-Balanced">Load-Balanced (Weighted)</option>
                            <option value="Round-Robin">Round-Robin (Symmetric)</option>
                          </select>
                        </div>

                        {/* Control actions */}
                        <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-100">
                          <button
                            onClick={() => {
                              const updated = departments.map(d => d.id === dept.id ? { ...d, activeCount: d.activeCount + 1 } : d);
                              setDepartments(updated);
                              showAdminToast("success", `Walk-In Ticket generated for ${dept.name}! Ticket Prefix: ${dept.prefix}`);
                            }}
                            className="bg-[#00C3E3]/10 text-brand-navy hover:bg-[#00C3E3]/25 px-2 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all active:scale-95 text-center"
                          >
                            + Walk-In
                          </button>
                          
                          <button
                            onClick={() => {
                              if (dept.activeCount === 0) {
                                showAdminToast("warning", `No waiting customers in ${dept.name}.`);
                                return;
                              }
                              const updatedDept = departments.map(d => d.id === dept.id ? { ...d, activeCount: d.activeCount - 1 } : d);
                              setDepartments(updatedDept);
                              
                              const freeCounter = counters.find(c => c.departmentId === dept.id && c.status === "Active");
                              const targetCounterName = freeCounter ? freeCounter.name : "Lobby Queue Announcer";
                              showAdminToast("success", `Called ticket ${dept.prefix}-10${Math.floor(Math.random() * 80) + 10} to ${targetCounterName}!`);
                            }}
                            className="bg-brand-navy text-white hover:bg-brand-ocean px-2 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all active:scale-95 text-center shadow-sm"
                          >
                            Call Next
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. LIVE COUNTER SERVICE DESK STREAM */}
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-250/60">
                  <div>
                    <h3 className="font-rethink text-lg font-black text-brand-navy uppercase tracking-wider">Service Terminal Live Counter Monitors</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Real-time status tracking, current ticket processing, and remote operator controls.</p>
                  </div>
                  <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Telemetry Synced
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {counters.map(c => {
                    const assignedDept = departments.find(d => d.id === c.departmentId);
                    
                    // Style variables based on status for extreme instant clarity
                    let statusBoxStyle = "";
                    let tokenStyle = "";
                    
                    if (c.status === "Active") {
                      statusBoxStyle = "bg-emerald-50 border border-emerald-200 text-emerald-900";
                      tokenStyle = "text-emerald-700";
                    } else if (c.status === "Break") {
                      statusBoxStyle = "bg-amber-50 border border-amber-200 text-amber-900";
                      tokenStyle = "text-amber-700";
                    } else {
                      statusBoxStyle = "bg-slate-50 border border-slate-200 text-slate-600";
                      tokenStyle = "text-slate-500";
                    }

                    return (
                      <div 
                        key={c.id}
                        className="bg-white border border-slate-250 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                      >
                        {/* 1. Header Row: Counter ID and Live Status Select */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-rethink font-bold text-base text-brand-navy">{c.name}</span>
                            <p className="text-xs text-slate-400 font-medium">{c.operatorName}</p>
                          </div>
                          <select
                            value={c.status}
                            onChange={(e) => {
                              const updated = counters.map(item => item.id === c.id ? { ...item, status: e.target.value as any } : item);
                              setCounters(updated);
                              showAdminToast("success", `Operational status for ${c.name} changed to: ${e.target.value}`);
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-navy cursor-pointer"
                          >
                            <option value="Active">Active</option>
                            <option value="Idle">Idle</option>
                            <option value="Break">On Break</option>
                          </select>
                        </div>

                        {/* 2. Department Assign Dropdown */}
                        <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                          <span className="text-slate-400 font-medium">SLA Queue:</span>
                          <select
                            value={c.departmentId}
                            onChange={(e) => {
                              const updated = counters.map(item => item.id === c.id ? { ...item, departmentId: e.target.value } : item);
                              setCounters(updated);
                              showAdminToast("success", `${c.name} assigned to handle: ${departments.find(d => d.id === e.target.value)?.name}`);
                            }}
                            className="bg-transparent text-brand-navy font-bold focus:outline-none cursor-pointer max-w-[160px] text-right"
                          >
                            {departments.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* 3. Simplest Serving State Row */}
                        <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between text-xs">
                          {c.status === "Active" ? (
                            <>
                              <span className="text-slate-500 font-medium flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-emerald-500" /> Serving
                              </span>
                              <span className="font-rethink font-black text-lg text-emerald-600">
                                {assignedDept?.prefix || "X"}-10{c.id}
                              </span>
                            </>
                          ) : c.status === "Break" ? (
                            <>
                              <span className="text-slate-500 font-medium">Status</span>
                              <span className="font-semibold text-amber-600">☕ On Break</span>
                            </>
                          ) : (
                            <>
                              <span className="text-slate-500 font-medium">Status</span>
                              <span className="font-semibold text-slate-400">💤 Standby</span>
                            </>
                          )}
                        </div>

                        {/* 4. Audio Control and Chime test buttons */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                          <button
                            onClick={() => {
                              const updated = counters.map(item => item.id === c.id ? { ...item, chimeEnabled: !item.chimeEnabled } : item);
                              setCounters(updated);
                              showAdminToast("info", `${c.name} speaker chime ${!c.chimeEnabled ? "enabled" : "silenced"}.`);
                            }}
                            className="text-slate-400 hover:text-brand-navy flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {c.chimeEnabled ? (
                              <Volume2 className="w-4 h-4 text-brand-navy" />
                            ) : (
                              <VolumeX className="w-4 h-4 text-slate-400" />
                            )}
                            <span>{c.chimeEnabled ? "Chime On" : "Muted"}</span>
                          </button>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                showAdminToast("success", `Operator ${c.operatorName} screen flashed alert.`);
                              }}
                              className="bg-brand-navy/5 text-brand-navy hover:bg-brand-navy/10 px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer"
                            >
                              Nudge
                            </button>
                            <button
                              onClick={() => {
                                showAdminToast("info", `Called ticket to Desk ${c.name}`);
                              }}
                              className="bg-brand-cyan/10 text-brand-navy hover:bg-brand-cyan/20 px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer"
                            >
                              Chime
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. DYNAMIC & FULLY INTERACTIVE CLOSURE CALENDAR */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-brand-navy" />
                    <div>
                      <h3 className="font-rethink text-lg font-bold text-brand-navy">System Closure & Holiday Schedule Calendar</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Determine closure slots to automatically hold kiosk check-ins and appointment queues.</p>
                    </div>
                  </div>
                  
                  {/* Scope helper badge */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-400 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Full Facility
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Dept Specific
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Column Left: Visual Calendar Month Grid for July 2026 (7 of 12 columns) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-brand-navy font-rethink">July 2026</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl">
                        Today: Jul 2, 2026
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 border-b border-slate-100 pb-2">
                      <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                    </div>

                    {/* July 2026 Calendar Grid (July 1st is Wednesday) */}
                    <div className="grid grid-cols-7 gap-2">
                      {/* Empty slots for Sun, Mon, Tue */}
                      <div className="h-12 bg-slate-50/40 rounded-xl border border-slate-100/40 opacity-40" />
                      <div className="h-12 bg-slate-50/40 rounded-xl border border-slate-100/40 opacity-40" />
                      <div className="h-12 bg-slate-50/40 rounded-xl border border-slate-100/40 opacity-40" />

                      {/* July Days 1 through 31 */}
                      {Array.from({ length: 31 }, (_, i) => {
                        const dayNumber = i + 1;
                        const dateString = `2026-07-${dayNumber < 10 ? '0' + dayNumber : dayNumber}`;
                        
                        // Check if day is today
                        const isToday = dayNumber === 2;
                        
                        // Check if date has a scheduled closure
                        const matchedClosure = closures.find(cl => cl.date === dateString);
                        
                        // Check if date matches the selected date in schedule form
                        const isSelectedInForm = newClosureDate === dateString;

                        return (
                          <button
                            key={dayNumber}
                            type="button"
                            onClick={() => {
                              setNewClosureDate(dateString);
                              showAdminToast("info", `Selected July ${dayNumber} for scheduling.`);
                            }}
                            className={`h-12 rounded-xl flex flex-col items-center justify-between p-1.5 transition-all relative border group cursor-pointer ${
                              isToday 
                                ? "bg-brand-navy border-brand-navy text-white shadow-md shadow-brand-navy/15 font-black"
                                : matchedClosure
                                  ? matchedClosure.scope === "Full Facility"
                                    ? "bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100/80 font-bold"
                                    : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100/80 font-bold"
                                  : isSelectedInForm
                                    ? "bg-[#00C3E3]/15 border-[#00C3E3] text-brand-navy font-bold"
                                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50/50"
                            }`}
                            title={matchedClosure ? `${matchedClosure.reason} (${matchedClosure.scope})` : `July ${dayNumber}, 2026`}
                          >
                            {/* Day Number */}
                            <span className="text-xs">{dayNumber}</span>
                            
                            {/* Today marker beacon */}
                            {isToday && (
                              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-cyan animate-ping" />
                            )}

                            {/* Small decorative dot if closure exists */}
                            {matchedClosure && (
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                matchedClosure.scope === "Full Facility" ? "bg-rose-500" : "bg-amber-500"
                              }`} />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-slate-400 font-bold italic leading-relaxed pt-1">
                      💡 Click any calendar date cell above to instantly fill the scheduling date form on the right!
                    </p>
                  </div>

                  {/* Column Right: Active Closures list & Creation Form (5 of 12 columns) */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Part A: Scheduled Closures Ledger List */}
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Scheduled Closure Ledger</span>
                      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                        {closures.length === 0 ? (
                          <div className="p-4 rounded-xl border border-dashed border-slate-250 bg-slate-50 text-center text-slate-400 text-xs">
                            No closure slots scheduled for July.
                          </div>
                        ) : (
                          closures.map((cl) => (
                            <div 
                              key={cl.id} 
                              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all hover:shadow-sm ${
                                cl.scope === "Full Facility" 
                                  ? "bg-rose-50/50 border-rose-150 text-rose-900" 
                                  : "bg-amber-50/50 border-amber-150 text-amber-900"
                              }`}
                            >
                              <div className="space-y-1 pr-3">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold">{cl.date}</span>
                                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-white border">
                                    {cl.scope === "Full Facility" ? "Full Lock" : "Partial Dept"}
                                  </span>
                                </div>
                                <p className="font-semibold line-clamp-1 text-[11px] leading-tight text-slate-600">{cl.reason}</p>
                                {cl.scope === "Department Specific" && (
                                  <span className="text-[9px] text-amber-700 font-extrabold uppercase">Scope: {cl.affectedDept}</span>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setClosures(closures.filter(item => item.id !== cl.id));
                                  showAdminToast("success", `Closure on ${cl.date} cancelled successfully.`);
                                }}
                                className="p-1.5 hover:bg-white text-rose-600 hover:text-rose-800 rounded-lg transition-colors cursor-pointer"
                                title="Delete Closure Slot"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Part B: Add Closure Slot Form */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newClosureReason.trim()) {
                          showAdminToast("warning", "Please provide a valid holiday or closure reason.");
                          return;
                        }
                        
                        if (closures.some(cl => cl.date === newClosureDate)) {
                          showAdminToast("warning", `A closure is already scheduled for ${newClosureDate}.`);
                          return;
                        }

                        const newId = "cl" + (closures.length + 1);
                        const newCl = {
                          id: newId,
                          date: newClosureDate,
                          reason: newClosureReason,
                          scope: newClosureScope,
                          affectedDept: newClosureScope === "Full Facility" ? "All" : newClosureDept
                        };

                        setClosures([...closures, newCl]);
                        showAdminToast("success", `System closure on ${newClosureDate} successfully scheduled!`);
                        setNewClosureReason("");
                      }}
                      className="bg-slate-50 border border-slate-150 rounded-2xl p-4.5 space-y-4"
                    >
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block leading-none">Schedule New Closure</span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* Closure Date Input */}
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Date</label>
                          <input 
                            type="date" 
                            value={newClosureDate}
                            onChange={(e) => setNewClosureDate(e.target.value)}
                            required
                            className="w-full bg-white border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-navy"
                          />
                        </div>

                        {/* Closure Scope selection */}
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Scope</label>
                          <select 
                            value={newClosureScope}
                            onChange={(e) => setNewClosureScope(e.target.value as any)}
                            className="w-full bg-white border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-navy cursor-pointer font-bold"
                          >
                            <option value="Full Facility">Full Facility</option>
                            <option value="Department Specific">Department Specific</option>
                          </select>
                        </div>
                      </div>

                      {/* If Department Specific, show Department Selection */}
                      {newClosureScope === "Department Specific" && (
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Select Affected Department</label>
                          <select 
                            value={newClosureDept}
                            onChange={(e) => setNewClosureDept(e.target.value)}
                            className="w-full bg-white border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-navy cursor-pointer"
                          >
                            {departments.map((d) => (
                              <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Closure Reason Input */}
                      <div>
                        <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Holiday or Closure Reason</label>
                        <input 
                          type="text" 
                          value={newClosureReason}
                          onChange={(e) => setNewClosureReason(e.target.value)}
                          placeholder="e.g. Independence Day Holiday"
                          required
                          className="w-full bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-navy"
                        />
                      </div>

                      {/* Action trigger button */}
                      <button
                        type="submit"
                        className="w-full bg-brand-navy hover:bg-brand-ocean text-white py-2 rounded-xl text-xs font-bold tracking-wide transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#00C3E3]" />
                        <span>Schedule Closure Slot</span>
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: DAILY SUMMARY */}
          {activeTab === "daily-summary" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Daily Summary Control Bar */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Department Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Filter:</span>
                    <select
                      value={summaryDeptFilter}
                      onChange={(e) => {
                        setSummaryDeptFilter(e.target.value);
                        showAdminToast("info", `Summary filtered by: ${e.target.value}`);
                      }}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-navy/10"
                    >
                      <option value="All">All Departments</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Date:</span>
                    <input
                      type="date"
                      value={summaryDate}
                      onChange={(e) => {
                        setSummaryDate(e.target.value);
                        showAdminToast("success", `Loading logs for ${e.target.value}...`);
                      }}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sync Action */}
                  <button
                    onClick={() => {
                      setSummaryIsSyncing(true);
                      setTimeout(() => {
                        setSummaryIsSyncing(false);
                        showAdminToast("success", "SLA records and operator counters synchronized with database.");
                      }, 1000);
                    }}
                    className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-brand-navy ${summaryIsSyncing ? "animate-spin" : ""}`} />
                    <span>Sync Live Metrics</span>
                  </button>

                  {/* Exporter Actions */}
                  <button
                    onClick={() => {
                      showAdminToast("success", "Exported complete CSV ledger: linely_daily_summary_ledger.csv");
                    }}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title="Export CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="bg-brand-navy hover:bg-brand-ocean text-white px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
                  >
                    <span className="material-symbols-outlined select-none text-[15px]">print</span>
                    <span>Print Report</span>
                  </button>
                </div>
              </div>

              {/* Top Row KPIs - Bento-Grid Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Ticket Volume Funnel */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-start justify-between relative overflow-hidden group">
                  <div className="space-y-3 z-10 w-full">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">Daily Ticket Funnel</span>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-rethink text-3xl font-black text-brand-navy leading-none">
                        {summaryDeptFilter === "All" ? "342" : summaryDeptFilter.startsWith("Billing") ? "102" : summaryDeptFilter.startsWith("Clinical") ? "95" : summaryDeptFilter.startsWith("Diagnostic") ? "39" : "106"}
                      </h3>
                      <span className="text-xs text-slate-400 font-bold">Checked-In</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 text-[10px] font-bold text-slate-400">
                      <div>
                        <span className="block text-emerald-600 font-extrabold">Served</span>
                        <span className="text-slate-700 block mt-0.5">
                          {summaryDeptFilter === "All" ? "312" : summaryDeptFilter.startsWith("Billing") ? "94" : summaryDeptFilter.startsWith("Clinical") ? "82" : summaryDeptFilter.startsWith("Diagnostic") ? "35" : "101"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-amber-600 font-extrabold">No-Show</span>
                        <span className="text-slate-700 block mt-0.5">
                          {summaryDeptFilter === "All" ? "18" : summaryDeptFilter.startsWith("Billing") ? "5" : summaryDeptFilter.startsWith("Clinical") ? "8" : summaryDeptFilter.startsWith("Diagnostic") ? "3" : "2"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-500 font-extrabold">Skipped</span>
                        <span className="text-slate-700 block mt-0.5">
                          {summaryDeptFilter === "All" ? "12" : summaryDeptFilter.startsWith("Billing") ? "3" : summaryDeptFilter.startsWith("Clinical") ? "5" : summaryDeptFilter.startsWith("Diagnostic") ? "1" : "3"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+12.4% vs. yesterday</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-brand-navy/5 rounded-xl flex items-center justify-center text-brand-navy border border-brand-navy/10 shrink-0">
                    <span className="material-symbols-outlined select-none text-[20px]">confirmation_number</span>
                  </div>
                </div>

                {/* 2. Wait Time Experience */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-start justify-between relative overflow-hidden group">
                  <div className="space-y-3 z-10 w-full">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">Average Wait Duration</span>
                    <div className="flex items-baseline gap-1">
                      <h3 className="font-rethink text-3xl font-black text-brand-navy leading-none">
                        {summaryDeptFilter === "All" ? "12m 45s" : summaryDeptFilter.startsWith("Billing") ? "11m 24s" : summaryDeptFilter.startsWith("Clinical") ? "22m 15s" : summaryDeptFilter.startsWith("Diagnostic") ? "18m 40s" : "04m 50s"}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-400">
                      <div>
                        <span className="block text-slate-400 uppercase font-semibold">Max Wait</span>
                        <span className="text-rose-600 font-extrabold block mt-0.5">
                          {summaryDeptFilter === "All" ? "28m 10s" : summaryDeptFilter.startsWith("Billing") ? "14m 05s" : summaryDeptFilter.startsWith("Clinical") ? "28m 10s" : summaryDeptFilter.startsWith("Diagnostic") ? "22m 30s" : "09m 15s"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-400 uppercase font-semibold">Min Wait</span>
                        <span className="text-slate-700 block mt-0.5">01m 12s</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                      <span className="material-symbols-outlined text-[13px]">arrow_downward</span>
                      <span>-2.5m below average</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-brand-navy/5 rounded-xl flex items-center justify-center text-brand-navy border border-brand-navy/10 shrink-0">
                    <span className="material-symbols-outlined select-none text-[20px]">hourglass_empty</span>
                  </div>
                </div>

                {/* 3. Service SLA Compliance */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-start justify-between relative overflow-hidden group">
                  <div className="space-y-3 z-10 w-full">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">SLA Compliance Rate</span>
                    <div className="flex items-baseline gap-1">
                      <h3 className="font-rethink text-3xl font-black text-brand-navy leading-none">
                        {summaryDeptFilter === "All" ? "93.8%" : summaryDeptFilter.startsWith("Billing") ? "95.1%" : summaryDeptFilter.startsWith("Clinical") ? "86.3%" : summaryDeptFilter.startsWith("Diagnostic") ? "89.7%" : "96.8%"}
                      </h3>
                      <span className="text-xs text-slate-400 font-bold">vs 90.0% Goal</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Target SLA</span>
                        <span className="text-brand-navy font-extrabold">Passed Goal</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-brand-cyan h-full rounded-full transition-all duration-500" 
                          style={{ width: summaryDeptFilter === "All" ? "93.8%" : summaryDeptFilter.startsWith("Billing") ? "95.1%" : summaryDeptFilter.startsWith("Clinical") ? "86.3%" : summaryDeptFilter.startsWith("Diagnostic") ? "89.7%" : "96.8%" }} 
                        />
                      </div>
                    </div>

                    <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md w-fit ${
                      summaryDeptFilter.startsWith("Clinical") || summaryDeptFilter.startsWith("Diagnostic")
                        ? "text-amber-700 bg-amber-50"
                        : "text-emerald-700 bg-emerald-50"
                    }`}>
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      <span>
                        {summaryDeptFilter.startsWith("Clinical") ? "SLA Alert Warning" : "Optimal Compliance"}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-brand-navy/5 rounded-xl flex items-center justify-center text-brand-navy border border-brand-navy/10 shrink-0">
                    <span className="material-symbols-outlined select-none text-[20px]">verified</span>
                  </div>
                </div>

                {/* 4. Average Service Time */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-start justify-between relative overflow-hidden group">
                  <div className="space-y-3 z-10 w-full">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 block">Avg. Service Duration</span>
                    <div className="flex items-baseline gap-1">
                      <h3 className="font-rethink text-3xl font-black text-brand-navy leading-none">
                        {summaryDeptFilter === "All" ? "06m 18s" : summaryDeptFilter.startsWith("Billing") ? "03m 45s" : summaryDeptFilter.startsWith("Clinical") ? "12m 10s" : summaryDeptFilter.startsWith("Diagnostic") ? "09m 05s" : "03m 22s"}
                      </h3>
                      <span className="text-xs text-slate-400 font-semibold">AST</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-400">
                      <div>
                        <span className="block text-slate-400 uppercase font-semibold">Efficiency</span>
                        <span className="text-emerald-600 font-extrabold block mt-0.5">120% Optimum</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 uppercase font-semibold">Active Counters</span>
                        <span className="text-slate-700 block mt-0.5">6/6 Terminals</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                      <span className="material-symbols-outlined text-[13px]">timer</span>
                      <span>Standard service rate</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-brand-navy/5 rounded-xl flex items-center justify-center text-brand-navy border border-brand-navy/10 shrink-0">
                    <span className="material-symbols-outlined select-none text-[20px]">schedule</span>
                  </div>
                </div>

              </div>

              {/* Main Visuals: Charts & Gateway Monitors */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Chart - Left/Middle (span-2) */}
                <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="font-rethink text-base font-bold text-brand-navy">Hourly Operational Flow</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {summaryChartMode === "traffic" 
                          ? "Real-time arrival density against successful client sessions served."
                          : "Hourly wait duration averages vs actual service minutes."}
                      </p>
                    </div>

                    {/* Chart Mode Toggles */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 p-1 rounded-xl">
                      <button
                        onClick={() => setSummaryChartMode("traffic")}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          summaryChartMode === "traffic" 
                            ? "bg-white text-brand-navy shadow-sm border border-slate-200/50" 
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        Traffic Volume
                      </button>
                      <button
                        onClick={() => setSummaryChartMode("service-time")}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          summaryChartMode === "service-time" 
                            ? "bg-white text-brand-navy shadow-sm border border-slate-200/50" 
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        Wait vs Service
                      </button>
                    </div>
                  </div>

                  {summaryChartMode === "traffic" ? (
                    /* Traffic volume chart */
                    <div className="space-y-6">
                      <div className="relative h-60 w-full flex items-end gap-5 pt-6 border-b border-slate-200 px-2 font-mono">
                        {[
                          { hour: "08:00 AM", checkins: 32, served: 28, abandoned: 4 },
                          { hour: "10:00 AM", checkins: 78, served: 68, abandoned: 10 },
                          { hour: "12:00 PM", checkins: 94, served: 82, abandoned: 12 },
                          { hour: "02:00 PM", checkins: 58, served: 54, abandoned: 4 },
                          { hour: "04:00 PM", checkins: 80, served: 76, abandoned: 4 },
                        ].map((item, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2 relative group">
                            <div className="w-full flex justify-center items-end gap-1.5 h-full">
                              {/* Check-ins Bar */}
                              <div 
                                className="bg-brand-navy w-4 rounded-t-md transition-all duration-500 hover:opacity-85 relative"
                                style={{ height: `${(item.checkins / 100) * 100}%` }}
                                title={`Check-ins: ${item.checkins}`}
                              />
                              {/* Served Bar */}
                              <div 
                                className="bg-brand-cyan w-4 rounded-t-md transition-all duration-500 hover:opacity-85 relative"
                                style={{ height: `${(item.served / 100) * 100}%` }}
                                title={`Served: ${item.served}`}
                              />
                              {/* Abandoned Bar */}
                              <div 
                                className="bg-rose-400 w-2.5 rounded-t-md transition-all duration-500 hover:opacity-85 relative"
                                style={{ height: `${(item.abandoned / 100) * 100}%` }}
                                title={`Abandoned: ${item.abandoned}`}
                              />
                            </div>
                            <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap mt-2 block shrink-0">{item.hour}</span>
                          </div>
                        ))}
                      </div>

                      {/* Legends */}
                      <div className="flex flex-wrap items-center gap-5 justify-center text-xs font-bold text-slate-500 pt-2">
                        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-brand-navy rounded-md" /> Check-ins</span>
                        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-brand-cyan rounded-md" /> Served Sessions</span>
                        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-rose-400 rounded-md" /> Abandoned/No-Shows</span>
                      </div>
                    </div>
                  ) : (
                    /* Service vs Wait duration chart */
                    <div className="space-y-6">
                      <div className="relative h-60 w-full flex items-end gap-5 pt-6 border-b border-slate-200 px-2 font-mono">
                        {[
                          { hour: "08:00 AM", wait: 8, service: 5 },
                          { hour: "10:00 AM", wait: 16, service: 7 },
                          { hour: "12:00 PM", wait: 24, service: 9 },
                          { hour: "02:00 PM", wait: 11, service: 6 },
                          { hour: "04:00 PM", wait: 15, service: 7 },
                        ].map((item, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2 relative group">
                            <div className="w-full flex justify-center items-end gap-2 h-full">
                              {/* Wait Duration Bar */}
                              <div 
                                className="bg-brand-navy/40 border border-brand-navy/60 w-5 rounded-t-md transition-all duration-500 hover:bg-brand-navy/60 relative"
                                style={{ height: `${(item.wait / 30) * 100}%` }}
                                title={`Avg Wait: ${item.wait} mins`}
                              />
                              {/* Service Duration Bar */}
                              <div 
                                className="bg-brand-cyan w-5 rounded-t-md transition-all duration-500 hover:opacity-95 relative"
                                style={{ height: `${(item.service / 30) * 100}%` }}
                                title={`Avg Service: ${item.service} mins`}
                              />
                            </div>
                            <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap mt-2 block shrink-0">{item.hour}</span>
                          </div>
                        ))}
                      </div>

                      {/* Legends */}
                      <div className="flex flex-wrap items-center gap-5 justify-center text-xs font-bold text-slate-500 pt-2">
                        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-brand-navy/40 border border-brand-navy/60 rounded-md" /> Average Wait (Mins)</span>
                        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-brand-cyan rounded-md" /> Average Process/Service (Mins)</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-3 bg-brand-navy/5 p-4 rounded-xl">
                    <span className="material-symbols-outlined text-brand-navy shrink-0" style={{ fontSize: "20px" }}>analytics</span>
                    <div>
                      <h5 className="font-rethink text-xs font-black text-brand-navy uppercase tracking-widest">Congestion Peak Analytics Insight</h5>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Daily summary trends confirm high customer arrival concentration between <strong className="text-slate-700">10:30 AM and 12:45 PM</strong>. During these hours, SLA breach alert triggered 4 times. Preemptively assign temporary support operators during this critical lunch window to maintain SLA compliance above 90%.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gateway Congestion & Channels status - Right (span-1) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-brand-navy" style={{ fontSize: "18px" }}>sensors</span>
                      <h4 className="font-rethink text-base font-bold text-brand-navy">Gateway & Hardware Channels</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6">Real-time telemetry feeds for local terminal channels and kiosks.</p>

                    <div className="space-y-4">
                      {/* SMS Notification Channel */}
                      <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-emerald-600 text-[18px]">sms</span>
                          <div>
                            <span className="text-xs font-bold text-slate-700 block leading-none">SMS Push Dispatcher</span>
                            <span className="text-[10px] text-slate-400 mt-1 block">99.4% Delivery rate</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700">ACTIVE</span>
                      </div>

                      {/* Ticket Kiosk Printer Roll */}
                      <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-amber-600 text-[18px]">print_connect</span>
                            <div>
                              <span className="text-xs font-bold text-slate-700 block leading-none">Lobby Kiosk Printer</span>
                              <span className="text-[10px] text-slate-400 mt-1 block">Paper roll volume</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700">LOW WARN</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: "15%" }} />
                        </div>
                        <span className="text-[9px] text-slate-400 text-right block font-semibold">15% paper remaining</span>
                      </div>

                      {/* Chime Announcer Gateway */}
                      <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-brand-navy text-[18px]">volume_up</span>
                          <div>
                            <span className="text-xs font-bold text-slate-700 block leading-none">Voice Audio Chime TTS</span>
                            <span className="text-[10px] text-slate-400 mt-1 block">Online chimes</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700">CONNECTED</span>
                      </div>

                      {/* LCD Lobby Display Sync */}
                      <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#00C3E3] text-[18px]">tv</span>
                          <div>
                            <span className="text-xs font-bold text-slate-700 block leading-none">Lobby TV Screens</span>
                            <span className="text-[10px] text-slate-400 mt-1 block">Frames synced (60fps)</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700">LIVE SYNCED</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>Server Node Ingress</span>
                    <span className="text-slate-600 font-mono">NODE_US_EAST_01</span>
                  </div>
                </div>

              </div>

              {/* Department Performance Matrix Table */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h4 className="font-rethink text-base font-bold text-brand-navy">Department Performance Matrix</h4>
                    <p className="text-xs text-slate-400 mt-1">Cross-department operations, wait durations, and target SLA deviations.</p>
                  </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-150 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        <th className="pb-4">Department Name</th>
                        <th className="pb-4">Ticket Volume</th>
                        <th className="pb-4">Completed / Served</th>
                        <th className="pb-4">Average Wait Time</th>
                        <th className="pb-4">Average Service Time</th>
                        <th className="pb-4">Target SLA Limit</th>
                        <th className="pb-4">SLA Compliance Rate</th>
                        <th className="pb-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                      {[
                        { name: "Billing & Registration", total: 102, served: 94, wait: "11m 24s", service: "03m 45s", target: "15m 00s", compliance: "95.1%", breaches: 5, status: "Optimal" },
                        { name: "Clinical Consultation", total: 95, served: 82, wait: "22m 15s", service: "12m 10s", target: "25m 00s", compliance: "86.3%", breaches: 13, status: "Warning" },
                        { name: "Diagnostic Imaging", total: 39, served: 35, wait: "18m 40s", service: "09m 05s", target: "20m 00s", compliance: "89.7%", breaches: 4, status: "Optimal" },
                        { name: "Pharmacy & Dispensary", total: 106, served: 101, wait: "04m 50s", service: "03m 22s", target: "10m 00s", compliance: "96.8%", breaches: 3, status: "Optimal" },
                      ].map((dept, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-all font-rethink">
                          <td className="py-4.5 font-bold text-brand-navy text-sm flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-brand-navy/5 text-brand-navy flex items-center justify-center font-black text-[11px] border border-brand-navy/10">
                              {dept.name.charAt(0)}
                            </span>
                            <span>{dept.name}</span>
                          </td>
                          <td className="py-4.5 font-bold text-slate-700">{dept.total}</td>
                          <td className="py-4.5 font-semibold text-slate-500">
                            <span className="text-emerald-600 font-extrabold">{dept.served}</span>
                            <span className="mx-1 text-slate-300">/</span>
                            <span>{dept.total}</span>
                          </td>
                          <td className="py-4.5 font-mono text-slate-600">{dept.wait}</td>
                          <td className="py-4.5 font-mono text-slate-600">{dept.service}</td>
                          <td className="py-4.5 font-mono text-slate-400">{dept.target}</td>
                          <td className="py-4.5">
                            <div className="flex items-center gap-2">
                              <span className={`font-black text-sm ${dept.status === "Warning" ? "text-amber-600" : "text-brand-navy"}`}>{dept.compliance}</span>
                              <span className="text-[10px] text-slate-400 font-bold block">({dept.breaches} breaches)</span>
                            </div>
                          </td>
                          <td className="py-4.5 text-right">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              dept.status === "Optimal" 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                : "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}>
                              {dept.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Operator Performance Leaderboard & Operations Panel */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-150">
                  <div>
                    <h4 className="font-rethink text-base font-bold text-brand-navy">Counter Operator Performance Leaderboard</h4>
                    <p className="text-xs text-slate-400 mt-1">SLA scores, ticket volumes, and active operational status logs.</p>
                  </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-150 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        <th className="pb-4">Operator Name</th>
                        <th className="pb-4">Mapped Counter</th>
                        <th className="pb-4">Department / SLA Scope</th>
                        <th className="pb-4">Completed Tickets</th>
                        <th className="pb-4">Average Process (AST)</th>
                        <th className="pb-4">Customer Star Rating</th>
                        <th className="pb-4">SLA Compliance Rate</th>
                        <th className="pb-4 text-right">Operations Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                      {[
                        { id: "op1", name: "Marcus Brody", counter: "Counter 01", dept: "Billing & Registration", completed: 84, service: "03m 45s", rating: 4.8, compliance: "96.2%", status: "Active" },
                        { id: "op2", name: "Sarah Jenkins", counter: "Counter 02", dept: "Clinical Consultation", completed: 32, service: "14m 45s", rating: 4.9, compliance: "83.5%", status: "Break" },
                        { id: "op3", name: "Elena Rostova", counter: "Counter 03", dept: "Billing & Registration", completed: 78, service: "04m 12s", rating: 4.5, compliance: "93.1%", status: "Active" },
                        { id: "op4", name: "Jordan Vance", counter: "Counter 04", dept: "Diagnostic Imaging", completed: 35, service: "09m 05s", rating: 4.7, compliance: "89.7%", status: "Active" },
                        { id: "op5", name: "Amira Patel", counter: "Counter 05", dept: "Pharmacy & Dispensary", completed: 101, service: "03m 22s", rating: 4.6, compliance: "96.8%", status: "Idle" },
                        { id: "op6", name: "Kenji Sato", counter: "Counter 06", dept: "Clinical Consultation", completed: 50, service: "11m 15s", rating: 4.9, compliance: "88.2%", status: "Active" },
                      ].map((op, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-all font-rethink">
                          <td className="py-4 font-bold text-brand-navy flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              op.status === "Active" ? "bg-emerald-500 animate-pulse" : op.status === "Break" ? "bg-amber-500" : "bg-slate-300"
                            }`} />
                            <div>
                              <span className="block text-sm font-black text-[#0D1A5E]">{op.name}</span>
                              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{op.status}</span>
                            </div>
                          </td>
                          <td className="py-4 font-bold text-slate-700">{op.counter}</td>
                          <td className="py-4 font-semibold text-slate-500">{op.dept}</td>
                          <td className="py-4 font-bold text-brand-ocean text-sm">{op.completed}</td>
                          <td className="py-4 font-mono font-bold text-slate-600">{op.service}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-1 font-bold text-slate-700">
                              <span className="material-symbols-outlined text-[15px] text-amber-500 fill-current">star</span>
                              <span>{op.rating.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`font-extrabold text-sm ${op.compliance.startsWith("83") || op.compliance.startsWith("88") ? "text-amber-600" : "text-emerald-600"}`}>
                              {op.compliance}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => {
                                setSummaryNudges(prev => ({ ...prev, [op.id]: true }));
                                showAdminToast("success", `Attention nudge sent to ${op.name} screen.`);
                              }}
                              disabled={summaryNudges[op.id]}
                              className={`px-3 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                                summaryNudges[op.id] 
                                  ? "bg-slate-100 text-slate-400 border border-slate-200" 
                                  : "bg-brand-navy/5 text-brand-navy hover:bg-brand-navy/10 active:scale-95 border border-brand-navy/10"
                              }`}
                            >
                              {summaryNudges[op.id] ? "✓ Nudged" : "Nudge Alert"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Real-time Customer Journey Audit Ledger */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-navy" style={{ fontSize: "20px" }}>history</span>
                    <h4 className="font-rethink text-base font-bold text-brand-navy">Today's Customer Journey Ledger</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Updates live every 30s</span>
                </div>

                <div className="max-h-80 overflow-y-auto no-scrollbar space-y-3.5 pr-2">
                  {[
                    { time: "03:22 PM", ticket: "P-212", customer: "Hannah Abbott", dept: "Pharmacy & Dispensary", action: "Served & Completed", duration: "04:05 service", op: "Amira Patel (Counter 05)", type: "completed" },
                    { time: "03:20 PM", ticket: "B-105", customer: "Timothy Dalton", dept: "Billing & Registration", action: "Marked No-Show / Discarded", duration: "11m 24s wait", op: "Marcus Brody (Counter 01)", type: "no-show" },
                    { time: "03:19 PM", ticket: "C-408", customer: "Rachel Green", dept: "Clinical Consultation", action: "Called to counter", duration: "Active", op: "Kenji Sato (Counter 06)", type: "called" },
                    { time: "03:14 PM", ticket: "B-102", customer: "Arthur Pendelton", dept: "Billing & Registration", action: "Served & Completed", duration: "04:12 service", op: "Marcus Brody (Counter 01)", type: "completed" },
                    { time: "03:10 PM", ticket: "C-405", customer: "Clara Oswald", dept: "Clinical Consultation", action: "Served & Completed", duration: "14m 45s service", op: "Kenji Sato (Counter 06)", type: "completed" },
                    { time: "03:05 PM", ticket: "P-209", customer: "Dmitri Volkov", dept: "Pharmacy & Dispensary", action: "Served & Completed", duration: "03:22 service", op: "Amira Patel (Counter 05)", type: "completed" },
                    { time: "02:59 PM", ticket: "D-112", customer: "Eleanor Vance", dept: "Diagnostic Imaging", action: "Served & Completed", duration: "12m 10s service", op: "Jordan Vance (Counter 04)", type: "completed" },
                    { time: "02:50 PM", ticket: "B-103", customer: "Felix Henderson", dept: "Billing & Registration", action: "Marked No-Show / Discarded", duration: "14m 05s wait", op: "Elena Rostova (Counter 03)", type: "no-show" },
                  ].map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors font-rethink">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          log.type === "completed" 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                            : log.type === "no-show" 
                            ? "bg-rose-50 text-rose-600 border border-rose-100" 
                            : "bg-blue-50 text-blue-600 border border-blue-100"
                        }`}>
                          <span className="material-symbols-outlined text-[18px]">
                            {log.type === "completed" ? "check" : log.type === "no-show" ? "close" : "campaign"}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-brand-navy text-white text-[10px] font-black tracking-wide font-mono">
                              {log.ticket}
                            </span>
                            <span className="text-xs font-bold text-slate-700">{log.customer}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {log.dept} • {log.op}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-700 block">{log.action}</span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                          {log.time} • {log.duration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 3: PEAK HOURS HEATMAP - HIGH FIDELITY CALENDAR DESIGN REDESIGN */}
          {activeTab === "peak-heatmap" && (() => {
            const getHeatmapCells = (dept: string, metric: "volume" | "wait-time" | "utilization") => {
              const cells: { level: number; val: number | null }[][] = [];
              let deptFactor = 1.0;
              if (dept === "Billing & Registration") deptFactor = 1.1;
              else if (dept === "Clinical Consultation") deptFactor = 1.5;
              else if (dept === "Diagnostic Imaging") deptFactor = 0.7;
              else if (dept === "Pharmacy & Dispensary") deptFactor = 1.3;

              for (let r = 0; r < 7; r++) {
                const rowCells: { level: number; val: number | null }[] = [];
                const dayFactors = [1.3, 1.0, 1.2, 0.9, 1.4, 0.6, 0.4];
                const dayFactor = dayFactors[r];

                for (let c = 0; c < 19; c++) {
                  const monthTrend = 0.8 + (c * 0.025);
                  const isWinter = [0, 1, 10, 11, 12, 13].includes(c);
                  const seasonFactor = isWinter ? 1.15 : 0.95;

                  let rawScore = 26 * deptFactor * dayFactor * monthTrend * seasonFactor;
                  const wave = Math.sin((r * 2.2 + c * 1.6) * Math.PI / 4.2) * 8.5;
                  rawScore = Math.max(5, rawScore + wave);

                  let level = 0;
                  let val: number | null = null;

                  if (metric === "volume") {
                    const vol = Math.round(rawScore * 2.2);
                    if ([3, 6, 8, 11, 14, 16, 18].includes(c) && r % 2 === 0) {
                      val = vol;
                    }
                    if (vol < 25) level = 0;
                    else if (vol < 45) level = 1;
                    else if (vol < 75) level = 2;
                    else if (vol < 105) level = 3;
                    else if (vol < 135) level = 4;
                    else level = 5;
                  } else if (metric === "wait-time") {
                    const wait = Math.round(rawScore * (dept === "Clinical Consultation" ? 0.7 : 0.42));
                    if ([3, 6, 8, 11, 14, 16, 18].includes(c) && r % 2 === 0) {
                      val = wait;
                    }
                    if (wait < 8) level = 0;
                    else if (wait < 14) level = 1;
                    else if (wait < 20) level = 2;
                    else if (wait < 26) level = 3;
                    else if (wait < 32) level = 4;
                    else level = 5;
                  } else {
                    const util = Math.min(99, Math.round(40 + rawScore * 1.1));
                    if ([3, 6, 8, 11, 14, 16, 18].includes(c) && r % 2 === 0) {
                      val = util;
                    }
                    if (util < 55) level = 0;
                    else if (util < 68) level = 1;
                    else if (util < 78) level = 2;
                    else if (util < 88) level = 3;
                    else if (util < 94) level = 4;
                    else level = 5;
                  }

                  rowCells.push({ level, val });
                }
                cells.push(rowCells);
              }
              return cells;
            };

            const getHourlyData = (dept: string, metric: "volume" | "wait-time" | "utilization") => {
              let baseValues = [9, 15, 22, 18, 12, 14, 8, 15];
              let multiplier = 1.0;
              if (dept === "Clinical Consultation") multiplier = 1.4;
              else if (dept === "Pharmacy & Dispensary") multiplier = 1.25;
              else if (dept === "Diagnostic Imaging") multiplier = 0.75;
              else if (dept === "Billing & Registration") multiplier = 1.1;

              if (metric === "wait-time") {
                baseValues = [12, 18, 32, 24, 15, 20, 10, 16];
              } else if (metric === "utilization") {
                baseValues = [45, 68, 92, 85, 62, 74, 48, 58];
              }
              return baseValues.map(v => Math.round(v * multiplier));
            };

            const getMonthlyData = (dept: string, metric: "volume" | "wait-time" | "utilization") => {
              let baseValues = [130, 115, 100, 200, 125, 95, 85, 150];
              let multiplier = 1.0;
              if (dept === "Clinical Consultation") multiplier = 1.35;
              else if (dept === "Pharmacy & Dispensary") multiplier = 1.2;
              else if (dept === "Diagnostic Imaging") multiplier = 0.8;
              else if (dept === "Billing & Registration") multiplier = 1.1;

              if (metric === "wait-time") {
                baseValues = [18, 16, 14, 28, 19, 15, 13, 22];
              } else if (metric === "utilization") {
                baseValues = [65, 58, 52, 90, 64, 48, 42, 75];
              }
              return baseValues.map(v => Math.round(v * multiplier));
            };

            const getRecommendations = (dept: string) => {
              if (dept === "Clinical Consultation") {
                return [
                  {
                    id: "cc-1",
                    title: "Deploy Floating Specialist to Counter 02",
                    description: "Wednesday morning heat index reached Level 5 due to surge in specialized consultation needs. Assigning a specialist can reduce wait time by up to 12 minutes.",
                    impact: "SLA improvement: +14.2%",
                    type: "staffing",
                    actionText: "Deploy Floating Operator"
                  },
                  {
                    id: "cc-2",
                    title: "Stagger Consultation Lunch Shifts",
                    description: "Midday bottleneck (12:00 PM - 2:00 PM) observed across both 2023 and 2024 profiles. Shift overlapping lunch hours to maintain minimum 3 active counters.",
                    impact: "Peak Wait Reductions: -25%",
                    type: "schedule",
                    actionText: "Enforce Staggered Schedule"
                  },
                  {
                    id: "cc-3",
                    title: "Pre-screen Appointment Check-Ins",
                    description: "High rate of no-shows and skips (up to 12) recorded on Clinical Consultation desk on busy days. Implement automated SMS confirmation 1 hour prior.",
                    impact: "No-show rate reduction: -40%",
                    type: "system",
                    actionText: "Enable Auto SMS Confirmations"
                  }
                ];
              } else if (dept === "Billing & Registration") {
                return [
                  {
                    id: "br-1",
                    title: "Activate Self-Service Kiosk Overflow Routing",
                    description: "Monday morning arrival volume (08:00 AM - 10:00 AM) frequently exceeds operator SLA capacity. Auto-route simple registrations to Kiosk 01 and 02.",
                    impact: "Queue Congestion: -30%",
                    type: "system",
                    actionText: "Enable Kiosk Overflow"
                  },
                  {
                    id: "br-2",
                    title: "Extend Early Morning Staffing Shift",
                    description: "Billing registers a high backlog early in the day. Start Shift 'Morning Peak' 30 minutes earlier with a dedicated check-in assistant.",
                    impact: "Early SLA compliance: +8.5%",
                    type: "staffing",
                    actionText: "Extend Morning Shift"
                  }
                ];
              } else if (dept === "Pharmacy & Dispensary") {
                return [
                  {
                    id: "pd-1",
                    title: "Enable Express Checkout for Level 1 Prescriptions",
                    description: "Dispensary queue experiences critical bottlenecks on Friday afternoon (Level 5 stress index). Enable single-item rapid checkout routing on Counter 05.",
                    impact: "Average Service Time: -4.5m",
                    type: "routing",
                    actionText: "Deploy Express Checkout"
                  },
                  {
                    id: "pd-2",
                    title: "Integrate Real-Time Queue Chimes on Counter 06",
                    description: "Pharmacy staff alert lag adds 40 seconds between patient transactions. Synchronize chime and visual call-board alerts on Counter 06.",
                    impact: "Operator overhead reduction: -18%",
                    type: "system",
                    actionText: "Synchronize Alerts"
                  }
                ];
              } else if (dept === "Diagnostic Imaging") {
                return [
                  {
                    id: "di-1",
                    title: "Balance MRI & X-Ray Patient Routing Mode",
                    description: "Load-balanced routing Mode is causing uneven scanner utilization on busy Thursdays. Swapping to SLA-Optimized mode reduces scanner idle times.",
                    impact: "Scanner Utilization: +12%",
                    type: "routing",
                    actionText: "Apply SLA-Optimized Mode"
                  }
                ];
              } else {
                return [
                  {
                    id: "all-1",
                    title: "Cross-Train Floor Staff for Multitasking Float Roles",
                    description: "Longitudinal data indicates high cross-day variance across departments. Training operators to switch from Imaging to Billing registers high overall efficiency.",
                    impact: "Average Facility SLA: +6.8%",
                    type: "staffing",
                    actionText: "Initiate Training Shift"
                  },
                  {
                    id: "all-2",
                    title: "Adjust Global SMS Notifications Delay",
                    description: "Patients tend to wait in the main atrium, leading to perceived crowding. Send SMS notification 3 slots early instead of 1 slot early.",
                    impact: "Atrium Crowding: -22%",
                    type: "system",
                    actionText: "Update SMS Buffer"
                  },
                  {
                    id: "all-3",
                    title: "Deploy Automated Daily Heatmap Digest Reports",
                    description: "Keep operators in sync with weekly peak schedules by sending automatic slack/email alerts 24 hours prior to predicted high-volume days.",
                    impact: "Operator preparedness: +95%",
                    type: "system",
                    actionText: "Activate Daily Digests"
                  }
                ];
              }
            };

            const defaultCells = getHeatmapCells(heatmapSelectedDept, heatmapSelectedMetric);

            const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
            
            const monthLabels = [
              { label: "JAN", is2024: false, colIdx: 0 },
              { label: "FEB", is2024: false, colIdx: 1 },
              { label: "MAR", is2024: false, colIdx: 2 },
              { label: "APR", is2024: false, colIdx: 3 },
              { label: "MAY", is2024: false, colIdx: 4 },
              { label: "JUN", is2024: false, colIdx: 5 },
              { label: "JUL", is2024: false, colIdx: 6 },
              { label: "AUG", is2024: false, colIdx: 7 },
              { label: "SEP", is2024: false, colIdx: 8 },
              { label: "OCT", is2024: false, colIdx: 9 },
              { label: "NOV", is2024: false, colIdx: 10 },
              { label: "DEC", is2024: false, colIdx: 11 },
              { label: "JAN", is2024: true, colIdx: 12 },
              { label: "FEB", is2024: true, colIdx: 13 },
              { label: "MAR", is2024: true, colIdx: 14 },
              { label: "APR", is2024: true, colIdx: 15 },
              { label: "MAY", is2024: true, colIdx: 16 },
              { label: "JUN", is2024: true, colIdx: 17 },
              { label: "JUL", is2024: true, colIdx: 18 },
            ];

            // Helper to determine background color style based on cell level
            const getCellColorClass = (level: number) => {
              switch (level) {
                case 1:
                  return "bg-[#D7D5FC] hover:brightness-95";
                case 2:
                  return "bg-[#BEB1FB] hover:brightness-95";
                case 3:
                  return "bg-[#9D84F7] hover:brightness-95";
                case 4:
                  return "bg-[#7B59F5] hover:bg-[#6844E0] text-white font-black shadow-md shadow-purple-500/10";
                case 5:
                  return "bg-[#2E333D] hover:bg-[#20242B] text-white";
                case 0:
                default:
                  return "bg-[#EAEBEF] hover:brightness-95";
              }
            };

            // Handler to save individual cell overrides
            const handleSaveCellChanges = (r: number, c: number, newLevel: number, newValueStr: string) => {
              const valNum = newValueStr === "" ? null : parseInt(newValueStr, 10);
              const cellKey = `${r}-${c}`;
              setCustomHeatmapValues(prev => ({
                ...prev,
                [cellKey]: {
                  level: newLevel,
                  value: isNaN(valNum as number) ? undefined : (valNum ?? undefined)
                }
              }));
              setEditingCellCoords(null);
              showAdminToast("success", `Cell [Row ${weekdays[r]}, Col ${monthLabels[c].label}] updated live!`);
            };

            // Handler to reset custom overrides
            const handleResetGrid = () => {
              setCustomHeatmapValues({});
              setHeatmapYearTitle2023("2023");
              setHeatmapSubtitle2023("Long-Term Arrival Density");
              setHeatmapYearTitle2024("2024");
              setHeatmapSubtitle2024("Active Operational Stress Index");
              setHeatmapSelectedTimeframe("Last 7 days");
              showAdminToast("info", "Heatmap layout reset to default values.");
            };

            // Randomize grid values for an amazing, real interactive experience
            const handleRandomizeGrid = () => {
              const randomOverrides: Record<string, { value?: number; level?: number }> = {};
              for (let r = 0; r < 7; r++) {
                for (let c = 0; c < 19; c++) {
                  const randLevel = Math.floor(Math.random() * 6); // 0 to 5
                  let randVal = null;
                  if (randLevel === 4) {
                    randVal = [32, 64, 128, 256][Math.floor(Math.random() * 4)];
                  }
                  randomOverrides[`${r}-${c}`] = {
                    level: randLevel,
                    value: randVal ?? undefined
                  };
                }
              }
              setCustomHeatmapValues(randomOverrides);
              showAdminToast("success", "Heatmap data randomized live!");
            };

            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-8 p-1 sm:p-4 rounded-3xl bg-[#FAF8F5] border border-[#F0ECE3]"
              >
                
                {/* 1. BRANDING, FILTERS, & TIME FILTER HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-2">
                  <div className="flex items-center gap-4">
                    {/* Letter H circular avatar */}
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-xl bg-[#9881E6] shadow-sm">
                      H
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight text-slate-800 font-sans">Heatmap</h2>
                      <p className="text-xs text-slate-400 font-medium">Real-time arrival concentration and traffic velocity index</p>
                    </div>
                  </div>

                  {/* Filter Controllers: Department & Metric & Timeframe */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Department Filter */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-3.5 py-2 rounded-full shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dept:</span>
                      <select
                        value={heatmapSelectedDept}
                        onChange={(e) => {
                          setHeatmapSelectedDept(e.target.value);
                          showAdminToast("info", `Heatmap department: ${e.target.value}`);
                        }}
                        className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 focus:outline-none cursor-pointer"
                      >
                        <option value="All Departments">All Departments</option>
                        <option value="Billing & Registration">Billing & Registration</option>
                        <option value="Clinical Consultation">Clinical Consultation</option>
                        <option value="Diagnostic Imaging">Diagnostic Imaging</option>
                        <option value="Pharmacy & Dispensary">Pharmacy & Dispensary</option>
                      </select>
                    </div>

                    {/* Metric Filter */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-3.5 py-2 rounded-full shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metric:</span>
                      <select
                        value={heatmapSelectedMetric}
                        onChange={(e) => {
                          setHeatmapSelectedMetric(e.target.value as any);
                          showAdminToast("info", `Heatmap metric: ${e.target.value}`);
                        }}
                        className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 focus:outline-none cursor-pointer"
                      >
                        <option value="volume">Arrival Volume</option>
                        <option value="wait-time">Average Wait Time</option>
                        <option value="utilization">Counter Utilization</option>
                      </select>
                    </div>

                    {/* Timeframe Filter Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setTimeframeDropdownOpen(!timeframeDropdownOpen)}
                        className="bg-white border border-slate-200/85 px-5 py-2 rounded-full font-bold text-xs text-slate-600 flex items-center gap-2 cursor-pointer shadow-sm hover:border-slate-300 transition-all"
                      >
                        <span>{heatmapSelectedTimeframe}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>

                      <AnimatePresence>
                        {timeframeDropdownOpen && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setTimeframeDropdownOpen(false)} 
                            />
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50 overflow-hidden"
                            >
                              {["Last 7 days", "Last 30 days", "Month-to-Date", "Year-to-Date"].map((tf) => (
                                <button
                                  key={tf}
                                  onClick={() => {
                                    setHeatmapSelectedTimeframe(tf);
                                    setTimeframeDropdownOpen(false);
                                    showAdminToast("success", `Heatmap filtered by: ${tf}`);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                                    heatmapSelectedTimeframe === tf 
                                      ? "bg-[#FAF8F5] text-[#7B59F5] font-extrabold" 
                                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                  }`}
                                >
                                  {tf}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* 2. THE MAIN CALENDAR HEATMAP CARD */}
                <div className="bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 shadow-md relative overflow-hidden">
                  
                  {/* Decorative background gradients */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-purple-100/10 rounded-full filter blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-100/10 rounded-full filter blur-3xl pointer-events-none" />

                  {/* Year Headers & Settings Toggle */}
                  <div className="flex items-start justify-between mb-8 pb-4 border-b border-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                      
                      {/* Year 2023 Header */}
                      <div className="space-y-1">
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{heatmapYearTitle2023}</h3>
                        <p className="text-sm font-medium text-slate-400">{heatmapSubtitle2023}</p>
                      </div>

                      {/* Year 2024 Header */}
                      <div className="space-y-1">
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{heatmapYearTitle2024}</h3>
                        <p className="text-sm font-medium text-slate-400">{heatmapSubtitle2024}</p>
                      </div>

                    </div>

                    {/* Interactive Cog Settings Icon */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingHeatmapHeaders(!isEditingHeatmapHeaders)}
                        className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                          isEditingHeatmapHeaders 
                            ? "bg-[#7B59F5]/10 border-[#7B59F5] text-[#7B59F5]" 
                            : "bg-slate-50 border-slate-150 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        }`}
                        title="Customize Year Titles and Subtitles"
                      >
                        <Settings className={`w-5 h-5 ${isEditingHeatmapHeaders ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* HEADER CUSTOMIZER PANEL (INLINE) */}
                  <AnimatePresence>
                    {isEditingHeatmapHeaders && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-6"
                      >
                        <div className="bg-[#FAF8F5] border border-[#F0ECE3] rounded-2xl p-5 space-y-4 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-700 uppercase tracking-wider">Configure Dashboard Texts</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleRandomizeGrid}
                                className="bg-white border border-slate-200 hover:border-purple-300 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[10px]"
                              >
                                Randomize Grid Data
                              </button>
                              <button
                                onClick={handleResetGrid}
                                className="bg-white border border-slate-200 hover:border-red-200 text-red-600 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[10px]"
                              >
                                Reset Settings
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                              <label className="font-bold text-slate-500">2023 Title</label>
                              <input
                                type="text"
                                value={heatmapYearTitle2023}
                                onChange={(e) => setHeatmapYearTitle2023(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-[#7B59F5]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-bold text-slate-500">2023 Subtitle</label>
                              <input
                                type="text"
                                value={heatmapSubtitle2023}
                                onChange={(e) => setHeatmapSubtitle2023(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-[#7B59F5]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-bold text-slate-500">2024 Title</label>
                              <input
                                type="text"
                                value={heatmapYearTitle2024}
                                onChange={(e) => setHeatmapYearTitle2024(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-[#7B59F5]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-bold text-slate-500">2024 Subtitle</label>
                              <input
                                type="text"
                                value={heatmapSubtitle2024}
                                onChange={(e) => setHeatmapSubtitle2024(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-[#7B59F5]"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* HEATMAP MAIN GRID CONTAINER */}
                  <div className="overflow-x-auto no-scrollbar pb-3">
                    <div className="min-w-[960px] flex gap-4">
                      
                      {/* Left: Cells Grid */}
                      <div className="flex-1 space-y-1.5">
                        
                        {/* 7 ROWS of Cells */}
                        {defaultCells.map((rowCells, rIdx) => (
                          <div key={rIdx} className="grid grid-cols-19 gap-1.5">
                            {rowCells.map((origCell, cIdx) => {
                              // Retrieve override state if available
                              const cellKey = `${rIdx}-${cIdx}`;
                              const override = customHeatmapValues[cellKey];
                              const currentLevel = override?.level !== undefined ? override.level : origCell.level;
                              const currentValue = override?.value !== undefined ? override.value : origCell.val;

                              const isSelected = editingCellCoords?.r === rIdx && editingCellCoords?.c === cIdx;

                              return (
                                <button
                                  key={cIdx}
                                  onClick={() => {
                                    setEditingCellCoords({ r: rIdx, c: cIdx });
                                    showAdminToast("info", `Selected cell: Day ${weekdays[rIdx]}, Month: ${monthLabels[cIdx].label}`);
                                  }}
                                  className={`aspect-square w-full rounded-lg md:rounded-xl flex items-center justify-center font-bold text-xs select-none transition-all cursor-pointer relative group ${getCellColorClass(currentLevel)} ${
                                    isSelected 
                                      ? "ring-4 ring-[#7B59F5] ring-offset-2 scale-105 z-10" 
                                      : "hover:scale-102"
                                  }`}
                                  style={{ minHeight: "42px" }}
                                >
                                  {/* Cell inner text if value is populated */}
                                  {currentValue !== null && (
                                    <span className="text-[10px] tracking-tighter font-extrabold">
                                      {currentValue}
                                    </span>
                                  )}

                                  {/* Beautiful mini hover indicator tooltip */}
                                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#1E293B] text-white text-[9px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap z-30 shadow-lg pointer-events-none">
                                    {weekdays[rIdx]} • {monthLabels[cIdx].label} {cIdx >= 12 ? "2024" : "2023"}
                                    <span className="block text-slate-300 font-normal">Level {currentLevel} {currentValue ? `(${currentValue} count)` : ""}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ))}

                        {/* Months Columns Labels Under Grid (19 columns) */}
                        <div className="grid grid-cols-19 gap-1.5 pt-4 text-center">
                          {monthLabels.map((m, mIdx) => (
                            <div 
                              key={mIdx} 
                              className={`text-[10px] font-black tracking-wider text-slate-400 select-none ${
                                mIdx === 12 ? "border-l border-slate-200/80 pl-1.5" : ""
                              }`}
                            >
                              {m.label}
                            </div>
                          ))}
                        </div>

                      </div>

                      {/* Right: Row labels column MON-SUN */}
                      <div className="w-10 shrink-0 flex flex-col justify-between py-1 text-right pr-1">
                        {weekdays.map((day, dIdx) => (
                          <div 
                            key={dIdx} 
                            className="text-[11px] font-black text-slate-400 select-none h-[42px] flex items-center justify-end"
                          >
                            {day}
                          </div>
                        ))}
                        {/* placeholder gap for columns labels margin */}
                        <div className="h-4" />
                      </div>

                    </div>
                  </div>

                  {/* CELL DETAILS & LIVE EDITOR PANEL */}
                  <AnimatePresence>
                    {editingCellCoords && (() => {
                      const r = editingCellCoords.r;
                      const c = editingCellCoords.c;
                      const cellKey = `${r}-${c}`;
                      const override = customHeatmapValues[cellKey];
                      const currentLevel = override?.level !== undefined ? override.level : defaultCells[r][c].level;
                      const currentValue = override?.value !== undefined ? override.value : defaultCells[r][c].val;

                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          className="mt-6 p-5 bg-[#FAF8F5] border border-[#F0ECE3] rounded-2xl relative"
                        >
                          {/* Close icon */}
                          <button
                            onClick={() => setEditingCellCoords(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-full hover:bg-slate-100"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <div className="space-y-4">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Active Cell Inspector & Live Painter</span>
                              <h4 className="text-sm font-black text-slate-800">
                                Day of Week: <strong className="text-[#7B59F5]">{weekdays[r]}</strong> &bull; Month column: <strong className="text-[#7B59F5]">{monthLabels[c].label} ({c >= 12 ? "2024" : "2023"})</strong>
                              </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                              {/* Choose Busy Level */}
                              <div className="space-y-2">
                                <label className="font-bold text-slate-500 uppercase tracking-wider block">Busy Level Palette</label>
                                <div className="flex flex-wrap gap-2">
                                  {[0, 1, 2, 3, 4, 5].map((lvl) => (
                                    <button
                                      key={lvl}
                                      onClick={() => {
                                        setCustomHeatmapValues(prev => ({
                                          ...prev,
                                          [cellKey]: {
                                            ...prev[cellKey],
                                            level: lvl
                                          }
                                        }));
                                      }}
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold relative border cursor-pointer transition-all ${getCellColorClass(lvl)} ${
                                        currentLevel === lvl 
                                          ? "ring-2 ring-[#7B59F5] border-white scale-110 shadow-md" 
                                          : "border-transparent hover:scale-105"
                                      }`}
                                    >
                                      {lvl}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Numeric Text Label Overlay */}
                              <div className="space-y-2">
                                <label className="font-bold text-slate-500 uppercase tracking-wider block">Numeric Text Label Overlay</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="e.g. 128, 64, null"
                                    value={currentValue ?? ""}
                                    onChange={(e) => {
                                      const text = e.target.value;
                                      setCustomHeatmapValues(prev => ({
                                        ...prev,
                                        [cellKey]: {
                                          ...prev[cellKey],
                                          value: text === "" ? undefined : parseInt(text, 10)
                                        }
                                      }));
                                    }}
                                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-[#7B59F5] w-full"
                                  />
                                  <button
                                    onClick={() => {
                                      setCustomHeatmapValues(prev => ({
                                        ...prev,
                                        [cellKey]: {
                                          ...prev[cellKey],
                                          value: undefined
                                        }
                                      }));
                                    }}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2.5 py-2 rounded-xl transition-all cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </div>

                              {/* Action triggers */}
                              <div className="flex flex-col justify-end gap-2">
                                <button
                                  onClick={() => handleSaveCellChanges(r, c, currentLevel, (currentValue ?? "").toString())}
                                  className="bg-[#7B59F5] hover:bg-[#6844E0] text-white font-black py-2 rounded-xl text-center shadow-md shadow-purple-500/10 cursor-pointer transition-all"
                                >
                                  Save Coordinates
                                </button>
                                <button
                                  onClick={() => {
                                    setCustomHeatmapValues(prev => {
                                      const copy = { ...prev };
                                      delete copy[cellKey];
                                      return copy;
                                    });
                                    setEditingCellCoords(null);
                                    showAdminToast("info", "Cell reset to initial baseline values.");
                                  }}
                                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold py-2 rounded-xl text-center cursor-pointer transition-all"
                                >
                                  Reset Cell
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>

                </div>

                {/* 3. INTERACTIVE BAR CHARTS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* LEFT CHART: HOURLY */}
                  <div className="bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Hourly Spectrum</span>
                      
                      {/* Interactive HOURLY dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setHourlyDropdownOpen(!hourlyDropdownOpen)}
                          className="bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-full font-bold text-[10px] text-slate-600 flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <span>HOURLY</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        <AnimatePresence>
                          {hourlyDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setHourlyDropdownOpen(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                className="absolute right-0 mt-2.5 w-40 bg-white border border-slate-100 rounded-xl shadow-lg p-1.5 z-50 text-[10px]"
                              >
                                {["Arrivals Hourly", "Wait Time Hourly", "SLA Hourly"].map((itm) => (
                                  <button
                                    key={itm}
                                    onClick={() => {
                                      setHourlyDropdownOpen(false);
                                      showAdminToast("success", `Hourly chart view switched to: ${itm}`);
                                    }}
                                    className="w-full text-left px-2.5 py-2 rounded-lg font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all cursor-pointer"
                                  >
                                    {itm}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Proportional Hourly Bars */}
                    <div className="h-64 flex items-end justify-between px-2 sm:px-6 relative pb-6">
                      
                      {/* Grid background lines */}
                      <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-100 h-0 w-full" />
                      <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-slate-100 h-0 w-full" />
                      <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-slate-100 h-0 w-full" />

                      {getHourlyData(heatmapSelectedDept, heatmapSelectedMetric).map((val, idx) => {
                        const hours = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
                        const maxVal = Math.max(...getHourlyData(heatmapSelectedDept, heatmapSelectedMetric), 1);
                        const pctHeight = Math.max(15, Math.round((val / maxVal) * 180));
                        const isMax = val === maxVal;
                        
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer z-10">
                            <span className={`text-[11px] font-black mb-1 select-none group-hover:scale-110 transition-transform ${isMax ? "text-[#7B59F5] font-extrabold" : "text-slate-400"}`}>
                              {val}{heatmapSelectedMetric === "utilization" ? "%" : heatmapSelectedMetric === "wait-time" ? "m" : ""}
                            </span>
                            <div 
                              className={`w-6 sm:w-8 rounded-t-lg transition-all ${
                                isMax 
                                  ? "bg-[#7B59F5] hover:bg-[#6844E0] shadow-md shadow-purple-500/10" 
                                  : "bg-[#E2E8F0] hover:bg-slate-300"
                              }`} 
                              style={{ height: `${pctHeight}px` }} 
                            />
                            <span className="text-[9px] font-bold text-slate-400 mt-2">{hours[idx]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT CHART: MONTHLY */}
                  <div className="bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Monthly Trend</span>
                      
                      {/* Interactive MONTHLY dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setMonthlyDropdownOpen(!monthlyDropdownOpen)}
                          className="bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-full font-bold text-[10px] text-slate-600 flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <span>MONTHLY</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        <AnimatePresence>
                          {monthlyDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setMonthlyDropdownOpen(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                className="absolute right-0 mt-2.5 w-40 bg-white border border-slate-100 rounded-xl shadow-lg p-1.5 z-50 text-[10px]"
                              >
                                {["SLA Compliance Monthly", "Arrivals Monthly", "Peak Stress Monthly"].map((itm) => (
                                  <button
                                    key={itm}
                                    onClick={() => {
                                      setMonthlyDropdownOpen(false);
                                      showAdminToast("success", `Monthly chart view switched to: ${itm}`);
                                    }}
                                    className="w-full text-left px-2.5 py-2 rounded-lg font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all cursor-pointer"
                                  >
                                    {itm}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Proportional Monthly Bars with Tooltip */}
                    <div className="h-64 flex items-end justify-between px-2 sm:px-6 relative pb-6">
                      
                      {/* Grid background lines */}
                      <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-100 h-0 w-full" />
                      <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-slate-100 h-0 w-full" />
                      <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-slate-100 h-0 w-full" />

                      {getMonthlyData(heatmapSelectedDept, heatmapSelectedMetric).map((val, idx) => {
                        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
                        const maxVal = Math.max(...getMonthlyData(heatmapSelectedDept, heatmapSelectedMetric), 1);
                        const pctHeight = Math.max(15, Math.round((val / maxVal) * 170));
                        const isMax = val === maxVal;

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer z-10">
                            {isMax && (
                              <div className="bg-[#FF66CC] text-white text-[9px] font-black px-2 py-0.5 rounded mb-1 shadow-md relative scale-110 select-none animate-bounce whitespace-nowrap">
                                Peak ⚡
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-[#FF66CC]" />
                              </div>
                            )}
                            <span className={`text-[10px] font-black mb-1 select-none group-hover:scale-110 transition-transform ${isMax ? "text-[#FF66CC]" : "text-slate-400"}`}>
                              {val}{heatmapSelectedMetric === "utilization" ? "%" : heatmapSelectedMetric === "wait-time" ? "m" : ""}
                            </span>
                            <div 
                              className={`w-6 sm:w-8 rounded-t-lg transition-all ${
                                isMax 
                                  ? "bg-[#7B59F5] hover:bg-[#6844E0] shadow-md shadow-purple-500/10" 
                                  : "bg-[#E2E8F0] hover:bg-slate-300"
                              }`} 
                              style={{ height: `${pctHeight}px` }} 
                            />
                            <span className="text-[10px] font-black text-slate-400 mt-2 select-none">{months[idx]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* 4. INTELLIGENT CORRECTIVE RECOMMENDATIONS */}
                <div className="bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-[#7B59F5] uppercase">Live Queue Optimization Insights</span>
                      <h3 className="text-xl font-extrabold text-slate-800">Dynamic Corrective Actions for <span className="text-[#7B59F5]">{heatmapSelectedDept}</span></h3>
                    </div>
                    <span className="self-start sm:self-auto bg-[#FAF8F5] border border-slate-200/80 text-[#7B59F5] font-extrabold text-xs px-3.5 py-1.5 rounded-full whitespace-nowrap">
                      {getRecommendations(heatmapSelectedDept).length} smart suggestions available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {getRecommendations(heatmapSelectedDept).map((rec) => {
                      let RecIcon = Zap;
                      if (rec.type === "staffing") RecIcon = Users;
                      else if (rec.type === "schedule") RecIcon = Calendar;
                      else if (rec.type === "routing") RecIcon = RefreshCw;

                      return (
                        <div 
                          key={rec.id}
                          className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#F0ECE3] hover:border-[#7B59F5]/40 transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-slate-200/85 shadow-sm text-[#7B59F5]">
                                <RecIcon className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                {rec.impact}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-slate-800 text-sm tracking-tight">{rec.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-semibold">{rec.description}</p>
                          </div>

                          <button
                            onClick={() => {
                              showAdminToast("success", `Applied recommendation: "${rec.title}"! Operational resources deployed successfully.`);
                            }}
                            className="w-full py-2 bg-white hover:bg-[#7B59F5] hover:text-white border border-slate-200/80 hover:border-transparent rounded-xl text-xs font-bold text-slate-600 hover:scale-[1.02] cursor-pointer shadow-sm transition-all text-center"
                          >
                            {rec.actionText}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            );
          })()}

          {/* TAB 4: DEPARTMENT THROUGHPUT - SAAS PRODUCTION REDESIGN */}
          {activeTab === "dept-throughput" && (() => {
            const throughputDataset = {
              "Today": {
                totalArrivals: 452,
                totalServed: 418,
                avgWaitTime: "11m 15s",
                avgServiceTime: "08m 42s",
                slaCompliance: "94.2%",
                noShows: 18,
                abandoned: 16,
                departments: [
                  {
                    name: "Billing & Registration",
                    total: 115,
                    served: 108,
                    wait: "10m 12s",
                    service: "06m 45s",
                    noShows: 4,
                    skipped: 3,
                    slaCompliance: 93.9,
                    activeOperators: 3,
                    status: "Optimal",
                    operators: [
                      { name: "Amira Patel", served: 45, avgService: "06m 12s", rating: 4.8 },
                      { name: "Sarah Jenkins", served: 38, avgService: "07m 05s", rating: 4.7 },
                      { name: "Carlos Mendez", served: 25, avgService: "07m 30s", rating: 4.5 }
                    ],
                    recommendation: "High billing volume in morning. Preemptively assign 1 float operator from diagnostics.",
                    slaMetric: "93.9%"
                  },
                  {
                    name: "Clinical Consultation",
                    total: 142,
                    served: 125,
                    wait: "22m 40s",
                    service: "18m 15s",
                    noShows: 12,
                    skipped: 5,
                    slaCompliance: 81.5,
                    activeOperators: 4,
                    status: "SLA Alert",
                    operators: [
                      { name: "Dr. Robert Chen", served: 35, avgService: "17m 10s", rating: 4.9 },
                      { name: "Dr. Elena Rostova", served: 32, avgService: "18m 05s", rating: 4.8 },
                      { name: "Dr. Marcus Vance", served: 30, avgService: "19m 20s", rating: 4.7 },
                      { name: "Dr. Priya Patel", served: 28, avgService: "18m 45s", rating: 4.9 }
                    ],
                    recommendation: "Consultation queue is backlogged. Push alert notification to idle desk operators.",
                    slaMetric: "81.5%"
                  },
                  {
                    name: "Diagnostic Imaging",
                    total: 58,
                    served: 54,
                    wait: "14m 50s",
                    service: "12m 20s",
                    noShows: 2,
                    skipped: 2,
                    slaCompliance: 91.3,
                    activeOperators: 2,
                    status: "Optimal",
                    operators: [
                      { name: "Carlos Mendez", served: 28, avgService: "11m 45s", rating: 4.6 },
                      { name: "Aria Montgomery", served: 26, avgService: "12m 55s", rating: 4.8 }
                    ],
                    recommendation: "Imaging schedules are optimal. Standard staffing levels are fully sufficient.",
                    slaMetric: "91.3%"
                  },
                  {
                    name: "Pharmacy & Dispensary",
                    total: 137,
                    served: 131,
                    wait: "06m 10s",
                    service: "03m 45s",
                    noShows: 4,
                    skipped: 2,
                    slaCompliance: 95.6,
                    activeOperators: 3,
                    status: "Excellent",
                    operators: [
                      { name: "Aria Montgomery", served: 48, avgService: "03m 25s", rating: 4.9 },
                      { name: "Carlos Mendez", served: 43, avgService: "03m 50s", rating: 4.7 },
                      { name: "Sarah Jenkins", served: 40, avgService: "04m 10s", rating: 4.8 }
                    ],
                    recommendation: "Pharmacy speed exceeds baseline. Consider floating 1 operator to Billing.",
                    slaMetric: "95.6%"
                  }
                ]
              },
              "Yesterday": {
                totalArrivals: 421,
                totalServed: 387,
                avgWaitTime: "12m 45s",
                avgServiceTime: "09m 10s",
                slaCompliance: "91.8%",
                noShows: 22,
                abandoned: 12,
                departments: [
                  {
                    name: "Billing & Registration",
                    total: 102,
                    served: 94,
                    wait: "11m 24s",
                    service: "07m 15s",
                    noShows: 5,
                    skipped: 3,
                    slaCompliance: 92.1,
                    activeOperators: 3,
                    status: "Optimal",
                    operators: [
                      { name: "Amira Patel", served: 38, avgService: "06m 40s", rating: 4.7 },
                      { name: "Sarah Jenkins", served: 32, avgService: "07m 10s", rating: 4.6 },
                      { name: "Carlos Mendez", served: 24, avgService: "07m 55s", rating: 4.4 }
                    ],
                    recommendation: "Review registration desk checklist to trim 45s from card handling.",
                    slaMetric: "92.1%"
                  },
                  {
                    name: "Clinical Consultation",
                    total: 135,
                    served: 118,
                    wait: "24m 15s",
                    service: "19m 30s",
                    noShows: 11,
                    skipped: 6,
                    slaCompliance: 82.2,
                    activeOperators: 4,
                    status: "SLA Alert",
                    operators: [
                      { name: "Dr. Robert Chen", served: 32, avgService: "18m 15s", rating: 4.8 },
                      { name: "Dr. Elena Rostova", served: 30, avgService: "19m 10s", rating: 4.7 },
                      { name: "Dr. Marcus Vance", served: 29, avgService: "20m 40s", rating: 4.6 },
                      { name: "Dr. Priya Patel", served: 27, avgService: "20m 10s", rating: 4.8 }
                    ],
                    recommendation: "Authorize pre-visit intake screening on kiosks to cut doctors' service time by 3m.",
                    slaMetric: "82.2%"
                  },
                  {
                    name: "Diagnostic Imaging",
                    total: 51,
                    served: 47,
                    wait: "15m 30s",
                    service: "13m 10s",
                    noShows: 2,
                    skipped: 2,
                    slaCompliance: 92.1,
                    activeOperators: 2,
                    status: "Optimal",
                    operators: [
                      { name: "Carlos Mendez", served: 25, avgService: "12m 20s", rating: 4.7 },
                      { name: "Aria Montgomery", served: 22, avgService: "14m 00s", rating: 4.8 }
                    ],
                    recommendation: "Inspect Scanner 2 calibration timing to reduce setup duration.",
                    slaMetric: "92.1%"
                  },
                  {
                    name: "Pharmacy & Dispensary",
                    total: 133,
                    served: 128,
                    wait: "07m 45s",
                    service: "04m 12s",
                    noShows: 4,
                    skipped: 1,
                    slaCompliance: 96.2,
                    activeOperators: 3,
                    status: "Excellent",
                    operators: [
                      { name: "Aria Montgomery", served: 46, avgService: "03m 50s", rating: 4.8 },
                      { name: "Carlos Mendez", served: 42, avgService: "04m 20s", rating: 4.6 },
                      { name: "Sarah Jenkins", served: 40, avgService: "04m 25s", rating: 4.7 }
                    ],
                    recommendation: "Staffing levels optimal. Pharmacy continues to outperform SLA expectations.",
                    slaMetric: "96.2%"
                  }
                ]
              },
              "7Days": {
                totalArrivals: 2894,
                totalServed: 2712,
                avgWaitTime: "12m 10s",
                avgServiceTime: "08m 15s",
                slaCompliance: "93.1%",
                noShows: 114,
                abandoned: 68,
                departments: [
                  {
                    name: "Billing & Registration",
                    total: 752,
                    served: 710,
                    wait: "10m 45s",
                    service: "06m 50s",
                    noShows: 28,
                    skipped: 14,
                    slaCompliance: 94.4,
                    activeOperators: 3,
                    status: "Optimal",
                    operators: [
                      { name: "Amira Patel", served: 285, avgService: "06m 20s", rating: 4.8 },
                      { name: "Sarah Jenkins", served: 245, avgService: "07m 05s", rating: 4.7 },
                      { name: "Carlos Mendez", served: 180, avgService: "07m 40s", rating: 4.5 }
                    ],
                    recommendation: "Morning kiosk deployment successfully offloaded 20% billing traffic.",
                    slaMetric: "94.4%"
                  },
                  {
                    name: "Clinical Consultation",
                    total: 924,
                    served: 818,
                    wait: "23m 15s",
                    service: "18m 45s",
                    noShows: 68,
                    skipped: 38,
                    slaCompliance: 82.1,
                    activeOperators: 4,
                    status: "SLA Alert",
                    operators: [
                      { name: "Dr. Robert Chen", served: 224, avgService: "17m 40s", rating: 4.9 },
                      { name: "Dr. Elena Rostova", served: 208, avgService: "18m 15s", rating: 4.8 },
                      { name: "Dr. Marcus Vance", served: 195, avgService: "19m 50s", rating: 4.7 },
                      { name: "Dr. Priya Patel", served: 191, avgService: "19m 10s", rating: 4.9 }
                    ],
                    recommendation: "Activate dynamic float system to automatically direct operator overlap to clinical desk.",
                    slaMetric: "82.1%"
                  },
                  {
                    name: "Diagnostic Imaging",
                    total: 382,
                    served: 358,
                    wait: "15m 12s",
                    service: "12m 45s",
                    noShows: 14,
                    skipped: 10,
                    slaCompliance: 91.8,
                    activeOperators: 2,
                    status: "Optimal",
                    operators: [
                      { name: "Carlos Mendez", served: 185, avgService: "12m 10s", rating: 4.7 },
                      { name: "Aria Montgomery", served: 173, avgService: "13m 20s", rating: 4.8 }
                    ],
                    recommendation: "Deploy patient reminder alerts via SMS to reduce 14 average weekly no-shows.",
                    slaMetric: "91.8%"
                  },
                  {
                    name: "Pharmacy & Dispensary",
                    total: 836,
                    served: 826,
                    wait: "06m 50s",
                    service: "03m 55s",
                    noShows: 4,
                    skipped: 6,
                    slaCompliance: 98.8,
                    activeOperators: 3,
                    status: "Excellent",
                    operators: [
                      { name: "Aria Montgomery", served: 295, avgService: "03m 35s", rating: 4.9 },
                      { name: "Carlos Mendez", served: 275, avgService: "03m 58s", rating: 4.7 },
                      { name: "Sarah Jenkins", served: 256, avgService: "04m 15s", rating: 4.8 }
                    ],
                    recommendation: "Pre-pack standard medications for morning queue to compress service time under 3m.",
                    slaMetric: "98.8%"
                  }
                ]
              },
              "MonthToDate": {
                totalArrivals: 12840,
                totalServed: 11925,
                avgWaitTime: "12m 24s",
                avgServiceTime: "08m 20s",
                slaCompliance: "92.9%",
                noShows: 512,
                abandoned: 403,
                departments: [
                  {
                    name: "Billing & Registration",
                    total: 3250,
                    served: 3080,
                    wait: "10m 52s",
                    service: "06m 48s",
                    noShows: 112,
                    skipped: 58,
                    slaCompliance: 94.7,
                    activeOperators: 3,
                    status: "Optimal",
                    operators: [
                      { name: "Amira Patel", served: 1120, avgService: "06m 15s", rating: 4.8 },
                      { name: "Sarah Jenkins", served: 1010, avgService: "07m 02s", rating: 4.7 },
                      { name: "Carlos Mendez", served: 950, avgService: "07m 35s", rating: 4.6 }
                    ],
                    recommendation: "Branding optimization with clear instructions has saved 40+ hours in manual registration support.",
                    slaMetric: "94.7%"
                  },
                  {
                    name: "Clinical Consultation",
                    total: 4120,
                    served: 3620,
                    wait: "23m 45s",
                    service: "18m 55s",
                    noShows: 320,
                    skipped: 180,
                    slaCompliance: 81.9,
                    activeOperators: 4,
                    status: "SLA Alert",
                    operators: [
                      { name: "Dr. Robert Chen", served: 980, avgService: "17m 35s", rating: 4.9 },
                      { name: "Dr. Elena Rostova", served: 910, avgService: "18m 20s", rating: 4.8 },
                      { name: "Dr. Marcus Vance", served: 880, avgService: "19m 45s", rating: 4.7 },
                      { name: "Dr. Priya Patel", served: 850, avgService: "19m 12s", rating: 4.9 }
                    ],
                    recommendation: "Establish permanent 5th clinic desk terminal to handle the structural 41% workload.",
                    slaMetric: "81.9%"
                  },
                  {
                    name: "Diagnostic Imaging",
                    total: 1840,
                    served: 1720,
                    wait: "14m 58s",
                    service: "12m 38s",
                    noShows: 70,
                    skipped: 50,
                    slaCompliance: 93.4,
                    activeOperators: 2,
                    status: "Optimal",
                    operators: [
                      { name: "Carlos Mendez", served: 890, avgService: "12m 05s", rating: 4.7 },
                      { name: "Aria Montgomery", served: 830, avgService: "13m 15s", rating: 4.8 }
                    ],
                    recommendation: "Upgrade Diagnostic check-in scanner firmware to streamline scan request receipts.",
                    slaMetric: "93.4%"
                  },
                  {
                    name: "Pharmacy & Dispensary",
                    total: 3630,
                    served: 3505,
                    wait: "06m 40s",
                    service: "03m 52s",
                    noShows: 10,
                    skipped: 115,
                    slaCompliance: 96.5,
                    activeOperators: 3,
                    status: "Excellent",
                    operators: [
                      { name: "Aria Montgomery", served: 1250, avgService: "03m 30s", rating: 4.9 },
                      { name: "Carlos Mendez", served: 1150, avgService: "03m 55s", rating: 4.7 },
                      { name: "Sarah Jenkins", served: 1105, avgService: "04m 10s", rating: 4.8 }
                    ],
                    recommendation: "Pharmacy continues to maintain lead speeds. Automated inventory sync recommended.",
                    slaMetric: "96.5%"
                  }
                ]
              }
            };

            const currentTfData = throughputDataset[throughputTimeframe] || throughputDataset["7Days"];

            // Filter
            const filteredDepts = currentTfData.departments.filter(dept =>
              dept.name.toLowerCase().includes(throughputSearchQuery.toLowerCase())
            );

            // Sort
            const sortedDepts = [...filteredDepts].sort((a, b) => {
              if (throughputSortField === "volume") {
                return b.served - a.served;
              }
              if (throughputSortField === "compliance") {
                return b.slaCompliance - a.slaCompliance;
              }
              if (throughputSortField === "avgWait") {
                const parseSec = (tStr: string) => {
                  const parts = tStr.split(" ");
                  const m = parseInt(parts[0]) || 0;
                  const s = parseInt(parts[1]) || 0;
                  return m * 60 + s;
                };
                return parseSec(b.wait) - parseSec(a.wait);
              }
              if (throughputSortField === "avgService") {
                const parseSec = (tStr: string) => {
                  const parts = tStr.split(" ");
                  const m = parseInt(parts[0]) || 0;
                  const s = parseInt(parts[1]) || 0;
                  return m * 60 + s;
                };
                return parseSec(b.service) - parseSec(a.service);
              }
              return 0;
            });

            // Active selected department details
            const selectedDeptData = sortedDepts.find(d => d.name === selectedThroughputDept) || sortedDepts[0] || currentTfData.departments[0];

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* 1. TOP HEADER FILTER CONTROL BAR */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                      <h4 className="font-rethink text-sm font-black text-brand-navy">Linely Throughput Performance Matrix</h4>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Real-time customer turnaround telemetry: service velocities, SLA compliance factors, and abandonment triggers.
                    </p>
                  </div>

                  {/* Actions Area */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Timeframe Selector */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/60 p-1 rounded-xl">
                      {[
                        { id: "Today", label: "Today" },
                        { id: "Yesterday", label: "Yesterday" },
                        { id: "7Days", label: "Last 7 Days" },
                        { id: "MonthToDate", label: "Month-to-Date" }
                      ].map((tf) => (
                        <button
                          key={tf.id}
                          onClick={() => {
                            setThroughputTimeframe(tf.id as any);
                            // Keep selection if exists, else let it reset to fallback
                            showAdminToast("info", `Throughput analytics loaded for: ${tf.label}.`);
                          }}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                            throughputTimeframe === tf.id
                              ? "bg-brand-navy text-white shadow-md shadow-brand-navy/10"
                              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {tf.label}
                        </button>
                      ))}
                    </div>

                    {/* Export PDF Report */}
                    <button
                      onClick={() => {
                        showAdminToast("success", `Generating live performance ledger linely_throughput_${throughputTimeframe.toLowerCase()}.csv`);
                      }}
                      className="bg-slate-50 hover:bg-slate-100 text-brand-navy border border-slate-200/80 px-3.5 py-2 rounded-xl font-bold text-[10px] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Export Spreadsheet
                    </button>
                  </div>
                </div>

                {/* 2. GLOBAL OVERVIEW METRIC CARDS ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Metric 1: System Turnaround Volume */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest block">System Turnaround Volume</span>
                      <span className="text-xl font-black text-brand-navy group-hover:text-brand-ocean transition-colors block">
                        {currentTfData.totalServed} <span className="text-xs font-semibold text-slate-400">/ {currentTfData.totalArrivals}</span>
                      </span>
                      <span className="text-[10px] text-emerald-500 font-bold block flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {((currentTfData.totalServed / currentTfData.totalArrivals) * 100).toFixed(1)}% Completion Efficiency
                      </span>
                    </div>
                    <div className="w-10 h-10 bg-brand-navy/5 text-brand-navy rounded-xl flex items-center justify-center shrink-0">
                      <BarChart3 className="w-5 h-5 text-brand-navy" />
                    </div>
                  </div>

                  {/* Metric 2: Average Wait Speed */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest block">Average Wait Speed (AWT)</span>
                      <span className="text-xl font-black text-brand-navy block">
                        {currentTfData.avgWaitTime}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        Target benchmark: &lt; 15m 00s
                      </span>
                    </div>
                    <div className="w-10 h-10 bg-brand-cyan/10 text-brand-navy rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-brand-navy" />
                    </div>
                  </div>

                  {/* Metric 3: Service Compliance SLA */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="space-y-1.5 flex-1">
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest block">SLA Compliance Rate</span>
                      <span className="text-xl font-black text-brand-navy block">
                        {currentTfData.slaCompliance}
                      </span>
                      <div className="w-full bg-slate-100 rounded-full h-1 mt-1">
                        <div 
                          className="bg-brand-navy h-1 rounded-full transition-all duration-500" 
                          style={{ width: currentTfData.slaCompliance }} />
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 ml-3">
                      <Activity className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>

                  {/* Metric 4: System Abandonment Rate */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest block">No-Shows & walkaways</span>
                      <span className="text-xl font-black text-[#0D1A5E] block">
                        {currentTfData.noShows} <span className="text-xs font-semibold text-slate-400">tickets</span>
                      </span>
                      <span className="text-[10px] text-amber-500 font-bold block flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> {((currentTfData.noShows / currentTfData.totalArrivals) * 100).toFixed(1)}% Abandonment factor
                      </span>
                    </div>
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </div>

                {/* 3. INTERACTIVE SEARCH, SORTING & MAIN SPLIT VIEW */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* Left Column (Col span 2) - Department list & analytics cards */}
                  <div className="xl:col-span-2 space-y-4">
                    {/* Filter & Sorting Header inside list */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Search Bar */}
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search departments..."
                          value={throughputSearchQuery}
                          onChange={(e) => setThroughputSearchQuery(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200/60 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-brand-navy placeholder-slate-400 outline-none focus:bg-white focus:border-brand-cyan transition-all"
                        />
                      </div>

                      {/* Sorting options */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sort by</span>
                        <div className="flex bg-slate-50 border border-slate-200/60 p-1 rounded-xl">
                          {[
                            { id: "volume", label: "Volume" },
                            { id: "compliance", label: "SLA" },
                            { id: "avgWait", label: "Wait" },
                            { id: "avgService", label: "Process" }
                          ].map((sort) => (
                            <button
                              key={sort.id}
                              onClick={() => {
                                setThroughputSortField(sort.id as any);
                                showAdminToast("info", `Sorting matrix by ${sort.label} descending.`);
                              }}
                              className={`px-2.5 py-1 text-[9px] font-extrabold rounded-lg transition-all cursor-pointer ${
                                throughputSortField === sort.id
                                  ? "bg-brand-navy text-white shadow-sm"
                                  : "text-slate-400 hover:text-slate-600"
                              }`}
                            >
                              {sort.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Department list rendered as SaaS telemetry cards */}
                    <div className="space-y-4">
                      {sortedDepts.length > 0 ? (
                        sortedDepts.map((dept, idx) => {
                          const isSelected = selectedThroughputDept === dept.name;
                          const completionRate = Math.round((dept.served / dept.total) * 100);
                          
                          let statusColor = "bg-emerald-50 border-emerald-100 text-emerald-700";
                          if (dept.status === "SLA Alert") {
                            statusColor = "bg-amber-50 border-amber-100 text-amber-700";
                          } else if (dept.status === "Excellent") {
                            statusColor = "bg-brand-cyan/10 border-brand-cyan/20 text-[#00C3E3]";
                          }

                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedThroughputDept(dept.name);
                                showAdminToast("info", `Focusing details: ${dept.name}`);
                              }}
                              className={`bg-white border rounded-2xl p-5 shadow-sm transition-all cursor-pointer relative overflow-hidden ${
                                isSelected 
                                  ? "ring-2 ring-brand-cyan ring-offset-1 scale-102 shadow-md z-10" 
                                  : "hover:border-slate-300 hover:scale-[1.01]"
                              }`}
                            >
                              {/* Selection border indicator */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                isSelected ? "bg-brand-cyan" : "bg-transparent"
                              }`} />

                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                {/* Department info section */}
                                <div className="space-y-1.5 lg:w-5/12 shrink-0">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-rethink font-black text-sm text-brand-navy hover:text-brand-ocean transition-colors">
                                      {dept.name}
                                    </h5>
                                    <span className={`text-[9px] font-black uppercase tracking-wider border px-2 py-0.5 rounded-md ${statusColor}`}>
                                      {dept.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3.5 text-[10px] font-semibold text-slate-400">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-brand-cyan" /> Wait: <strong className="text-slate-600">{dept.wait}</strong></span>
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3 text-slate-400" /> Active Desks: <strong className="text-slate-600">{dept.activeOperators}</strong></span>
                                  </div>
                                </div>

                                {/* Custom mini bar chart/progress for SLA compliance */}
                                <div className="flex-1 space-y-1.5">
                                  <div className="flex justify-between text-[10px] font-extrabold text-slate-400">
                                    <span>SLA GOAL COMPLIANCE</span>
                                    <span className={dept.slaCompliance > 85 ? "text-emerald-600" : "text-amber-600"}>
                                      {dept.slaMetric} Compliance
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        dept.slaCompliance > 85 ? "bg-brand-navy" : "bg-amber-400"
                                      }`} 
                                      style={{ width: `${dept.slaCompliance}%` }} 
                                    />
                                  </div>
                                </div>

                                {/* Served / Volume Count Area */}
                                <div className="flex items-center justify-between lg:justify-end gap-6 lg:pl-6 shrink-0 lg:border-l border-slate-200">
                                  <div className="text-left lg:text-right">
                                    <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest block">Volume (Served)</span>
                                    <span className="font-rethink font-black text-sm text-brand-navy mt-1 block">{dept.served} served</span>
                                    <span className="text-[9px] text-slate-400 block font-semibold">{dept.total} total check-ins</span>
                                  </div>
                                  <span className={`w-8 h-8 rounded-full flex items-center justify-center border transition-transform ${
                                    isSelected ? "bg-brand-cyan/10 border-brand-cyan text-brand-cyan rotate-90" : "bg-slate-50 border-slate-150 text-slate-400"
                                  }`}>
                                    <ChevronRight className="w-4 h-4" />
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400">
                          No departments matching "{throughputSearchQuery}" were registered.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column (Col span 1) - Selected Department Telemetry Workspace */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-6">
                    <div>
                      {/* Section Title */}
                      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                        <span className="text-[10px] font-black text-brand-navy uppercase tracking-widest block">Department Analytics Workspace</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse" />
                      </div>

                      {/* Info on selected dept */}
                      <div className="mt-4 space-y-1">
                        <h6 className="text-sm font-black text-brand-navy leading-tight">{selectedDeptData.name}</h6>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#0D1A5E] bg-[#0D1A5E]/5 px-2.5 py-1 rounded-lg border border-slate-100">
                          <Activity className="w-3 h-3 text-[#00C3E3]" /> Timeframe: {throughputTimeframe}
                        </span>
                      </div>
                    </div>

                    {/* Department Telemetry Statistics */}
                    <div className="space-y-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Detailed Service Times</span>

                      {/* AST */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/40 transition-colors">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-brand-cyan" />
                          <span className="text-[10px] font-extrabold text-slate-500">Avg Handling Speed (AST)</span>
                        </div>
                        <span className="text-xs font-black text-slate-700">{selectedDeptData.service}</span>
                      </div>

                      {/* No-Shows */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/40 transition-colors">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-[10px] font-extrabold text-slate-500">Customer No-Shows</span>
                        </div>
                        <span className="text-xs font-black text-slate-700">{selectedDeptData.noShows} tickets</span>
                      </div>

                      {/* Skipped */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/40 transition-colors">
                        <div className="flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-[10px] font-extrabold text-slate-500">Walkaway Abandonments</span>
                        </div>
                        <span className="text-xs font-black text-slate-700">{selectedDeptData.skipped} tickets</span>
                      </div>

                      {/* Active Counters ratio */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/40 transition-colors">
                        <div className="flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-brand-navy" />
                          <span className="text-[10px] font-extrabold text-slate-500">Operational Desk Units</span>
                        </div>
                        <span className="text-xs font-black text-slate-700">{selectedDeptData.activeOperators} active</span>
                      </div>
                    </div>

                    {/* Operator performance table rankings inside dept */}
                    <div className="space-y-2.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Top Desk Operators Speed</span>
                      
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 no-scrollbar">
                        {selectedDeptData.operators.map((op, oIdx) => (
                          <div key={oIdx} className="flex items-center justify-between text-xs p-2.5 bg-slate-50 border border-slate-150 rounded-xl">
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-brand-navy text-[11px] block">{op.name}</span>
                              <span className="text-[9px] text-slate-400 block font-semibold">{op.served} tickets served</span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-700 block text-[11px]">{op.avgService}</span>
                              <span className="text-[9px] text-emerald-600 block font-black flex items-center justify-end gap-0.5">
                                <Award className="w-3 h-3 text-emerald-500 shrink-0" /> {op.rating}★
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Department-Specific Predictive AI Recommendation */}
                    <div className="bg-gradient-to-br from-brand-navy to-[#0D1A5E] text-white p-4.5 rounded-2xl space-y-3 shadow-md relative overflow-hidden">
                      <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                        <Sparkles className="w-24 h-24 text-[#00C3E3]" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#00C3E3] shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#00C3E3]">Interactive Recommendation</span>
                      </div>

                      <p className="text-[11px] leading-relaxed font-semibold text-slate-200">
                        "{selectedDeptData.recommendation}"
                      </p>

                      <div className="pt-2 flex justify-end gap-1.5 z-10 relative">
                        <button
                          onClick={() => {
                            showAdminToast("info", "SMS notifications configured. Outbound reminders dispatched to queue tickets.");
                          }}
                          className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[9px] font-black transition-all cursor-pointer"
                        >
                          Send SMS Reminder
                        </button>
                        <button
                          onClick={() => {
                            showAdminToast("success", `Success! Dynamically deployed a float operator to handle ${selectedDeptData.name} peak load.`);
                          }}
                          className="bg-brand-cyan hover:bg-[#00C3E3]/85 text-brand-navy font-black px-2.5 py-1.5 rounded-lg text-[9px] transition-all cursor-pointer active:scale-95"
                        >
                          Deploy Floater Operator
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

              </motion.div>
            );
          })()}

          {/* TAB 6: COMPARATIVE REPORTS */}
          {activeTab === "comparative-reports" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-8 p-1 sm:p-4 rounded-3xl bg-[#FAF8F5] border border-[#F0ECE3]"
            >
              {/* 1. BRANDING & TOGGLE CONTROLLER HEADER */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-xl bg-[#7B59F5] shadow-sm">
                    C
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-800 font-sans">Simple Compare</h2>
                    <p className="text-xs text-slate-400 font-medium">Side-by-side performance comparison for departments & active counters</p>
                  </div>
                </div>

                {/* Simplified Toggle Capsules */}
                <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/80 rounded-full self-start lg:self-auto shadow-sm">
                  <button
                    onClick={() => {
                      setSimpleCompareType("departments");
                      setSimpleCompareIdA("");
                      setSimpleCompareIdB("");
                      showAdminToast("info", "Switched comparative reports to Departments");
                    }}
                    className={`px-5 py-2 rounded-full text-xs font-bold tracking-tight transition-all cursor-pointer ${
                      simpleCompareType === "departments"
                        ? "bg-[#7B59F5] text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Compare Departments
                  </button>
                  <button
                    onClick={() => {
                      setSimpleCompareType("counters");
                      setSimpleCompareIdA("");
                      setSimpleCompareIdB("");
                      showAdminToast("info", "Switched comparative reports to Counters");
                    }}
                    className={`px-5 py-2 rounded-full text-xs font-bold tracking-tight transition-all cursor-pointer ${
                      simpleCompareType === "counters"
                        ? "bg-[#7B59F5] text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Compare Counters
                  </button>
                </div>
              </div>

              {/* 2. MAIN SELECTION DECK CARD */}
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/10 rounded-full filter blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-100/10 rounded-full filter blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  {/* Select Target A */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md flex items-center justify-center bg-purple-50 text-[#7B59F5] text-[10px] font-black">A</span>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                        Select Target A
                      </label>
                    </div>
                    <select
                      value={simpleCompareIdA || (simpleCompareType === "departments" ? (departments[0]?.id || "") : (counters[0]?.id || ""))}
                      onChange={(e) => setSimpleCompareIdA(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#F0ECE3] text-slate-700 rounded-2xl px-4 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7B59F5]/40 transition-all cursor-pointer"
                    >
                      {simpleCompareType === "departments"
                        ? departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              🏢 {d.name} ({d.prefix})
                            </option>
                          ))
                        : counters.map((c) => (
                            <option key={c.id} value={c.id}>
                              ⚙️ {c.name} — {c.operatorName || "Unassigned"}
                            </option>
                          ))}
                    </select>
                  </div>

                  {/* Select Target B */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md flex items-center justify-center bg-cyan-50 text-[#00C3E3] text-[10px] font-black">B</span>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                        Select Target B
                      </label>
                    </div>
                    <select
                      value={simpleCompareIdB || (simpleCompareType === "departments" ? (departments[1]?.id || departments[0]?.id || "") : (counters[1]?.id || counters[0]?.id || ""))}
                      onChange={(e) => setSimpleCompareIdB(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#F0ECE3] text-slate-700 rounded-2xl px-4 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#00C3E3]/40 transition-all cursor-pointer"
                    >
                      {simpleCompareType === "departments"
                        ? departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              🏢 {d.name} ({d.prefix})
                            </option>
                          ))
                        : counters.map((c) => (
                            <option key={c.id} value={c.id}>
                              ⚙️ {c.name} — {c.operatorName || "Unassigned"}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. METRIC CARDS COMPARISON SPLIT GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cohort A Card */}
                {(() => {
                  const activeIdA = simpleCompareIdA || (simpleCompareType === "departments" ? (departments[0]?.id || "") : (counters[0]?.id || ""));
                  const item = simpleCompareType === "departments"
                    ? departments.find(d => d.id === activeIdA)
                    : counters.find(c => c.id === activeIdA);

                  if (!item) return null;

                  return (
                    <div className="bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="bg-[#FAF8F5] text-[#7B59F5] text-xs font-black px-3 py-1.5 rounded-xl border border-[#F0ECE3]">Cohort A</span>
                          <h4 className="text-lg font-extrabold text-slate-800">
                            {item.name}
                          </h4>
                        </div>
                        {simpleCompareType === "departments" ? (
                          <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border border-slate-100">
                            Pattern: {(item as Department).prefix}-*
                          </span>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            (item as Counter).status === "Active"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>
                            {(item as Counter).status}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {simpleCompareType === "departments" ? (
                          <>
                            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0ECE3] space-y-1">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Target SLA</span>
                              <span className="text-xl font-extrabold text-slate-800">{(item as Department).targetSla} mins</span>
                            </div>
                            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0ECE3] space-y-1">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Active Operators</span>
                              <span className="text-xl font-extrabold text-[#7B59F5]">{(item as Department).activeCount} Desks</span>
                            </div>
                            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0ECE3] space-y-1">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Average Adherence</span>
                              <span className="text-xl font-extrabold text-emerald-600">
                                {item.id === "1" ? "94.2%" : item.id === "2" ? "82.5%" : item.id === "3" ? "88.0%" : "91.8%"}
                              </span>
                            </div>
                            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0ECE3] space-y-1">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Route Mode</span>
                              <span className="text-xs font-black text-slate-600 truncate block mt-1.5">{(item as Department).routeMode}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0ECE3] space-y-1 col-span-2">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Assigned Operator</span>
                              <span className="text-sm font-extrabold text-slate-800">{(item as Counter).operatorName || "None"}</span>
                            </div>
                            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0ECE3] space-y-1">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Audible Chime</span>
                              <span className="text-xs font-black text-slate-600 block mt-1">{(item as Counter).chimeEnabled ? "Chime Active" : "Chime Muted"}</span>
                            </div>
                            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0ECE3] space-y-1">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Tickets Served</span>
                              <span className="text-xl font-extrabold text-slate-800">
                                {item.id === "1" ? "42" : item.id === "3" ? "35" : "28"}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Cohort B Card */}
                {(() => {
                  const activeIdB = simpleCompareIdB || (simpleCompareType === "departments" ? (departments[1]?.id || departments[0]?.id || "") : (counters[1]?.id || counters[0]?.id || ""));
                  const item = simpleCompareType === "departments"
                    ? departments.find(d => d.id === activeIdB)
                    : counters.find(c => c.id === activeIdB);

                  if (!item) return null;

                  return (
                    <div className="bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="bg-[#FAF8F5] text-[#00C3E3] text-xs font-black px-3 py-1.5 rounded-xl border border-[#F0ECE3]">Cohort B</span>
                          <h4 className="text-lg font-extrabold text-slate-800">
                            {item.name}
                          </h4>
                        </div>
                        {simpleCompareType === "departments" ? (
                          <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border border-slate-100">
                            Pattern: {(item as Department).prefix}-*
                          </span>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            (item as Counter).status === "Active"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>
                            {(item as Counter).status}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {simpleCompareType === "departments" ? (
                          <>
                            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0ECE3] space-y-1">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Target SLA</span>
                              <span className="text-xl font-extrabold text-slate-800">{(item as Department).targetSla} mins</span>
                            </div>
                            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0ECE3] space-y-1">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Active Operators</span>
                              <span className="text-xl font-extrabold text-[#7B59F5]">{(item as Department).activeCount} Desks</span>
                            </div>
                            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0ECE3] space-y-1">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Average Adherence</span>
                              <span className="text-xl font-extrabold text-emerald-600">
                                {item.id === "1" ? "94.2%" : item.id === "2" ? "82.5%" : item.id === "3" ? "88.0%" : "91.8%"}
                              </span>
                            </div>
                            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0ECE3] space-y-1">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Route Mode</span>
                              <span className="text-xs font-black text-slate-600 truncate block mt-1.5">{(item as Department).routeMode}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0ECE3] space-y-1 col-span-2">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Assigned Operator</span>
                              <span className="text-sm font-extrabold text-slate-800">{(item as Counter).operatorName || "None"}</span>
                            </div>
                            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0ECE3] space-y-1">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Audible Chime</span>
                              <span className="text-xs font-black text-slate-600 block mt-1">{(item as Counter).chimeEnabled ? "Chime Active" : "Chime Muted"}</span>
                            </div>
                            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0ECE3] space-y-1">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Tickets Served</span>
                              <span className="text-xl font-extrabold text-slate-800">
                                {item.id === "1" ? "42" : item.id === "3" ? "35" : "28"}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 4. VISUAL SIDE-BY-SIDE ANALYTICAL CHART */}
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-[#7B59F5] uppercase">SaaS Analytical Chart Comparison</span>
                    <h3 className="text-xl font-extrabold text-slate-800">Dynamic Side-by-Side Efficiency Metrics</h3>
                  </div>
                </div>

                {(() => {
                  const activeIdA = simpleCompareIdA || (simpleCompareType === "departments" ? (departments[0]?.id || "") : (counters[0]?.id || ""));
                  const activeIdB = simpleCompareIdB || (simpleCompareType === "departments" ? (departments[1]?.id || departments[0]?.id || "") : (counters[1]?.id || counters[0]?.id || ""));

                  const itemA = simpleCompareType === "departments"
                    ? departments.find(d => d.id === activeIdA)
                    : counters.find(c => c.id === activeIdA);

                  const itemB = simpleCompareType === "departments"
                    ? departments.find(d => d.id === activeIdB)
                    : counters.find(c => c.id === activeIdB);

                  if (!itemA || !itemB) return <p className="text-xs text-slate-400">Please select distinct targets to generate metrics.</p>;

                  const chartData = simpleCompareType === "departments"
                    ? [
                        {
                          name: "SLA Goal (mins)",
                          [itemA.name]: (itemA as Department).targetSla,
                          [itemB.name]: (itemB as Department).targetSla,
                        },
                        {
                          name: "Active Operators",
                          [itemA.name]: (itemA as Department).activeCount,
                          [itemB.name]: (itemB as Department).activeCount,
                        },
                        {
                          name: "SLA Adherence (%)",
                          [itemA.name]: parseFloat(itemA.id === "1" ? "94.2" : itemA.id === "2" ? "82.5" : itemA.id === "3" ? "88" : "91.8"),
                          [itemB.name]: parseFloat(itemB.id === "1" ? "94.2" : itemB.id === "2" ? "82.5" : itemB.id === "3" ? "88" : "91.8"),
                        }
                      ]
                    : [
                        {
                          name: "Tickets Served",
                          [itemA.name]: itemA.id === "1" ? 42 : itemA.id === "3" ? 35 : 28,
                          [itemB.name]: itemB.id === "1" ? 42 : itemB.id === "3" ? 35 : 28,
                        },
                        {
                          name: "Active Score (1-100)",
                          [itemA.name]: (itemA as Counter).status === "Active" ? 100 : (itemA as Counter).status === "Idle" ? 50 : 15,
                          [itemB.name]: (itemB as Counter).status === "Active" ? 100 : (itemB as Counter).status === "Idle" ? 50 : 15,
                        }
                      ];

                  return (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px", border: "1px solid #f1f5f9" }} />
                          <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }} />
                          <Bar dataKey={itemA.name} fill="#7B59F5" radius={[6, 6, 0, 0]} />
                          <Bar dataKey={itemB.name} fill="#00C3E3" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}

          {/* TAB 7: OPERATOR PERFORMANCE */}
          {activeTab === "operator-performance" && (() => {
            // Enhanced Performance Data Generation (Synthetic but stable based on seed)
            const operatorStats = operators.map((op, idx) => {
              const seed = op.name.length + idx;
              
              // Volume: 10 to 60 customers
              const served = 20 + (seed * 3 % 40); 
              
              // Speed: 3 to 15 mins (lower is better, but formula will handle it)
              const avgTime = 4 + (seed % 11);
              
              // Wait Time: 2 to 20 mins (lower is better)
              const waitTime = 2 + ((seed * 2) % 18);
              
              // Availability: 50% to 100% active
              const activePercent = 60 + (seed % 40);
              
              return { op, served, avgTime, waitTime, activePercent };
            });

            // Calculate Team Averages
            const avgServed = operatorStats.reduce((sum, s) => sum + s.served, 0) / (operatorStats.length || 1);
            const avgAvgTime = operatorStats.reduce((sum, s) => sum + s.avgTime, 0) / (operatorStats.length || 1);
            const avgWaitTime = operatorStats.reduce((sum, s) => sum + s.waitTime, 0) / (operatorStats.length || 1);
            const avgActive = operatorStats.reduce((sum, s) => sum + s.activePercent, 0) / (operatorStats.length || 1);

            // Calculate rating
            const operatorsWithRating = operatorStats.map(stat => {
              // Normalize components against average (1.0 = team average)
              // Volume: higher is better
              const volScore = stat.served / avgServed;
              // Speed: lower is better, so avg / stat
              const speedScore = avgAvgTime / stat.avgTime;
              // Wait: lower is better, so avg / stat
              const waitScore = avgWaitTime / stat.waitTime;
              // Active: higher is better
              const activeScore = stat.activePercent / avgActive;

              const compositeScore = (volScore * 0.35) + (speedScore * 0.35) + (waitScore * 0.20) + (activeScore * 0.10);
              
              let ratingLabel = "Good";
              if (compositeScore >= 1.15) ratingLabel = "Excellent";
              else if (compositeScore < 0.85) ratingLabel = "Needs Improvement";

              return { ...stat, compositeScore, ratingLabel };
            });

            // Rank them
            const sortedOperators = operatorsWithRating.sort((a, b) => b.compositeScore - a.compositeScore);

            const itemsPerPage = 8;
            const totalPages = Math.ceil(sortedOperators.length / itemsPerPage);
            const paginatedOperators = sortedOperators.slice((operatorPage - 1) * itemsPerPage, operatorPage * itemsPerPage);

            return (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 font-rethink"
              >
                {selectedOperatorId ? (
                  /* VIEW DETAILS WORKSPACE (Screen 2) */
                  (() => {
                    const data = operatorsWithRating.find(d => d.op.id === selectedOperatorId);
                    if (!data) return null;
                    const { op, ratingLabel, served, avgTime, waitTime, activePercent } = data;
                    
                    const rank = sortedOperators.findIndex(d => d.op.id === selectedOperatorId) + 1;
                    
                    // Mock chart data over a week
                    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    const chartData = days.map((day, i) => {
                      const daySeed = op.name.length + i;
                      return {
                        day,
                        served: Math.max(5, served - 10 + (daySeed % 20)),
                        avgTime: Math.max(2, avgTime - 3 + (daySeed % 6)),
                        waitTime: Math.max(1, waitTime - 5 + (daySeed % 10))
                      };
                    });

                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <button
                          onClick={() => setSelectedOperatorId(null)}
                          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors w-fit cursor-pointer bg-white border border-slate-200/80 px-4 py-2 rounded-2xl shadow-sm"
                        >
                          <ArrowLeft className="w-4 h-4" /> ← Back to Team Overview
                        </button>
                        
                        <div className="bg-white border border-slate-200/80 rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                          {/* Header section */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8 mb-8">
                            <div className="flex items-center gap-6">
                              <div className="w-20 h-20 rounded-full bg-brand-navy/5 flex items-center justify-center text-3xl font-bold text-brand-navy shrink-0 border border-brand-navy/10">
                                {op.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-rethink text-3xl font-bold text-slate-900 tracking-tight">{op.name}</h3>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    op.status === "Active" ? "bg-emerald-100 text-emerald-700" :
                                    op.status === "Break" ? "bg-amber-100 text-amber-700" :
                                    "bg-slate-100 text-slate-700"
                                  }`}>
                                    {op.status}
                                  </span>
                                  <span className="text-slate-300">•</span>
                                  <span className={`text-sm font-semibold ${
                                    ratingLabel === "Excellent" ? "text-brand-cyan" :
                                    ratingLabel === "Good" ? "text-slate-600" : "text-amber-600"
                                  }`}>
                                    Performance: {ratingLabel}
                                  </span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-sm text-slate-500">Rank #{rank} of {operators.length}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Charts Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* Customers Served Chart */}
                            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                              <h4 className="text-lg font-bold text-slate-900 mb-1">Tokens Served</h4>
                              <p className="text-sm text-slate-500 mb-6">Consistently handling more tokens than average this week.</p>
                              <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip 
                                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                      itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                    />
                                    <Line type="monotone" dataKey="served" name="Served" stroke="#0f172a" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Average Time Chart */}
                            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                              <h4 className="text-lg font-bold text-slate-900 mb-1">Average Time per Customer</h4>
                              <p className="text-sm text-slate-500 mb-6">Slightly faster than usual on Thursdays.</p>
                              <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip 
                                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                      itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                    />
                                    <ReferenceLine y={avgAvgTime} stroke="#94a3b8" strokeDasharray="4 4" label={{ position: 'top', value: 'Team Average', fill: '#64748b', fontSize: 11 }} />
                                    <Line type="monotone" dataKey="avgTime" name="Mins/Customer" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Customer Wait Time */}
                            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                              <h4 className="text-lg font-bold text-slate-900 mb-1">How Long Customers Waited Because of Them</h4>
                              <p className="text-sm text-slate-500 mb-6">Wait times are keeping steady with team goals.</p>
                              <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip 
                                      cursor={{ fill: '#f1f5f9' }}
                                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                      itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="waitTime" name="Wait (mins)" fill="#94a3b8" radius={[6, 6, 0, 0]} barSize={32} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Time Active vs On Break */}
                            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                              <h4 className="text-lg font-bold text-slate-900 mb-1">How Busy Were They Today?</h4>
                              <p className="text-sm text-slate-500 mb-6">Time spent actively serving versus taking breaks.</p>
                              
                              <div className="flex flex-col justify-center h-48 px-4">
                                <div className="flex justify-between text-sm font-semibold mb-3">
                                  <span className="text-brand-navy">Active ({activePercent}%)</span>
                                  <span className="text-slate-400">On Break ({100 - activePercent}%)</span>
                                </div>
                                <div className="w-full h-8 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                                  <div 
                                    className="h-full bg-brand-navy transition-all duration-1000" 
                                    style={{ width: `${activePercent}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 mt-4">
                                  <span>Roughly {Math.floor(activePercent * 0.08)} hours</span>
                                  <span>Roughly {Math.floor((100 - activePercent) * 0.08)} hours</span>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      </motion.div>
                    );
                  })()
                ) : (
                  /* MAIN LEADERBOARD VIEW (Screen 1) */
                  <div className="space-y-6">
                    {/* Header with Title and Filters */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-slate-100">
                      <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-rethink">
                          Operator Performance
                        </h2>
                        <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
                          Track how fast and effectively your team is serving customers. Click on any operator to see a deep dive into their day.
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                         <select className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-2xl px-4 py-2.5 focus:outline-none focus:border-brand-cyan shadow-sm cursor-pointer appearance-none pr-10 relative">
                           <option>Today</option>
                           <option>This Week</option>
                           <option>This Month</option>
                           <option>Custom Range...</option>
                         </select>
                         <select className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-2xl px-4 py-2.5 focus:outline-none focus:border-brand-cyan shadow-sm cursor-pointer appearance-none pr-10 relative">
                           <option>All Shifts</option>
                           <option>Morning</option>
                           <option>Midday</option>
                           <option>Evening</option>
                         </select>
                      </div>
                    </div>

                    {/* MAIN OPERATORS ROSTER LIST */}
                    <div className="grid gap-3">
                      {paginatedOperators.map((data, idx) => {
                        const rank = (operatorPage - 1) * itemsPerPage + idx + 1;
                        let rankStyle = "bg-slate-100 text-slate-600 border-slate-200";
                        if (rank === 1) rankStyle = "bg-amber-100 text-amber-700 border-amber-200";
                        else if (rank === 2) rankStyle = "bg-slate-200 text-slate-700 border-slate-300";
                        else if (rank === 3) rankStyle = "bg-orange-100 text-orange-800 border-orange-200";

                        const op = data.op;

                        return (
                          <div 
                            key={op.id}
                            onClick={() => setSelectedOperatorId(op.id)}
                            className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:shadow-md hover:border-brand-navy/20 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-5">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${rankStyle}`}>
                                #{rank}
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-brand-cream/50 text-brand-navy flex items-center justify-center font-bold text-lg">
                                  {op.name.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 group-hover:text-brand-navy transition-colors">{op.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`w-2 h-2 rounded-full ${
                                      op.status === "Active" ? "bg-emerald-500" :
                                      op.status === "Break" ? "bg-amber-400" : "bg-slate-300"
                                    }`} />
                                    <span className="text-xs text-slate-500 font-medium">{op.status}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-8 sm:gap-12 pl-14 sm:pl-0">
                               <div className="flex flex-col items-start sm:items-end">
                                 <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Performance</span>
                                 <span className={`text-sm font-bold ${
                                    data.ratingLabel === "Excellent" ? "text-brand-cyan" :
                                    data.ratingLabel === "Good" ? "text-slate-700" : "text-amber-600"
                                  }`}>
                                   {data.ratingLabel}
                                 </span>
                               </div>
                               <div className="flex flex-col items-start sm:items-end w-32">
                                 <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quick Stat</span>
                                 <span className="text-sm font-medium text-slate-600 text-left sm:text-right">
                                   {data.served} customers served today
                                 </span>
                               </div>
                               <div className="hidden sm:flex text-slate-300 group-hover:text-brand-cyan transition-colors">
                                 <ArrowRight className="w-5 h-5" />
                               </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <p className="text-sm text-slate-500 font-medium">
                          Showing <span className="font-bold text-slate-900">{(operatorPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(operatorPage * itemsPerPage, sortedOperators.length)}</span> of <span className="font-bold text-slate-900">{sortedOperators.length}</span> operators
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setOperatorPage(p => Math.max(1, p - 1))}
                            disabled={operatorPage === 1}
                            className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setOperatorPage(p => Math.min(totalPages, p + 1))}
                            disabled={operatorPage === totalPages}
                            className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })()}

          {/* TAB: QUEUE TICKETS */}
          {activeTab === "queue-tickets" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <QueueTickets />
            </motion.div>
          )}

          {/* TAB 8: DEPARTMENTS MANAGER */}
          {activeTab === "departments-manager" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 font-rethink"
            >
              {isAddingDepartment ? (
                /* INLINE SUB-PAGE VIEW TRANSITION */
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Sleek back navigation link */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsAddingDepartment(false)}
                      className="flex items-center gap-2 text-slate-500 hover:text-[#0D1A5E] font-bold text-xs transition-colors cursor-pointer group"
                    >
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-[#0D1A5E]" />
                      <span>Back to Departments</span>
                    </button>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full border border-slate-200">
                      Step 2 of 2: Detailed Parameters
                    </span>
                  </div>

                  {/* Header / Intro */}
                  <div className="space-y-1.5">
                    <h3 className="text-xl md:text-2xl font-black text-[#0D1A5E] leading-tight">
                      Configure New Operational Pathway
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-3xl">
                      Deploy a fresh physical routing channel. Assign a designated SLA window, daily check-in token caps, overflow warnings, and operational schedules.
                    </p>
                  </div>

                  {/* Premium Configuration Form Container */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#00C3E3] via-[#0D1A5E] to-brand-navy" />
                    
                    <form onSubmit={handleAddDepartment} className="space-y-8">
                      {/* Grid 1: Basic Information */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-[#0D1A5E] uppercase tracking-widest border-b border-slate-100 pb-2">
                          1. Basic Channel Parameters
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Department Title */}
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                              Department Title
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Clinical Laboratory"
                              value={newDeptName}
                              onChange={(e) => setNewDeptName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00C3E3]/20 focus:border-brand-navy text-slate-700 transition-all placeholder-slate-400"
                            />
                          </div>

                          {/* Code Prefix */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                              Code Prefix (Max 2 chars)
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={2}
                              placeholder="e.g. L"
                              value={newDeptPrefix}
                              onChange={(e) => setNewDeptPrefix(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-center uppercase focus:outline-none focus:ring-2 focus:ring-[#00C3E3]/20 focus:border-brand-navy text-slate-700 transition-all placeholder-slate-300"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Grid 2: SLA & Routing paradigm */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-[#0D1A5E] uppercase tracking-widest border-b border-slate-100 pb-2">
                          2. Routing & SLA Standards
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* SLA Target */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                              SLA Target (Minutes)
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min={5}
                                max={120}
                                step={5}
                                value={newDeptSla}
                                onChange={(e) => setNewDeptSla(parseInt(e.target.value))}
                                className="flex-1 accent-[#0D1A5E] cursor-pointer"
                              />
                              <span className="font-mono text-xs font-black text-[#0D1A5E] bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 min-w-[70px] text-center">
                                {newDeptSla} min
                              </span>
                            </div>
                          </div>

                          {/* Routing Paradigm */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                              Routing Paradigm
                            </label>
                            <div className="relative">
                              <select
                                value={newDeptRoute}
                                onChange={(e: any) => setNewDeptRoute(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00C3E3]/20 focus:border-brand-navy text-slate-700 cursor-pointer appearance-none"
                              >
                                <option value="SLA-Optimized">SLA-Optimized (SLA Auto-adjust)</option>
                                <option value="Round-Robin">Round-Robin (Equal Load)</option>
                                <option value="Load-Balanced">Load-Balanced (Skill Mapping)</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Grid 3: Caps, Thresholds & Schedules */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-[#0D1A5E] uppercase tracking-widest border-b border-slate-100 pb-2">
                          3. Operational Limits & Active Schedules
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Token Limits */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                              Token Limits (Caps per Shift)
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setNewDeptTokenLimit(prev => Math.max(10, prev - 10))}
                                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center transition-all cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={10}
                                max={1000}
                                step={10}
                                required
                                value={newDeptTokenLimit}
                                onChange={(e) => setNewDeptTokenLimit(Math.max(10, parseInt(e.target.value) || 10))}
                                className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2 px-3.5 text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#00C3E3]/20 focus:border-brand-navy text-slate-700 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setNewDeptTokenLimit(prev => Math.min(1000, prev + 10))}
                                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center transition-all cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-1">Strict limit on active client slots generated per shift.</span>
                          </div>

                          {/* Overflow Threshold */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                              Overflow Alert Threshold
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setNewDeptOverflowThreshold(prev => Math.max(2, prev - 1))}
                                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center transition-all cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={2}
                                max={100}
                                required
                                value={newDeptOverflowThreshold}
                                onChange={(e) => setNewDeptOverflowThreshold(Math.max(2, parseInt(e.target.value) || 2))}
                                className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-2 px-3.5 text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#00C3E3]/20 focus:border-brand-navy text-slate-700 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setNewDeptOverflowThreshold(prev => Math.min(100, prev + 1))}
                                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center transition-all cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-1">Warn team when lobby queue count exceeds this limit.</span>
                          </div>

                          {/* Operating Hours */}
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                              Operating Hours Schedule
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="relative">
                                <select
                                  value={newDeptHoursStart}
                                  onChange={(e) => setNewDeptHoursStart(e.target.value)}
                                  className="w-full bg-[#0D1A5E] text-white border border-white/10 rounded-xl px-3.5 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 cursor-pointer appearance-none"
                                >
                                  <option value="06:00 AM">06:00 AM (Early Shift)</option>
                                  <option value="07:00 AM">07:00 AM</option>
                                  <option value="07:30 AM">07:30 AM</option>
                                  <option value="08:00 AM">08:00 AM (Standard Start)</option>
                                  <option value="08:30 AM">08:30 AM</option>
                                  <option value="09:00 AM">09:00 AM</option>
                                  <option value="10:00 AM">10:00 AM</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                              
                              <div className="relative">
                                <select
                                  value={newDeptHoursEnd}
                                  onChange={(e) => setNewDeptHoursEnd(e.target.value)}
                                  className="w-full bg-[#0D1A5E] text-white border border-white/10 rounded-xl px-3.5 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 cursor-pointer appearance-none"
                                >
                                  <option value="03:00 PM">03:00 PM</option>
                                  <option value="04:00 PM">04:00 PM</option>
                                  <option value="04:30 PM">04:30 PM</option>
                                  <option value="05:00 PM">05:00 PM (Standard Close)</option>
                                  <option value="06:00 PM">06:00 PM (Late Consultation)</option>
                                  <option value="07:00 PM">07:00 PM</option>
                                  <option value="08:00 PM">08:00 PM</option>
                                  <option value="09:00 PM">09:00 PM (Pharmacy Night)</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-1">Defines times when new ticket queue creation is enabled.</span>
                          </div>

                          {/* Scheduled Booking Toggle */}
                          <div className="space-y-1.5 md:col-span-2 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">Open for Scheduled Booking</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Allow patients to book slots ahead of arrival via app or web portal.</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                newDeptOpenForBooking 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                  : "bg-slate-100 text-slate-400 border border-slate-200"
                              }`}>
                                {newDeptOpenForBooking ? "Active" : "Inactive"}
                              </span>
                              <button
                                type="button"
                                onClick={() => setNewDeptOpenForBooking(!newDeptOpenForBooking)}
                                className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                                  newDeptOpenForBooking ? "bg-emerald-500" : "bg-slate-200"
                                }`}
                              >
                                <div className={`bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${
                                  newDeptOpenForBooking ? "translate-x-5" : "translate-x-0"
                                }`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsAddingDepartment(false)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-[#0D1A5E] hover:bg-brand-ocean text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4 text-brand-cyan" /> Save Department
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              ) : (
                /* DEPARTMENTS GRID VIEW */
                <>
                  {/* Premium Hero Intro Banner */}
                  <div className="relative bg-[#0D1A5E] text-white rounded-3xl p-6 md:p-8 overflow-hidden shadow-xl border border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/70 to-brand-navy/90 z-0" />
                    <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-brand-cyan/20 blur-3xl" />
                    <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl" />
                    
                    <div className="relative z-10 max-w-2xl space-y-2">
                      <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-[#00C3E3] mb-2">
                        <Sparkles className="w-3 h-3 text-[#00C3E3]" />
                        <span>SLA Configuration Core</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                        Facility Routing & Department SLA Controls
                      </h3>
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                        Configure operational pathways, define threshold timers, and structure traffic models to dynamically balance wait-time limits and operator work loads across counters.
                      </p>
                    </div>
                  </div>

                  {/* Header action bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-black text-[#0D1A5E]">Active Department Infrastructure</h4>
                      <p className="text-[11px] text-slate-400">Manage real-time compliance timers, prefixes, and thresholds.</p>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2.5 py-1.5 rounded-xl border border-slate-200">
                        {departments.length} Channels Loaded
                      </span>
                      <button
                        onClick={() => setIsAddingDepartment(true)}
                        className="bg-[#0D1A5E] hover:bg-brand-ocean text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4 text-[#00C3E3]" /> Add Department
                      </button>
                    </div>
                  </div>

                  {/* Departments List Bento Grid (Full width) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {departments.map((dept, idx) => {
                      const totalLoad = dept.activeCount || 0;
                      // Filter counters for this department
                      const deptCounters = counters.filter(c => c.departmentId === dept.id);
                      // Filter active/relevant queues for this department (case insensitive check)
                      const deptQueues = queueHistory.filter(q => q.department.toLowerCase() === dept.name.toLowerCase());

                      return (
                        <motion.div
                          key={dept.id}
                          layout
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group"
                        >
                          {/* Top Card Section */}
                          <div>
                            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                              <div className="flex items-center gap-3">
                                {/* Glowing letter icon */}
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-navy to-slate-800 text-white flex items-center justify-center font-black text-base shadow-md relative group-hover:scale-105 transition-transform">
                                  <div className="absolute inset-0 rounded-xl bg-brand-cyan/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <span className="relative z-10 text-[#00C3E3]">{dept.prefix}</span>
                                </div>
                                <div>
                                  <h5 className="text-sm font-black text-brand-navy group-hover:text-brand-ocean transition-colors">{dept.name}</h5>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-100">
                                      {dept.routeMode}
                                    </span>
                                    <span className="text-[9px] bg-slate-100 text-slate-600 font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200">
                                      🕒 {dept.operatingHoursStart || "08:00 AM"} - {dept.operatingHoursEnd || "05:00 PM"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${dept.name}?`)) {
                                    setDepartments(departments.filter(d => d.id !== dept.id));
                                    showAdminToast("success", `Department '${dept.name}' deleted.`);
                                  }
                                }}
                                className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors flex items-center justify-center cursor-pointer"
                                title="Delete Department"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Center SLA Stats */}
                            <div className="grid grid-cols-2 gap-4 my-4">
                              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Target SLA</span>
                                  <span className="font-mono text-xs font-black text-slate-700 block mt-0.5">{dept.targetSla} Minutes</span>
                                </div>
                                <Clock className="w-4 h-4 text-slate-400" />
                              </div>
                              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Visitor Load</span>
                                  <span className="text-xs font-black text-slate-700 block mt-0.5">{totalLoad} In Queue</span>
                                </div>
                                <Users className="w-4 h-4 text-slate-400" />
                              </div>
                            </div>

                            {/* New High-Density Metadata Row */}
                            <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-100 my-4 text-[10px] font-bold text-slate-500 bg-slate-50/50 -mx-6 px-6">
                              <div>
                                <span className="text-[8px] uppercase text-slate-400 block tracking-wider">Shift Cap</span>
                                <span className="text-slate-700 font-mono block mt-0.5">{dept.tokenLimit || 150} Tokens</span>
                              </div>
                              <div>
                                <span className="text-[8px] uppercase text-slate-400 block tracking-wider">Warn Threshold</span>
                                <span className="text-slate-700 font-mono block mt-0.5">{dept.overflowThreshold || 20} Waiting</span>
                              </div>
                              <div>
                                <span className="text-[8px] uppercase text-slate-400 block tracking-wider">Booking Portal</span>
                                <span className={`font-mono block mt-0.5 ${dept.openForScheduledBooking !== false ? "text-emerald-600 font-black" : "text-slate-400"}`}>
                                  {dept.openForScheduledBooking !== false ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>

                            {/* Capacity Load Progress Bar */}
                            <div className="space-y-1.5 pb-4 border-b border-slate-100">
                              <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-slate-400">Capacity Load</span>
                                <span className={totalLoad > (dept.overflowThreshold || 20) ? "text-amber-600 font-black" : "text-brand-navy"}>
                                  {totalLoad > (dept.overflowThreshold || 20) ? "High Traffic Warning" : "Optimal Speed"}
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, (totalLoad / (dept.overflowThreshold || 30)) * 100)}%` }}
                                  transition={{ duration: 0.6 }}
                                  className={`h-full rounded-full ${
                                    totalLoad > (dept.overflowThreshold || 20) ? "bg-amber-500" : "bg-[#0D1A5E]"
                                  }`}
                                />
                              </div>
                            </div>

                            {/* ASSIGNED ACTIVE COUNTERS SECTION */}
                            <div className="mt-5 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Active Counters ({deptCounters.length})</span>
                              </div>

                              {deptCounters.length === 0 ? (
                                <p className="text-[11px] text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-3 text-center italic">
                                  No active counters assigned to this department.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {deptCounters.map(c => (
                                    <div key={c.id} className="bg-slate-50/65 border border-slate-150 rounded-xl p-3 flex items-center justify-between hover:border-[#00C3E3]/40 transition-colors">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#00C3E3]" />
                                        <div>
                                          <span className="text-xs font-bold text-slate-700 block">{c.name}</span>
                                          <span className="text-[10px] text-slate-500">{c.operatorName}</span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                          c.status === "Active" 
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                            : c.status === "Break" 
                                            ? "bg-amber-50 text-amber-700 border border-amber-100" 
                                            : "bg-slate-100 text-slate-600 border border-slate-200"
                                        }`}>
                                          {c.status}
                                        </span>
                                        
                                        {/* Edit Counter */}
                                        <button
                                          onClick={() => {
                                            setEditingCounter(c);
                                            setEditCounterName(c.name);
                                            setEditCounterDeptId(c.departmentId);
                                            setEditCounterOperator(c.operatorName);
                                            setEditCounterStatus(c.status);
                                            setEditCounterChime(c.chimeEnabled);
                                            setEditCounterMaxTokens(c.maxConcurrentTokens || 3);
                                          }}
                                          className="w-6 h-6 rounded hover:bg-slate-200 text-slate-500 hover:text-brand-navy flex items-center justify-center transition-colors cursor-pointer"
                                          title="Edit Counter"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Delete Counter */}
                                        <button
                                          onClick={() => {
                                            if (confirm(`Are you sure you want to delete counter ${c.name}?`)) {
                                              setCounters(counters.filter(item => item.id !== c.id));
                                              showAdminToast("success", `Counter '${c.name}' deleted successfully.`);
                                            }
                                          }}
                                          className="w-6 h-6 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                                          title="Delete Counter"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* ACTIVE QUEUE TICKETS SECTION */}
                            <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Queue Tickets ({deptQueues.length})</span>

                              {deptQueues.length === 0 ? (
                                <p className="text-[11px] text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-3 text-center italic">
                                  No active tickets in queue.
                                </p>
                              ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                  {deptQueues.map(q => (
                                    <div key={q.id} className="bg-slate-50/65 border border-slate-150 rounded-xl p-3 flex items-center justify-between hover:border-brand-navy/20 transition-colors">
                                      <div className="flex items-center gap-2.5">
                                        <span className="font-mono text-xs font-black text-[#0D1A5E] bg-brand-navy/5 px-2 py-1 rounded">
                                          {q.ticketNumber}
                                        </span>
                                        <div>
                                          <span className="text-xs font-bold text-slate-700 block">{q.customerName}</span>
                                          <span className="text-[10px] text-slate-400">Wait: {q.waitTime} | Operator: {q.operator}</span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                          q.status === "In-Progress" 
                                            ? "bg-blue-50 text-blue-700 border border-blue-100" 
                                            : q.status === "Completed" 
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                            : q.status === "No-Show" 
                                            ? "bg-rose-50 text-rose-700 border border-rose-100" 
                                            : "bg-slate-100 text-slate-600 border border-slate-200"
                                        }`}>
                                          {q.status}
                                        </span>

                                        {/* Edit Ticket */}
                                        <button
                                          onClick={() => {
                                            setEditingQueueItem(q);
                                            setEditQueueTicketNumber(q.ticketNumber);
                                            setEditQueueCustomerName(q.customerName);
                                            setEditQueueDeptName(q.department);
                                            setEditQueueOperator(q.operator);
                                            setEditQueueWaitTime(q.waitTime);
                                            setEditQueueServiceTime(q.serviceTime);
                                            setEditQueueStatus(q.status);
                                          }}
                                          className="w-6 h-6 rounded hover:bg-slate-200 text-slate-500 hover:text-[#0D1A5E] flex items-center justify-center transition-colors cursor-pointer"
                                          title="Edit Ticket"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Delete Ticket */}
                                        <button
                                          onClick={() => {
                                            if (confirm(`Are you sure you want to remove ticket ${q.ticketNumber} from queue?`)) {
                                              setQueueHistory(queueHistory.filter(item => item.id !== q.id));
                                              showAdminToast("success", `Ticket '${q.ticketNumber}' deleted.`);
                                            }
                                          }}
                                          className="w-6 h-6 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                                          title="Delete Ticket"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* TAB 9: COUNTERS MANAGER */}
          {activeTab === "counters-manager" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 font-rethink"
            >
              {isAddingCounter ? (
                /* INLINE SUB-PAGE VIEW TRANSITION */
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Sleek back navigation link */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsAddingCounter(false)}
                      className="flex items-center gap-2 text-slate-500 hover:text-[#0D1A5E] font-bold text-xs transition-colors cursor-pointer group"
                    >
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-[#0D1A5E]" />
                      <span>Back to Counters</span>
                    </button>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full border border-slate-200">
                      Terminal Provisioning Engine
                    </span>
                  </div>

                  {/* Header / Intro */}
                  <div className="space-y-1.5">
                    <h3 className="text-xl md:text-2xl font-black text-[#0D1A5E] leading-tight">
                      Onboard New Service Terminal
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-3xl">
                      Configure a new physical or virtual service desk. Map it to an active operational department pathway, assign default operator credentials, set live ticket caps, and toggle real-time status signals.
                    </p>
                  </div>

                  {/* Premium Configuration Form Container */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#00C3E3] via-[#0D1A5E] to-brand-navy" />
                    
                    <form onSubmit={handleAddCounterSubmit} className="space-y-8">
                      {/* Grid: Primary Configurations */}
                      <div className="space-y-6">
                        <h4 className="text-xs font-black text-[#0D1A5E] uppercase tracking-widest border-b border-slate-100 pb-2">
                          Terminal Mapping & Limits
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Searchable Custom Select for Assigned Department */}
                          <div className="space-y-1.5 relative">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                              Assigned Department Pathway
                            </label>
                            
                            <div className="relative">
                              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="text"
                                placeholder="Search & select department..."
                                value={deptSearchTerm}
                                onChange={(e) => {
                                  setDeptSearchTerm(e.target.value);
                                  setIsDeptDropdownOpen(true);
                                }}
                                onFocus={() => setIsDeptDropdownOpen(true)}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00C3E3]/20 focus:border-brand-navy text-slate-700 transition-all placeholder-slate-400"
                              />
                              <button
                                type="button"
                                onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all"
                              >
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDeptDropdownOpen ? "rotate-180" : ""}`} />
                              </button>
                            </div>

                            {/* Dropdown list of matching departments */}
                            {isDeptDropdownOpen && (
                              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto no-scrollbar">
                                {(() => {
                                  const filtered = departments.filter(d => 
                                    d.name.toLowerCase().includes(deptSearchTerm.toLowerCase()) ||
                                    d.prefix.toLowerCase().includes(deptSearchTerm.toLowerCase())
                                  );
                                  return filtered.length === 0 ? (
                                    <div className="p-3 text-center text-xs text-slate-400 italic">
                                      No matching departments found
                                    </div>
                                  ) : (
                                    filtered.map((dept) => (
                                      <button
                                        key={dept.id}
                                        type="button"
                                        onClick={() => {
                                          setNewCounterDeptId(dept.id);
                                          setDeptSearchTerm(dept.name);
                                          setIsDeptDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between ${
                                          newCounterDeptId === dept.id ? "bg-slate-50/80 font-black text-[#0D1A5E]" : "font-semibold text-slate-600"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="w-5 h-5 rounded bg-brand-navy/5 text-brand-navy text-[9px] font-black flex items-center justify-center shrink-0">
                                            {dept.prefix}
                                          </span>
                                          <span>{dept.name}</span>
                                        </div>
                                        {newCounterDeptId === dept.id && (
                                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                                        )}
                                      </button>
                                    ))
                                  );
                                })()}
                              </div>
                            )}
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Maps incoming queue tickets of the selected pathway directly to this terminal.
                            </span>
                          </div>

                          {/* Counter Designation */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                              Counter Designation / Label
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Counter 05 or Express Desk B"
                              value={newCounterName}
                              onChange={(e) => setNewCounterName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00C3E3]/20 focus:border-brand-navy text-slate-700 transition-all placeholder-slate-400"
                            />
                            <span className="text-[10px] text-slate-400 block mt-1">
                              The physical or virtual identifier visible to lobby visitors and display boards.
                            </span>
                          </div>

                          {/* Max Concurrent Tokens */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                              Max Concurrent Tokens
                            </label>
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 w-max">
                              <button
                                type="button"
                                onClick={() => setNewCounterMaxTokens(Math.max(1, newCounterMaxTokens - 1))}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-sm select-none cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-mono font-black text-sm text-slate-800 w-8 text-center">
                                {newCounterMaxTokens}
                              </span>
                              <button
                                type="button"
                                onClick={() => setNewCounterMaxTokens(newCounterMaxTokens + 1)}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-sm select-none cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Limits how many active queue tokens this specific desk can load or hold at any given time.
                            </span>
                          </div>

                          {/* Assigned Default Operator */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                              Designated Terminal Operator
                            </label>
                            <div className="relative">
                              <select
                                value={newCounterOperator}
                                onChange={(e) => setNewCounterOperator(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00C3E3]/20 focus:border-brand-navy text-slate-700 cursor-pointer appearance-none"
                              >
                                {operators.map(op => (
                                  <option key={op.id} value={op.name}>{op.name} ({op.role})</option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Sets the operator account default-mapped to handle tasks on this terminal.
                            </span>
                          </div>

                          {/* Counter Status (Premium Switch) */}
                          <div className="space-y-1.5 md:col-span-2 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">Initial Counter Status</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Set whether this terminal boots as Active (Serving) or Inactive (Idle) immediately.
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                newCounterStatus === "Active" 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                  : "bg-slate-100 text-slate-400 border border-slate-200"
                              }`}>
                                {newCounterStatus === "Active" ? "Active" : "Inactive"}
                              </span>
                              <button
                                type="button"
                                onClick={() => setNewCounterStatus(newCounterStatus === "Active" ? "Idle" : "Active")}
                                className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                                  newCounterStatus === "Active" ? "bg-emerald-500" : "bg-slate-200"
                                }`}
                              >
                                <div className={`bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${
                                  newCounterStatus === "Active" ? "translate-x-5" : "translate-x-0"
                                }`} />
                              </button>
                            </div>
                          </div>

                          {/* Sound Chime Alert Toggle */}
                          <div className="space-y-1.5 md:col-span-2 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">Sound Chime Signal</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Automatically broadcast an audio chime signal to the lobby when calling new ticket holders.
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setNewCounterChime(!newCounterChime)}
                              className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                                newCounterChime ? "bg-[#0D1A5E]" : "bg-slate-200"
                              }`}
                            >
                              <div className={`bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${
                                newCounterChime ? "translate-x-5" : "translate-x-0"
                              }`} />
                            </button>
                          </div>

                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsAddingCounter(false)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-[#0D1A5E] hover:bg-brand-ocean text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4 text-[#00C3E3]" /> Save Counter
                        </button>
                      </div>

                    </form>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Counter Stats Banner Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#0D1A5E] text-white rounded-3xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden md:col-span-2 border border-white/10">
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 to-slate-900 z-0" />
                      <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-brand-cyan/15 blur-2xl" />
                      
                      <div className="relative z-10 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-cyan block">Terminal Settings</span>
                        <h3 className="text-lg font-black leading-tight text-white">Physical Service Terminals</h3>
                        <p className="text-[11px] text-slate-300 max-w-sm">
                          Configure service counter titles, assign operator logins, and toggle lobby sound chime signals.
                        </p>
                      </div>
                      
                      <div className="relative z-10 pt-4 mt-4 border-t border-white/10">
                        <button
                          onClick={() => {
                            setNewCounterName("");
                            setNewCounterDeptId(departments[0]?.id || "1");
                            const initialDeptName = departments[0]?.name || "";
                            setDeptSearchTerm(initialDeptName);
                            setNewCounterOperator(operators[0]?.name || "Amira Patel");
                            setNewCounterStatus("Idle");
                            setNewCounterChime(true);
                            setNewCounterMaxTokens(3);
                            setIsAddingCounter(true);
                          }}
                          className="bg-[#00C3E3] hover:bg-white text-[#0D1A5E] px-4.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#00C3E3]/15 active:scale-95 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4 font-black" /> Add Active Counter
                        </button>
                      </div>
                    </div>

                    {/* KPI stat cards */}
                    <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Online Counters</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Laptop className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                      <div className="pt-4">
                        <h4 className="text-3xl font-black text-brand-navy leading-none font-mono">
                          {counters.filter(c => c.status === "Active").length}
                        </h4>
                        <span className="text-[10px] text-emerald-600 font-bold block mt-1.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live serving clients
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sound Chime Alerts</span>
                        <div className="w-8 h-8 rounded-lg bg-brand-navy/5 text-brand-navy flex items-center justify-center">
                          <Volume2 className="w-4 h-4 text-brand-navy" />
                        </div>
                      </div>
                      <div className="pt-4">
                        <h4 className="text-3xl font-black text-brand-navy leading-none font-mono">
                          {counters.filter(c => c.chimeEnabled).length} / {counters.length}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">
                          Chime signals active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Counter Terminal Filtering and Search UI */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-black text-brand-navy">Terminal Management System</h4>
                        <p className="text-[11px] text-slate-400">Search, filter, edit, and adjust counter setups dynamically.</p>
                      </div>
                      <div className="text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 self-start md:self-auto">
                        Showing <span className="text-brand-navy font-black">{filteredCounters.length}</span> of <span className="text-brand-navy font-black">{counters.length}</span> Terminals
                      </div>
                    </div>

                    {/* Search & Filter Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Search Input */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search counter or operator..."
                          value={counterSearchQuery}
                          onChange={(e) => setCounterSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-9 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-brand-navy rounded-xl text-xs font-semibold focus:outline-none transition-all placeholder-slate-400 text-slate-700"
                        />
                        {counterSearchQuery && (
                          <button
                            onClick={() => setCounterSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Department Filter */}
                      <div className="relative">
                        <select
                          value={counterDeptFilter}
                          onChange={(e) => setCounterDeptFilter(e.target.value)}
                          className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-navy cursor-pointer appearance-none transition-colors"
                        >
                          <option value="All">All Departments</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Status Filter */}
                      <div className="relative">
                        <select
                          value={counterStatusFilter}
                          onChange={(e) => setCounterStatusFilter(e.target.value)}
                          className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-navy cursor-pointer appearance-none transition-colors"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Active">Active</option>
                          <option value="Idle">Idle</option>
                          <option value="Break">Break</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Counters List (Highly Polished Table/List format) */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-150">
                      {filteredCounters.length === 0 ? (
                        <div className="py-12 text-center space-y-3">
                          <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                            <Laptop className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-black text-brand-navy">No Counters Found</p>
                            <p className="text-[11px] text-slate-400">Adjust your search query or filter values.</p>
                          </div>
                          {(counterSearchQuery || counterDeptFilter !== "All" || counterStatusFilter !== "All") && (
                            <button
                              onClick={() => {
                                setCounterSearchQuery("");
                                setCounterDeptFilter("All");
                                setCounterStatusFilter("All");
                              }}
                              className="text-[11px] font-bold text-brand-navy hover:text-brand-ocean bg-slate-100 px-3.5 py-1.5 rounded-xl transition-all"
                            >
                              Reset Filters
                            </button>
                          )}
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse min-w-[750px]">
                          <thead>
                            <tr className="bg-slate-50/75 border-b border-slate-150 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                              <th className="px-5 py-4">Terminal Title</th>
                              <th className="px-5 py-4">Assigned Department</th>
                              <th className="px-5 py-4">Terminal Operator</th>
                              <th className="px-5 py-4 text-center">Live Cap</th>
                              <th className="px-5 py-4 text-center">Chime Signal</th>
                              <th className="px-5 py-4 text-center">Status</th>
                              <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {filteredCounters.map((counter) => {
                              const dept = departments.find(d => d.id === counter.departmentId);
                              const isChimeOn = counter.chimeEnabled;
                              
                              // Determine avatar background color
                              const initials = counter.operatorName ? counter.operatorName.charAt(0) : "O";
                              const avatarColors = [
                                "bg-[#0D1A5E]/10 text-[#0D1A5E]",
                                "bg-emerald-100 text-emerald-800",
                                "bg-amber-100 text-amber-800",
                                "bg-sky-100 text-sky-800",
                                "bg-rose-100 text-rose-800",
                                "bg-purple-100 text-purple-800"
                              ];
                              const colorIndex = (counter.operatorName ? counter.operatorName.length : 0) % avatarColors.length;
                              const selectedAvatarStyle = avatarColors[colorIndex];

                              return (
                                <tr key={counter.id} className="hover:bg-slate-50/40 transition-colors group">
                                  {/* Counter Name */}
                                  <td className="px-5 py-4.5">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-2.5 h-2.5 rounded-full bg-brand-cyan/20 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                                      </div>
                                      <span className="font-rethink font-bold text-brand-navy group-hover:text-brand-ocean transition-colors">
                                        {counter.name}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Department */}
                                  <td className="px-5 py-4.5">
                                    {dept ? (
                                      <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-brand-navy/5 text-[#0D1A5E] text-[10px] font-black flex items-center justify-center shrink-0">
                                          {dept.prefix}
                                        </span>
                                        <span className="font-semibold text-slate-700">
                                          {dept.name}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 font-medium italic">Unassigned</span>
                                    )}
                                  </td>

                                  {/* Operator */}
                                  <td className="px-5 py-4.5">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-[11px] shrink-0 border border-white shadow-sm ${selectedAvatarStyle}`}>
                                        {initials}
                                      </div>
                                      <div>
                                        <span className="font-bold text-slate-800 block leading-tight">{counter.operatorName}</span>
                                        <span className="text-[10px] text-slate-400 font-semibold block">Operator Login</span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Live Cap */}
                                  <td className="px-5 py-4.5 text-center font-mono text-xs font-black text-slate-600">
                                    {counter.maxConcurrentTokens || 3} Live
                                  </td>

                                  {/* Audio Chime Switch */}
                                  <td className="px-5 py-4.5 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() => {
                                          const updated = counters.map(c => c.id === counter.id ? { ...c, chimeEnabled: !c.chimeEnabled } : c);
                                          setCounters(updated);
                                          showAdminToast("success", `Sound chime ${!isChimeOn ? "enabled" : "silenced"} for ${counter.name}.`);
                                        }}
                                        className={`w-8 h-8 rounded-xl inline-flex items-center justify-center border transition-all ${
                                          isChimeOn 
                                            ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100/70" 
                                            : "bg-slate-50 border-slate-150 text-slate-400 hover:bg-slate-100/70"
                                        }`}
                                        title={isChimeOn ? "Audio Chime Enabled" : "Silent Mode"}
                                      >
                                        <span className="material-symbols-outlined select-none text-[16px] font-bold">
                                          {isChimeOn ? "volume_up" : "volume_off"}
                                        </span>
                                      </button>
                                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isChimeOn ? "text-emerald-600" : "text-slate-400"}`}>
                                        {isChimeOn ? "Active" : "Muted"}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Status Badge */}
                                  <td className="px-5 py-4.5 text-center">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border">
                                      {counter.status === "Active" && (
                                        <>
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                          <span className="text-emerald-700">Active</span>
                                        </>
                                      )}
                                      {counter.status === "Idle" && (
                                        <>
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                          <span className="text-amber-700">Idle</span>
                                        </>
                                      )}
                                      {counter.status === "Break" && (
                                        <>
                                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                          <span className="text-purple-700">Break</span>
                                        </>
                                      )}
                                    </div>
                                  </td>

                                  {/* Action buttons (Edit & Delete) */}
                                  <td className="px-5 py-4.5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      {/* Edit Button */}
                                      <button
                                        onClick={() => {
                                          setEditingCounter(counter);
                                          setEditCounterName(counter.name);
                                          setEditCounterDeptId(counter.departmentId);
                                          setEditCounterOperator(counter.operatorName);
                                          setEditCounterStatus(counter.status);
                                          setEditCounterChime(counter.chimeEnabled);
                                          setEditCounterMaxTokens(counter.maxConcurrentTokens || 3);
                                        }}
                                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-brand-navy rounded-lg transition-colors cursor-pointer"
                                        title="Edit Terminal Parameters"
                                      >
                                        <SlidersHorizontal className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Delete Button with in-app confirm overlay state */}
                                      <button
                                        onClick={() => setDeleteConfirmCounterId(counter.id)}
                                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                        title="Delete Terminal"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Custom In-App Modal Dialogs */}
              <AnimatePresence>
                {/* 1. Add Counter Modal */}
                {isAddCounterModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsAddCounterModalOpen(false)}
                      className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0, y: 15 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0, y: 15 }}
                      className="bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden relative z-10"
                    >
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-cyan to-brand-navy" />
                      
                      {/* Modal Header */}
                      <div className="flex items-center justify-between p-5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-brand-navy/5 text-brand-navy flex items-center justify-center">
                            <Plus className="w-4 h-4 text-brand-navy" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-brand-navy">Add Active Terminal</h4>
                            <p className="text-[10px] text-slate-400">Deploy a fresh service terminal</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsAddCounterModalOpen(false)}
                          className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Modal Body / Form */}
                      <form onSubmit={handleAddCounterSubmit} className="p-5 space-y-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Counter Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Counter 07"
                            value={newCounterName}
                            onChange={(e) => setNewCounterName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 transition-all placeholder-slate-400"
                          />
                        </div>

                        {/* Operator */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Assigned Operator</label>
                          <div className="relative">
                            <select
                              value={newCounterOperator}
                              onChange={(e) => setNewCounterOperator(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 cursor-pointer appearance-none"
                            >
                              {operators.map(op => (
                                <option key={op.id} value={op.name}>{op.name} ({op.role})</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Department */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Operational Department Route</label>
                          <div className="relative">
                            <select
                              value={newCounterDeptId}
                              onChange={(e) => setNewCounterDeptId(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 cursor-pointer appearance-none"
                            >
                              {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Initial Status</label>
                          <div className="relative">
                            <select
                              value={newCounterStatus}
                              onChange={(e: any) => setNewCounterStatus(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 cursor-pointer appearance-none"
                            >
                              <option value="Active">Active / Serving</option>
                              <option value="Idle">Idle / Waiting</option>
                              <option value="Break">Break / Scheduled Out</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Chime Switch */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-[10px] font-bold text-slate-800 block">Sound Chime Signal</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">Alert lobby dynamically on client call</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewCounterChime(!newCounterChime)}
                            className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                              newCounterChime ? "bg-[#0D1A5E]" : "bg-slate-200"
                            }`}
                          >
                            <div className={`bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${
                              newCounterChime ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsAddCounterModalOpen(false)}
                            className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 bg-[#0D1A5E] hover:bg-brand-ocean text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#00C3E3]" /> Save Terminal
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}

                {/* 2. Edit Counter Modal */}
                {editingCounter && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setEditingCounter(null)}
                      className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0, y: 15 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0, y: 15 }}
                      className="bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden relative z-10"
                    >
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-navy to-brand-cyan" />
                      
                      {/* Modal Header */}
                      <div className="flex items-center justify-between p-5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-brand-navy/5 text-brand-navy flex items-center justify-center">
                            <SlidersHorizontal className="w-4 h-4 text-[#0D1A5E]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-brand-navy">Configure Terminal</h4>
                            <p className="text-[10px] text-slate-400">Modify `{editingCounter.name}` parameters</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setEditingCounter(null)}
                          className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Modal Body / Form */}
                      <form onSubmit={handleEditCounterSubmit} className="p-5 space-y-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Counter Title</label>
                          <input
                            type="text"
                            required
                            value={editCounterName}
                            onChange={(e) => setEditCounterName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 transition-all"
                          />
                        </div>

                        {/* Operator Selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Terminal Operator</label>
                          <div className="relative">
                            <select
                              value={editCounterOperator}
                              onChange={(e) => setEditCounterOperator(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 cursor-pointer appearance-none"
                            >
                              {operators.map(op => (
                                <option key={op.id} value={op.name}>{op.name} ({op.role})</option>
                              ))}
                              {!operators.some(o => o.name === editCounterOperator) && (
                                <option value={editCounterOperator}>{editCounterOperator}</option>
                              )}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Department */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Assigned Queue Route</label>
                          <div className="relative">
                            <select
                              value={editCounterDeptId}
                              onChange={(e) => setEditCounterDeptId(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 cursor-pointer appearance-none"
                            >
                              {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Operational Status</label>
                          <div className="relative">
                            <select
                              value={editCounterStatus}
                              onChange={(e: any) => setEditCounterStatus(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 cursor-pointer appearance-none"
                            >
                              <option value="Active">Active</option>
                              <option value="Idle">Idle</option>
                              <option value="Break">Break</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Max Concurrent Tokens */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Max Concurrent Tokens</label>
                          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 w-max">
                            <button
                              type="button"
                              onClick={() => setEditCounterMaxTokens(Math.max(1, editCounterMaxTokens - 1))}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-sm select-none cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-mono font-black text-sm text-slate-800 w-8 text-center">
                              {editCounterMaxTokens}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditCounterMaxTokens(editCounterMaxTokens + 1)}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-sm select-none cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Chime Switch */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-[10px] font-bold text-slate-800 block">Sound Chime Signal</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">Toggle sound alert dynamically</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditCounterChime(!editCounterChime)}
                            className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                              editCounterChime ? "bg-[#0D1A5E]" : "bg-slate-200"
                            }`}
                          >
                            <div className={`bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${
                              editCounterChime ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setEditingCounter(null)}
                            className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 bg-[#0D1A5E] hover:bg-brand-ocean text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5 text-brand-cyan" /> Update Config
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}

                {/* 3. Delete Confirmation Overlay Dialog */}
                {deleteConfirmCounterId && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setDeleteConfirmCounterId(null)}
                      className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Content */}
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0, y: 15 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0, y: 15 }}
                      className="bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-sm overflow-hidden relative z-10 p-6 space-y-4"
                    >
                      <div className="flex items-center gap-3 text-rose-600">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                          <Trash2 className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">Delete Service Counter?</h4>
                          <p className="text-[10px] text-slate-400">This configuration action cannot be undone.</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        Are you sure you want to permanently delete <strong>{counters.find(c => c.id === deleteConfirmCounterId)?.name}</strong>? It will instantly be removed from display boards.
                      </p>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={() => setDeleteConfirmCounterId(null)}
                          className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            const counterToDelete = counters.find(c => c.id === deleteConfirmCounterId);
                            if (counterToDelete) {
                              setCounters(counters.filter(c => c.id !== deleteConfirmCounterId));
                              showAdminToast("success", `Terminal '${counterToDelete.name}' deleted.`);
                            }
                            setDeleteConfirmCounterId(null);
                          }}
                          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-center"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* TAB 10: OPERATORS DIRECTORY */}
          {activeTab === "operators-manager" && (() => {
            const filteredOperators = operators.filter(op => {
              const emailStr = op.email || `${op.name.toLowerCase().replace(" ", ".")}@linely.com`;
              return op.name.toLowerCase().includes(operatorSearchQuery.toLowerCase()) || 
                emailStr.toLowerCase().includes(operatorSearchQuery.toLowerCase()) ||
                op.role.toLowerCase().includes(operatorSearchQuery.toLowerCase());
            });

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {isAddingOperator ? (
                  /* INLINE CONFIGURATION VIEW (ADD & EDIT WORKSPACE) */
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setIsAddingOperator(false);
                          setEditingOperator(null);
                          setNewOperatorName("");
                          setNewOperatorEmail("");
                          setNewOperatorDept("1");
                          setNewOperatorRole("Junior Operator");
                          setNewOperatorShift("Morning Peak Shift");
                        }}
                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand-cyan transition-colors w-fit cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-brand-cyan" /> Back to Operators
                      </button>
                      <div>
                        <h3 className="font-rethink text-lg font-black text-slate-900 capitalize">
                          {editingOperator ? `Modify Operator Profile: ${editingOperator.name}` : "Invite System Operator"}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {editingOperator ? "Update role permissions, queue assignments, and operational shifts" : "Invite a new customer service desk operator and assign queue routing parameters"}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleAddOperator} className="space-y-6 bg-[#0B0F19] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                      {/* Gradient Accent Bar */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-cyan via-brand-ocean to-[#0D1A5E]" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Operator Full Name */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Operator Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Richard Hendricks"
                            value={newOperatorName}
                            onChange={(e) => setNewOperatorName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:bg-white/10 focus:border-brand-cyan rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 transition-all placeholder:text-slate-500"
                          />
                        </div>

                        {/* Operator Email Address */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Operator Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. richard@hooli.xyz"
                            value={newOperatorEmail}
                            onChange={(e) => setNewOperatorEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:bg-white/10 focus:border-brand-cyan rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 transition-all placeholder:text-slate-500"
                          />
                        </div>

                        {/* Role Grade */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Role Access Grade</label>
                          <div className="relative">
                            <select
                              value={newOperatorRole}
                              onChange={(e: any) => setNewOperatorRole(e.target.value)}
                              className="w-full bg-[#0B0F19] border border-white/10 focus:border-brand-cyan focus:bg-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-200 cursor-pointer focus:outline-none appearance-none"
                            >
                              <option value="Junior Operator" className="bg-[#0B0F19] text-white">Junior Operator (Basic Queue)</option>
                              <option value="Senior Operator" className="bg-[#0B0F19] text-white">Senior Operator (Multi-Queue)</option>
                              <option value="Specialist" className="bg-[#0B0F19] text-white">Specialist (Priority Queue)</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Assigned Department */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Queue Sector Assignment</label>
                          <div className="relative">
                            <select
                              value={newOperatorDept}
                              onChange={(e) => setNewOperatorDept(e.target.value)}
                              className="w-full bg-[#0B0F19] border border-white/10 focus:border-brand-cyan focus:bg-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-200 cursor-pointer focus:outline-none appearance-none"
                            >
                              {departments.map(d => (
                                <option key={d.id} value={d.id} className="bg-[#0B0F19] text-white">
                                  {d.name} ({d.prefix})
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Assigned Shift */}
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">Assigned Operational Shift</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {shifts.map(sh => {
                              const isSelected = newOperatorShift === sh.name;
                              return (
                                <button
                                  key={sh.id}
                                  type="button"
                                  onClick={() => setNewOperatorShift(sh.name)}
                                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                    isSelected 
                                      ? "bg-brand-navy/35 border-brand-cyan text-white shadow-md shadow-brand-cyan/5" 
                                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20"
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 justify-between">
                                    <span className={`text-[9px] uppercase tracking-wider font-bold ${isSelected ? "text-brand-cyan" : "text-slate-400"}`}>
                                      {sh.isActive ? "Live Shift" : "Backup Shift"}
                                    </span>
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  </div>
                                  <h5 className="font-rethink text-xs font-bold text-slate-100 mt-2">{sh.name}</h5>
                                  <p className="text-[10px] text-slate-400 mt-1">{sh.timeRange}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Descriptive Info Note */}
                      <div className="text-[11px] text-slate-300 leading-relaxed bg-white/5 border border-white/5 rounded-xl p-4.5 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-navy/20 text-brand-cyan border border-brand-cyan/10 flex items-center justify-center shrink-0">
                          <HelpCircle className="w-4 h-4 text-brand-cyan" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">Automatic Security Notification Dispatcher</span>
                          <p className="mt-0.5 text-slate-400 leading-relaxed">
                            Saving will automatically dispatch a secure access link to the operator's email. Upon acceptance, the operator will be authorized to log in to their dedicated Operator Panel via this assigned email address.
                          </p>
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingOperator(false);
                            setEditingOperator(null);
                            setNewOperatorName("");
                            setNewOperatorEmail("");
                            setNewOperatorDept("1");
                            setNewOperatorRole("Junior Operator");
                            setNewOperatorShift("Morning Peak Shift");
                          }}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-brand-ocean hover:bg-[#00C3E3] hover:text-brand-navy border border-brand-ocean/20 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-brand-cyan" />
                          {editingOperator ? "Update Profile" : "Dispatch Invite Link"}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* ADVANCED BORDERLESS GOOGLE-STYLE DATA GRID */
                  <div className="space-y-6">
                    {/* Upper Actions Toolbar */}
                    <div className="bg-[#0B0F19] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-brand-navy/25 border border-white/10 flex items-center justify-center text-brand-cyan">
                          <Users className="w-5 h-5 text-brand-cyan" />
                        </div>
                        <div>
                          <h4 className="font-rethink font-bold text-sm text-slate-100">System Operators Ledger</h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Manage configured desk agents, assign queue sectors, and dispatch secure system invitations
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative flex-1 md:w-64">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Search operator..."
                            value={operatorSearchQuery}
                            onChange={(e) => setOperatorSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:bg-white/10 focus:border-brand-cyan rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan/20 transition-all"
                          />
                          {operatorSearchQuery && (
                            <button
                              onClick={() => setOperatorSearchQuery("")}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setEditingOperator(null);
                            setNewOperatorName("");
                            setNewOperatorEmail("");
                            setNewOperatorDept("1");
                            setNewOperatorRole("Junior Operator");
                            setNewOperatorShift("Morning Peak Shift");
                            setIsAddingOperator(true);
                          }}
                          className="bg-brand-ocean hover:bg-[#00C3E3] hover:text-brand-navy text-white font-bold text-xs px-4.5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5 text-brand-cyan" /> Invite Operator
                        </button>
                      </div>
                    </div>

                    {/* Table Data Grid */}
                    <div className="bg-[#0B0F19] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        {filteredOperators.length === 0 ? (
                          <div className="p-12 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mx-auto">
                              <Search className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                              <h5 className="font-rethink text-sm font-bold text-slate-100">No operators matching search criteria</h5>
                              <p className="text-xs text-slate-400 mt-1">Refine your search term and try again</p>
                            </div>
                          </div>
                        ) : (
                          <table className="w-full border-collapse text-left">
                            <thead>
                              <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operator (Name & Profile)</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Department</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Shift</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Badge</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {filteredOperators.map((op) => {
                                const dept = departments.find(d => d.id === op.departmentId);
                                const opEmail = op.email || `${op.name.toLowerCase().replace(" ", ".")}@linely.com`;
                                const opShift = op.shift || "Morning Peak Shift";
                                return (
                                  <tr key={op.id} className="hover:bg-white/[0.02] transition-colors group">
                                    {/* Name and Profile Stack */}
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-brand-navy text-brand-cyan border border-brand-cyan/20 flex items-center justify-center font-bold text-sm shadow-inner group-hover:scale-105 transition-transform">
                                          {op.name.charAt(0)}
                                        </div>
                                        <div>
                                          <h5 className="font-rethink text-xs font-bold text-slate-100">{op.name}</h5>
                                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{opEmail}</span>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Department Badge */}
                                    <td className="px-6 py-4">
                                      <span className="inline-flex items-center gap-1 bg-brand-navy/35 text-brand-cyan border border-brand-cyan/20 font-bold px-2.5 py-1 text-[10px] rounded-full uppercase tracking-wider">
                                        {dept ? dept.name : "Unassigned"}
                                      </span>
                                    </td>

                                    {/* Assigned Shift */}
                                    <td className="px-6 py-4 text-xs font-medium text-slate-300">
                                      {opShift}
                                    </td>

                                    {/* Status Badge Indicator */}
                                    <td className="px-6 py-4">
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                        op.status === "Active" 
                                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                          : op.status === "Pending Invitation"
                                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                          : "bg-white/5 text-slate-400 border-white/10"
                                      }`}>
                                        {op.status === "Active" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                        {op.status === "Pending Invitation" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                                        {(op.status === "Inactive" || op.status === "Break" || op.status === "Offline") && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                                        {op.status}
                                      </span>
                                    </td>

                                    {/* Actions button group */}
                                    <td className="px-6 py-4 text-right">
                                      <div className="flex items-center justify-end gap-2.5">
                                        <button
                                          onClick={() => {
                                            setEditingOperator(op);
                                            setNewOperatorName(op.name);
                                            setNewOperatorEmail(opEmail);
                                            setNewOperatorDept(op.departmentId);
                                            setNewOperatorRole(op.role);
                                            setNewOperatorShift(opShift);
                                            setIsAddingOperator(true);
                                          }}
                                          className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-brand-cyan rounded-lg transition-colors cursor-pointer"
                                          title="Edit Operator parameters"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                          onClick={() => setDeleteConfirmOperatorId(op.id)}
                                          className="p-1.5 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                                          title="Delete Operator"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>

                    {/* Elegant AlertDialog Confirmation Modal overlay */}
                    <AnimatePresence>
                      {deleteConfirmOperatorId && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                          {/* Backdrop with extreme blur and subtle deep-dark background */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteConfirmOperatorId(null)}
                            className="absolute inset-0 bg-[#060814]/75 backdrop-blur-md"
                          />

                          {/* Content modal panel */}
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 15 }}
                            className="bg-[#0F1322] border border-white/15 rounded-3xl w-full max-w-sm overflow-hidden relative z-10 p-6 space-y-5 shadow-2xl"
                          >
                            <div className="flex items-center gap-3 text-rose-400">
                              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                                <Trash2 className="w-5 h-5 text-rose-400" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white">Delete Operator Account?</h4>
                                <p className="text-[10px] text-slate-400">Security credential revocation action</p>
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              Are you sure you want to remove this operator? This will revoke all active panel access.
                            </p>

                            <div className="flex items-center gap-3 pt-2">
                              <button
                                onClick={() => setDeleteConfirmOperatorId(null)}
                                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  const opToDelete = operators.find(o => o.id === deleteConfirmOperatorId);
                                  if (opToDelete) {
                                    setOperators(operators.filter(o => o.id !== deleteConfirmOperatorId));
                                    showAdminToast("success", `Operator '${opToDelete.name}' has been successfully revoked.`);
                                  }
                                  setDeleteConfirmOperatorId(null);
                                }}
                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-center"
                              >
                                Confirm Delete
                              </button>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            );
          })()}

          {/* TAB 11: SHIFT SCHEDULERS */}
          {activeTab === "shift-manager" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <Shifts />
            </motion.div>
          )}


          {/* TAB 14: BRANDING EDITOR (TV DISPLAY BRANDING EDITOR) */}
          {activeTab === "branding-editor" && (() => {
            const presetList: Array<"Classic" | "Minimal" | "Bold"> = ["Classic", "Minimal", "Bold"];
            const sectionKeys = ["presets", "logo", "queue", "bg", "audio"] as const;
            
            // Use top-level state to avoid Rules of Hooks violation
            const openSection = tvBrandingOpenSection;
            const setOpenSection = setTvBrandingOpenSection;

            const updateDraft = (field: keyof TVBrandingConfig, value: any) => {
              setTvDraftBranding(prev => ({
                ...prev,
                [field]: value
              }));
            };

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 max-w-7xl mx-auto"
              >
                {/* TOP BAR / BREADCRUMBS & CONTROL ACTIONS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Dashboard</span>
                      <ChevronRight className="w-3 h-3" />
                      <span>Branding</span>
                      <ChevronRight className="w-3 h-3" />
                      <span className="text-brand-navy">TV Display</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-rethink text-lg font-black text-brand-navy">Branding Editor — TV Display</h3>
                      
                      {/* Unpublished Draft Indicator Badge */}
                      <AnimatePresence>
                        {hasTvUnpublishedChanges && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-600 uppercase tracking-wider"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Unpublished Draft
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Launch TV Button */}
                    <button
                      onClick={() => {
                        if (onOpenTV) {
                          onOpenTV();
                        } else {
                          showAdminToast("info", "Redirecting to standalone TV display view...");
                        }
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2"
                      title="Launch separate TV Signage Display"
                    >
                      <Tv className="w-4 h-4 text-slate-500" /> Standalone TV View
                    </button>

                    {/* Publish Button */}
                    <button
                      onClick={() => {
                        setTvPublishedBranding({ ...tvDraftBranding });
                        localStorage.setItem("tv_branding_published", JSON.stringify(tvDraftBranding));
                        showAdminToast("success", "Branding kit successfully published live to facility signage monitors!");
                      }}
                      className="px-5 py-2.5 bg-brand-navy hover:bg-brand-ocean text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-brand-navy/15 active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Publish Live
                    </button>
                  </div>
                </div>

                {/* TWO PANEL CORE LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT PANEL: CONTROLS (5 Cols) */}
                  <div className="lg:col-span-5 space-y-4 bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm">
                    <div className="pb-3 border-b border-slate-100">
                      <h4 className="font-rethink text-sm font-bold text-brand-navy">Visual Brand Customizer</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Customize the exact layout, colors, shapes, and audio signals of your public waiting lounge screen.</p>
                    </div>

                    <div className="space-y-3">
                      
                      {/* SECTION 1: PRESETS ACCORDION */}
                      <div className="border border-slate-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenSection(openSection === "presets" ? "presets" : "presets")}
                          className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 text-left font-bold text-xs text-brand-navy font-rethink transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-[#0D1A5E]" /> Preset Profiles
                          </span>
                          <span className="text-[10px] text-brand-cyan uppercase bg-brand-navy px-2 py-0.5 rounded-md font-mono">
                            {selectedTvPreset}
                          </span>
                        </button>
                        
                        {openSection === "presets" && (
                          <div className="p-4 bg-white space-y-3 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 leading-normal">Select a curated theme preset profile to instantly configure all style and color override values.</p>
                            <div className="grid grid-cols-3 gap-2.5">
                              {presetList.map((preset) => (
                                <button
                                  key={preset}
                                  onClick={() => {
                                    setSelectedTvPreset(preset);
                                    setTvDraftBranding(TV_PRESETS[preset]);
                                    showAdminToast("info", `Applied '${preset}' branding preset profile.`);
                                  }}
                                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                                    selectedTvPreset === preset
                                      ? "border-brand-navy bg-brand-navy/5 text-brand-navy ring-1 ring-brand-navy"
                                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                                  }`}
                                >
                                  {preset === "Classic" && "Classic Navy"}
                                  {preset === "Minimal" && "Modern Light"}
                                  {preset === "Bold" && "Neon Cyber"}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* SECTION 2: LOGO & TYPOGRAPHY */}
                      <div className="border border-slate-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenSection(openSection === "logo" ? "presets" : "logo")}
                          className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 text-left font-bold text-xs text-brand-navy font-rethink transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#0D1A5E]" /> Logo & Typography
                          </span>
                          <span className="text-[10px] text-slate-400">Expand</span>
                        </button>
                        
                        {openSection === "logo" && (
                          <div className="p-4 bg-white space-y-4 border-t border-slate-50">
                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Logo Text Wordmark</label>
                              <input
                                type="text"
                                value={tvDraftBranding.logoText}
                                onChange={(e) => updateDraft("logoText", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy/15 text-slate-700"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Logo Font Family</label>
                                <select
                                  value={tvDraftBranding.logoFontFamily}
                                  onChange={(e) => updateDraft("logoFontFamily", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy/15 text-slate-700"
                                >
                                  <option value="Outfit">Outfit</option>
                                  <option value="Space Grotesk">Space Grotesk</option>
                                  <option value="Inter">Inter</option>
                                  <option value="JetBrains Mono">JetBrains Mono</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Logo Color</label>
                                <div className="flex gap-2">
                                  <input
                                    type="color"
                                    value={tvDraftBranding.logoColor}
                                    onChange={(e) => updateDraft("logoColor", e.target.value)}
                                    className="w-9 h-9 rounded-lg border-0 p-0 cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={tvDraftBranding.logoColor}
                                    onChange={(e) => updateDraft("logoColor", e.target.value)}
                                    className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-[10px] font-mono font-bold text-center"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* SECTION 3: QUEUE HOLDERS & COUNTERS */}
                      <div className="border border-slate-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenSection(openSection === "queue" ? "presets" : "queue")}
                          className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 text-left font-bold text-xs text-brand-navy font-rethink transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#0D1A5E]" /> Queue & Ticket Card Styling
                          </span>
                          <span className="text-[10px] text-slate-400">Expand</span>
                        </button>
                        
                        {openSection === "queue" && (
                          <div className="p-4 bg-white space-y-4 border-t border-slate-50">
                            
                            {/* Department Headings Styling */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Dept Font Size</label>
                                <select
                                  value={tvDraftBranding.departmentLabelFontSize}
                                  onChange={(e) => updateDraft("departmentLabelFontSize", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy/15 text-slate-700"
                                >
                                  <option value="text-xs">Extra Small (text-xs)</option>
                                  <option value="text-sm">Small (text-sm)</option>
                                  <option value="text-base">Medium (text-base)</option>
                                  <option value="text-lg">Large (text-lg)</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Dept Label Color</label>
                                <div className="flex gap-2">
                                  <input
                                    type="color"
                                    value={tvDraftBranding.departmentLabelColor}
                                    onChange={(e) => updateDraft("departmentLabelColor", e.target.value)}
                                    className="w-9 h-9 rounded-lg border-0 p-0 cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={tvDraftBranding.departmentLabelColor}
                                    onChange={(e) => updateDraft("departmentLabelColor", e.target.value)}
                                    className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-1.5 text-[10px] font-mono font-bold text-center"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Token Badge Colors */}
                            <div className="p-3 bg-slate-50 rounded-xl space-y-3.5">
                              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Active Token Badge styling</span>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-[9px] font-extrabold text-slate-400 uppercase block mb-1">Grad Start</label>
                                  <input
                                    type="color"
                                    value={tvDraftBranding.tokenBgGradientFrom}
                                    onChange={(e) => updateDraft("tokenBgGradientFrom", e.target.value)}
                                    className="w-full h-8 rounded-lg border-0 p-0 cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-extrabold text-slate-400 uppercase block mb-1">Grad End</label>
                                  <input
                                    type="color"
                                    value={tvDraftBranding.tokenBgGradientTo}
                                    onChange={(e) => updateDraft("tokenBgGradientTo", e.target.value)}
                                    className="w-full h-8 rounded-lg border-0 p-0 cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-extrabold text-slate-400 uppercase block mb-1">Text Color</label>
                                  <input
                                    type="color"
                                    value={tvDraftBranding.tokenTextColor}
                                    onChange={(e) => updateDraft("tokenTextColor", e.target.value)}
                                    className="w-full h-8 rounded-lg border-0 p-0 cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Big Name Typography */}
                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Active Name Text Color</label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={tvDraftBranding.nameTextColor}
                                  onChange={(e) => updateDraft("nameTextColor", e.target.value)}
                                  className="w-9 h-9 rounded-lg border-0 p-0 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={tvDraftBranding.nameTextColor}
                                  onChange={(e) => updateDraft("nameTextColor", e.target.value)}
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-[10px] font-mono font-bold uppercase text-center"
                                />
                              </div>
                            </div>

                            {/* Counter Station Card Customization */}
                            <div className="p-3 bg-slate-50 rounded-xl space-y-3">
                              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Counter Room Badge</span>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[9px] font-extrabold text-slate-400 uppercase block mb-1">Grad Start</label>
                                  <input
                                    type="color"
                                    value={tvDraftBranding.counterCardBgFrom}
                                    onChange={(e) => updateDraft("counterCardBgFrom", e.target.value)}
                                    className="w-full h-8 rounded-lg border-0 p-0 cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-extrabold text-slate-400 uppercase block mb-1">Grad End</label>
                                  <input
                                    type="color"
                                    value={tvDraftBranding.counterCardBgTo}
                                    onChange={(e) => updateDraft("counterCardBgTo", e.target.value)}
                                    className="w-full h-8 rounded-lg border-0 p-0 cursor-pointer"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-[9px] font-extrabold text-slate-400 uppercase block mb-1">Border</label>
                                  <input
                                    type="color"
                                    value={tvDraftBranding.counterCardBorderColor.substring(0, 7)}
                                    onChange={(e) => updateDraft("counterCardBorderColor", e.target.value + "4d")}
                                    className="w-full h-8 rounded-lg border-0 p-0 cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-extrabold text-slate-400 uppercase block mb-1">Room Text</label>
                                  <input
                                    type="color"
                                    value={tvDraftBranding.counterRoomTextColor}
                                    onChange={(e) => updateDraft("counterRoomTextColor", e.target.value)}
                                    className="w-full h-8 rounded-lg border-0 p-0 cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-extrabold text-slate-400 uppercase block mb-1">Operator Text</label>
                                  <input
                                    type="color"
                                    value={tvDraftBranding.counterOperatorTextColor}
                                    onChange={(e) => updateDraft("counterOperatorTextColor", e.target.value)}
                                    className="w-full h-8 rounded-lg border-0 p-0 cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Up Next Label Customization */}
                            <div className="space-y-3.5">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Up Next Label Text</label>
                                  <input
                                    type="text"
                                    value={tvDraftBranding.upNextLabelText}
                                    onChange={(e) => updateDraft("upNextLabelText", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none text-slate-700"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Up Next Color</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      value={tvDraftBranding.upNextLabelColor}
                                      onChange={(e) => updateDraft("upNextLabelColor", e.target.value)}
                                      className="w-8 h-8 rounded-lg border-0 p-0 cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={tvDraftBranding.upNextLabelColor}
                                      onChange={(e) => updateDraft("upNextLabelColor", e.target.value)}
                                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-1.5 text-[9px] font-mono font-bold text-center"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Next Queue Names Color</label>
                                  <input
                                    type="color"
                                    value={tvDraftBranding.nextItemsTextColor}
                                    onChange={(e) => updateDraft("nextItemsTextColor", e.target.value)}
                                    className="w-full h-8 rounded-lg border-0 p-0 cursor-pointer"
                                  />
                                </div>

                                <div className="flex flex-col justify-end pb-1.5">
                                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={tvDraftBranding.showSecondNextItem}
                                      onChange={(e) => updateDraft("showSecondNextItem", e.target.checked)}
                                      className="w-4 h-4 rounded text-brand-navy focus:ring-brand-navy accent-brand-navy"
                                    />
                                    <span>Show 2nd Next Item</span>
                                  </label>
                                </div>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>

                      {/* SECTION 4: BACKGROUND STAGE THEME */}
                      <div className="border border-slate-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenSection(openSection === "bg" ? "presets" : "bg")}
                          className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 text-left font-bold text-xs text-brand-navy font-rethink transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Sliders className="w-4 h-4 text-[#0D1A5E]" /> Background & Ambient Visuals
                          </span>
                          <span className="text-[10px] text-slate-400">Expand</span>
                        </button>
                        
                        {openSection === "bg" && (
                          <div className="p-4 bg-white space-y-4 border-t border-slate-50">
                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Primary Backdrop Solid Color</label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={tvDraftBranding.bgPrimaryColor}
                                  onChange={(e) => updateDraft("bgPrimaryColor", e.target.value)}
                                  className="w-9 h-9 rounded-lg border-0 p-0 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={tvDraftBranding.bgPrimaryColor}
                                  onChange={(e) => updateDraft("bgPrimaryColor", e.target.value)}
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-[10px] font-mono font-bold uppercase text-center"
                                />
                              </div>
                            </div>

                            {/* Mesh grid & dot indicators */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl">
                              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={tvDraftBranding.showDotMatrix}
                                  onChange={(e) => updateDraft("showDotMatrix", e.target.checked)}
                                  className="w-4 h-4 rounded text-brand-navy focus:ring-brand-navy accent-brand-navy"
                                />
                                <span>Dot Matrix Mesh</span>
                              </label>

                              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={tvDraftBranding.showGridLines}
                                  onChange={(e) => updateDraft("showGridLines", e.target.checked)}
                                  className="w-4 h-4 rounded text-brand-navy focus:ring-brand-navy accent-brand-navy"
                                />
                                <span>Geometric Grid Lines</span>
                              </label>

                              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={tvDraftBranding.showAmbientBlobs}
                                  onChange={(e) => updateDraft("showAmbientBlobs", e.target.checked)}
                                  className="w-4 h-4 rounded text-brand-navy focus:ring-brand-navy accent-brand-navy"
                                />
                                <span>Pulsing Ambient Blobs</span>
                              </label>

                              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={tvDraftBranding.showWaves}
                                  onChange={(e) => updateDraft("showWaves", e.target.checked)}
                                  className="w-4 h-4 rounded text-brand-navy focus:ring-brand-navy accent-brand-navy"
                                />
                                <span>Dynamic Vector Waves</span>
                              </label>

                              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer col-span-2">
                                <input
                                  type="checkbox"
                                  checked={tvDraftBranding.showFloatingBubbles}
                                  onChange={(e) => updateDraft("showFloatingBubbles", e.target.checked)}
                                  className="w-4 h-4 rounded text-brand-navy focus:ring-brand-navy accent-brand-navy"
                                />
                                <span>Floating Background Bubbles</span>
                              </label>
                            </div>

                            {/* Blob Colors if enabled */}
                            {tvDraftBranding.showAmbientBlobs && (
                              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Ambient Blobs Colorizers</span>
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label className="text-[9px] font-bold text-slate-400 block mb-1 text-center">Blob 1</label>
                                    <input
                                      type="color"
                                      value={tvDraftBranding.blob1Color.substring(0, 7)}
                                      onChange={(e) => updateDraft("blob1Color", e.target.value + "20")}
                                      className="w-full h-8 rounded-lg border-0 p-0 cursor-pointer"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] font-bold text-slate-400 block mb-1 text-center">Blob 2</label>
                                    <input
                                      type="color"
                                      value={tvDraftBranding.blob2Color.substring(0, 7)}
                                      onChange={(e) => updateDraft("blob2Color", e.target.value + "20")}
                                      className="w-full h-8 rounded-lg border-0 p-0 cursor-pointer"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] font-bold text-slate-400 block mb-1 text-center">Blob 3</label>
                                    <input
                                      type="color"
                                      value={tvDraftBranding.blob3Color.substring(0, 7)}
                                      onChange={(e) => updateDraft("blob3Color", e.target.value + "50")}
                                      className="w-full h-8 rounded-lg border-0 p-0 cursor-pointer"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        )}
                      </div>

                      {/* SECTION 5: AUDIO & SYSTEM CONFIGURATION */}
                      <div className="border border-slate-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenSection(openSection === "audio" ? "presets" : "audio")}
                          className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 text-left font-bold text-xs text-brand-navy font-rethink transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#0D1A5E]" /> Audio Signalling & Cycle Speeds
                          </span>
                          <span className="text-[10px] text-slate-400">Expand</span>
                        </button>
                        
                        {openSection === "audio" && (
                          <div className="p-4 bg-white space-y-4 border-t border-slate-50">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Auto Progression Cycle Speed</label>
                                <span className="text-xs font-mono font-bold text-brand-navy">{tvDraftBranding.autoplayIntervalSeconds} Seconds</span>
                              </div>
                              <input
                                type="range"
                                min={3}
                                max={20}
                                step={1}
                                value={tvDraftBranding.autoplayIntervalSeconds}
                                onChange={(e) => updateDraft("autoplayIntervalSeconds", parseInt(e.target.value))}
                                className="w-full accent-brand-navy bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                              />
                            </div>

                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer py-1.5 bg-slate-50 px-3 rounded-xl">
                              <input
                                type="checkbox"
                                checked={tvDraftBranding.ttsEnabledByDefault}
                                onChange={(e) => updateDraft("ttsEnabledByDefault", e.target.checked)}
                                className="w-4 h-4 rounded text-brand-navy focus:ring-brand-navy accent-brand-navy"
                              />
                              <span>Enable Voice (TTS) Announcements by Default</span>
                            </label>

                            <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Chime Alert Note Frequencies</span>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Note 1 (Hz)</label>
                                  <input
                                    type="number"
                                    min={100}
                                    max={1200}
                                    value={tvDraftBranding.chimeFrequencies[0]}
                                    onChange={(e) => updateDraft("chimeFrequencies", [parseFloat(e.target.value), tvDraftBranding.chimeFrequencies[1]])}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-700"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Note 2 (Hz)</label>
                                  <input
                                    type="number"
                                    min={100}
                                    max={1200}
                                    value={tvDraftBranding.chimeFrequencies[1]}
                                    onChange={(e) => updateDraft("chimeFrequencies", [tvDraftBranding.chimeFrequencies[0], parseFloat(e.target.value)])}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-700"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* DRAFT RESET ACTION */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setTvDraftBranding({ ...DEFAULT_BRANDING });
                          setSelectedTvPreset("Classic");
                          showAdminToast("success", "Draft overridden styles successfully reset to original Brand Kit presets.");
                        }}
                        className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-rose-100"
                      >
                        Reset Overrides to Brand Kit Defaults
                      </button>
                    </div>

                  </div>

                  {/* RIGHT PANEL: LIVE PREVIEW SIMULATOR (7 Cols) */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    
                    {/* Simulator Framing Wrapper */}
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
                      
                      {/* Simulated TV Frame Header Controls */}
                      <div className="flex items-center justify-between text-white border-b border-slate-900 pb-3">
                        <div className="flex items-center gap-2">
                          <Laptop className="w-4 h-4 text-brand-cyan" />
                          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-cyan">Lobby Monitor Live Sandbox Simulator</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-slate-500 font-semibold bg-slate-900 px-2 py-1 rounded-md border border-slate-850">
                            16:9 HD Display Output
                          </span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                      </div>

                      {/* TV Screen Aspect Canvas Frame with responsive scaling and static mode */}
                      <TVPreviewContainer branding={tvDraftBranding} />

                      {/* Simulator Specs footer */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest pt-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" /> Dynamic CSS3 Canvas Engine
                        </span>
                        <span>WebKit Screen 02 (Main lobby)</span>
                      </div>

                    </div>

                    {/* Helpful tips panel */}
                    <div className="bg-brand-navy/[0.02] border border-brand-navy/15 rounded-2xl p-4 flex gap-3 text-slate-600">
                      <div className="p-1.5 bg-[#0D1A5E]/5 text-brand-navy rounded-xl h-fit">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-brand-navy">Interactive Simulator Tips</h5>
                        <p className="text-[11px] leading-relaxed text-slate-500">
                          This preview screen maps inputs <strong>live</strong> without lag. Hover over the screen in the simulator to bring up waitlist play/pause controls, voice announcements, and manual queue index toggles.
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              </motion.div>
            );
          })()}

          {/* TAB 15: ANNOUNCEMENT BROADCASTER */}
          {activeTab === "announcements-broadcast" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Announcements
                departments={departments}
                counters={counters}
                showAdminToast={showAdminToast}
                auditLogs={auditLogs}
                setAuditLogs={setAuditLogs}
              />
            </motion.div>
          )}

          {/* TAB 16: SYSTEM AUDIT LOGS */}
          {activeTab === "audit-logs" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <AuditLogs />
            </motion.div>
          )}

        </div>

        {/* Global Modals Portal Overlay */}
        <AnimatePresence>
          {/* 1. Edit Queue Item Modal */}
          {editingQueueItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingQueueItem(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />

              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden relative z-10"
              >
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-navy to-brand-cyan" />
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-navy/5 text-brand-navy flex items-center justify-center">
                      <Ticket className="w-4 h-4 text-[#0D1A5E]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-brand-navy">Modify Ticket Information</h4>
                      <p className="text-[10px] text-slate-400">Edit queue logs & ticket properties</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingQueueItem(null)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleEditQueueItemSubmit} className="p-5 space-y-4">
                  {/* Ticket Number & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Ticket Number</label>
                      <input
                        type="text"
                        required
                        value={editQueueTicketNumber}
                        onChange={(e) => setEditQueueTicketNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Status</label>
                      <div className="relative">
                        <select
                          value={editQueueStatus}
                          onChange={(e) => setEditQueueStatus(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 cursor-pointer appearance-none"
                        >
                          <option value="In-Progress">In-Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="No-Show">No-Show</option>
                          <option value="Skipped">Skipped</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={editQueueCustomerName}
                      onChange={(e) => setEditQueueCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 transition-all"
                    />
                  </div>

                  {/* Department Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Department Route</label>
                    <div className="relative">
                      <select
                        value={editQueueDeptName}
                        onChange={(e) => setEditQueueDeptName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 cursor-pointer appearance-none"
                      >
                        {departments.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Operator Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Assigned Operator</label>
                    <div className="relative">
                      <select
                        value={editQueueOperator}
                        onChange={(e) => setEditQueueOperator(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 cursor-pointer appearance-none"
                      >
                        <option value="Unassigned">Unassigned</option>
                        {operators.map(op => (
                          <option key={op.id} value={op.name}>{op.name} ({op.role})</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Timers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Wait Duration (MM:SS)</label>
                      <input
                        type="text"
                        value={editQueueWaitTime}
                        placeholder="e.g. 12:30"
                        onChange={(e) => setEditQueueWaitTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 transition-all text-center"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Service Duration (MM:SS)</label>
                      <input
                        type="text"
                        value={editQueueServiceTime}
                        placeholder="e.g. 05:45"
                        onChange={(e) => setEditQueueServiceTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 transition-all text-center"
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingQueueItem(null)}
                      className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-brand-navy hover:bg-brand-ocean text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-brand-cyan" /> Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* 2. Global Edit Counter Modal (Active from other managers) */}
          {editingCounter && activeTab !== "counters-manager" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingCounter(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />

              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden relative z-10"
              >
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-navy to-brand-cyan" />
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-navy/5 text-brand-navy flex items-center justify-center">
                      <SlidersHorizontal className="w-4 h-4 text-[#0D1A5E]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-brand-navy">Configure Terminal</h4>
                      <p className="text-[10px] text-slate-400">Modify `{editingCounter.name}` parameters</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingCounter(null)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleEditCounterSubmit} className="p-5 space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Counter Title</label>
                    <input
                      type="text"
                      required
                      value={editCounterName}
                      onChange={(e) => setEditCounterName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 transition-all"
                    />
                  </div>

                  {/* Operator Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Terminal Operator</label>
                    <div className="relative">
                      <select
                        value={editCounterOperator}
                        onChange={(e) => setEditCounterOperator(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 cursor-pointer appearance-none"
                      >
                        {operators.map(op => (
                          <option key={op.id} value={op.name}>{op.name} ({op.role})</option>
                        ))}
                        {!operators.some(o => o.name === editCounterOperator) && (
                          <option value={editCounterOperator}>{editCounterOperator}</option>
                        )}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Assigned Queue Route</label>
                    <div className="relative">
                      <select
                        value={editCounterDeptId}
                        onChange={(e) => setEditCounterDeptId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 cursor-pointer appearance-none"
                      >
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Operational Status</label>
                    <div className="relative">
                      <select
                        value={editCounterStatus}
                        onChange={(e: any) => setEditCounterStatus(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-navy text-slate-700 cursor-pointer appearance-none"
                      >
                        <option value="Active">Active</option>
                        <option value="Idle">Idle</option>
                        <option value="Break">Break</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Chime Switch */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-800 block">Sound Chime Signal</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Toggle sound alert dynamically</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditCounterChime(!editCounterChime)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                        editCounterChime ? "bg-[#0D1A5E]" : "bg-slate-200"
                      }`}
                    >
                      <div className={`bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${
                        editCounterChime ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingCounter(null)}
                      className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#0D1A5E] hover:bg-brand-ocean text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-brand-cyan" /> Update Config
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}
