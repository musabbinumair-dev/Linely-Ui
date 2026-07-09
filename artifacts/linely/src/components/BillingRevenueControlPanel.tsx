import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  CreditCard,
  Activity,
  HelpCircle,
  LayoutDashboard,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Copy,
  Check,
  X,
  ExternalLink,
  FileText,
  Download,
  AlertCircle,
  Calendar,
  DollarSign,
  Sliders,
  Settings,
  ChevronRight,
  AlertTriangle,
  Info,
  Clock,
  ChevronLeft
} from "lucide-react";

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface Tenant {
  id: string;
  name: string;
  plan: "Starter" | "Professional" | "Enterprise";
  status: "Active" | "Trial" | "Suspended" | "Cancelled";
  ownerName: string;
  email: string;
  signupDate: string;
  branchCount: number;
}

export interface Transaction {
  id: string;
  tenantId: string;
  tenantName: string;
  tier: "Starter" | "Professional" | "Enterprise" | "Custom";
  grossAmount: number;
  fees: number;
  netAmount: number;
  gateway: "Stripe" | "Adyen" | "Manual Bank Transfer";
  status: "Paid" | "Failed" | "Refunded" | "Pending";
  method: string;
  invoiceNumber: string;
  timestamp: string;
  timeline: { time: string; label: string; description: string }[];
  rawPayload: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface AlertNotification {
  id: string;
  severity: "Critical" | "Warning" | "Info";
  title: string;
  description: string;
  timestamp: string;
}

interface BillingRevenueControlPanelProps {
  tenants: Tenant[];
  addAuditLog: (action: string, target: string, severity: "Info" | "Warning" | "Critical") => void;
  triggerToast: (message: string, type?: "success" | "info" | "error") => void;
}

// ==========================================
// INITIAL MOCK DATA
// ==========================================
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-98401928-STR",
    tenantId: "TEN-001",
    tenantName: "Wayne Enterprises",
    tier: "Enterprise",
    grossAmount: 1450.00,
    fees: 42.05,
    netAmount: 1407.95,
    gateway: "Stripe",
    status: "Paid",
    method: "Visa 4242",
    invoiceNumber: "INV-2026-0891",
    timestamp: "2026-07-08T03:45:00-07:00",
    timeline: [
      { time: "03:45:00", label: "Invoice Generated", description: "System auto-generated invoice for Enterprise tier renewal." },
      { time: "03:45:02", label: "Gateway Authorized", description: "Stripe payment intent successfully authorized." },
      { time: "03:45:05", label: "Settled & Disbursed", description: "Funds transferred into primary treasury account." }
    ],
    rawPayload: JSON.stringify({
      object: "charge",
      id: "ch_3M4e9bLkdIwHu7ix1gRE8",
      amount: 145000,
      currency: "usd",
      payment_method_details: { card: { brand: "visa", last4: "4242" } },
      receipt_url: "https://stripe.com/receipt",
      status: "succeeded",
      created: 1783511105
    }, null, 2)
  },
  {
    id: "TXN-82019482-ADY",
    tenantId: "TEN-002",
    tenantName: "Acme Corporation",
    tier: "Professional",
    grossAmount: 299.00,
    fees: 8.97,
    netAmount: 290.03,
    gateway: "Adyen",
    status: "Paid",
    method: "Mastercard 8812",
    invoiceNumber: "INV-2026-0892",
    timestamp: "2026-07-07T18:12:00-07:00",
    timeline: [
      { time: "18:11:00", label: "Invoice Generated", description: "Bimonthly queue quota cycle rollover invoice." },
      { time: "18:11:45", label: "Gateway Authorized", description: "Adyen smart-route processor authorized transaction." },
      { time: "18:12:00", label: "Settled & Disbursed", description: "Gateway settled successfully." }
    ],
    rawPayload: JSON.stringify({
      eventCode: "AUTHORISATION",
      merchantAccount: "LinelySaaS",
      paymentMethod: "mc",
      amount: { currency: "USD", value: 29900 },
      pspReference: "8515730311204481",
      success: "true"
    }, null, 2)
  },
  {
    id: "TXN-49102941-STR",
    tenantId: "TEN-003",
    tenantName: "Stark Industries",
    tier: "Enterprise",
    grossAmount: 2850.00,
    fees: 82.65,
    netAmount: 2767.35,
    gateway: "Stripe",
    status: "Pending",
    method: "ACH Debit",
    invoiceNumber: "INV-2026-0893",
    timestamp: "2026-07-07T12:00:00-07:00",
    timeline: [
      { time: "12:00:00", label: "Invoice Generated", description: "Bespoke high-volume custom queue quota fee." },
      { time: "12:05:00", label: "Gateway Initiated", description: "ACH Bank Debit pipeline initialized. Awaiting clearing." }
    ],
    rawPayload: JSON.stringify({
      object: "payment_intent",
      id: "pi_stark_ach_920192",
      amount: 285000,
      currency: "usd",
      status: "processing",
      next_action: null
    }, null, 2)
  },
  {
    id: "TXN-31204910-MAN",
    tenantId: "TEN-004",
    tenantName: "Initech LLC",
    tier: "Starter",
    grossAmount: 49.00,
    fees: 0.00,
    netAmount: 49.00,
    gateway: "Manual Bank Transfer",
    status: "Paid",
    method: "Wire Transfer",
    invoiceNumber: "INV-2026-0894",
    timestamp: "2026-07-06T09:30:00-07:00",
    timeline: [
      { time: "09:00:00", label: "Invoice Created", description: "Manual billing cycle request created by supervisor." },
      { time: "09:30:00", label: "Manual Settle Approved", description: "Wire transfer confirmed. Admin marked invoice settled." }
    ],
    rawPayload: JSON.stringify({
      type: "manual_wire",
      clearing_reference: "WIRE-REF-91024-INITECH",
      approver: "Sarah Connor",
      date_received: "2026-07-06"
    }, null, 2)
  },
  {
    id: "TXN-10294812-STR",
    tenantId: "TEN-005",
    tenantName: "Tyrell Corporation",
    tier: "Professional",
    grossAmount: 299.00,
    fees: 8.97,
    netAmount: 290.03,
    gateway: "Stripe",
    status: "Failed",
    method: "Visa 1024",
    invoiceNumber: "INV-2026-0895",
    timestamp: "2026-07-05T14:22:00-07:00",
    timeline: [
      { time: "14:20:00", label: "Invoice Generated", description: "Standard automated renewal transaction." },
      { time: "14:22:00", label: "Gateway Refused", description: "Stripe declined: Insufficient Funds (Card decline code: card_declined)." }
    ],
    rawPayload: JSON.stringify({
      object: "charge",
      id: "ch_tyrell_failed_8812",
      amount: 29900,
      currency: "usd",
      status: "failed",
      failure_code: "card_declined",
      failure_message: "Your card has insufficient funds."
    }, null, 2)
  },
  {
    id: "TXN-73910248-ADY",
    tenantId: "TEN-006",
    tenantName: "Cyberdyne Systems",
    tier: "Starter",
    grossAmount: 49.00,
    fees: 1.47,
    netAmount: 47.53,
    gateway: "Adyen",
    status: "Refunded",
    method: "Visa 9901",
    invoiceNumber: "INV-2026-0896",
    timestamp: "2026-07-04T10:15:00-07:00",
    timeline: [
      { time: "10:10:00", label: "Invoice Generated", description: "Automatic license cycle charge." },
      { time: "10:11:00", label: "Gateway Authorized", description: "Settled via Adyen Visa pipeline." },
      { time: "16:00:00", label: "Refund Requested", description: "Customer support initiated a refund for double billing dispute." },
      { time: "16:02:00", label: "Refund Settled", description: "Adyen confirmed refund disbursement." }
    ],
    rawPayload: JSON.stringify({
      object: "refund",
      id: "re_cyberdyne_910248",
      amount: 4900,
      currency: "usd",
      original_psp_ref: "8515730311209121",
      status: "Refunded"
    }, null, 2)
  }
];

const MOCK_ALERTS: AlertNotification[] = [
  {
    id: "ALT-001",
    severity: "Critical",
    title: "Stripe Webhook Max Retries Near Limit",
    description: "Endpoint `/api/v1/stripe-webhook` failing with 504 Gateway Timeout for 18 consecutive invoice.payment_succeeded events.",
    timestamp: "12m ago"
  },
  {
    id: "ALT-002",
    severity: "Warning",
    title: "Pending Manual Wire Verification",
    description: "Omni Consumer Products uploaded ACH confirmation receipt for custom SLA invoice $4,850.00. Awaiting superadmin authorization.",
    timestamp: "1h ago"
  },
  {
    id: "ALT-003",
    severity: "Info",
    title: "SLA Threshold Warning: Stark Industries",
    description: "Stark Industries has hit 94.8% of daily API call credits on their Enterprise Sandbox tenancy.",
    timestamp: "2h ago"
  }
];

export default function BillingRevenueControlPanel({
  tenants,
  addAuditLog,
  triggerToast
}: BillingRevenueControlPanelProps) {
  // ==========================================
  // STATE DEFINITIONS
  // ==========================================
  const [revenueRange, setRevenueRange] = useState<"7D" | "30D" | "90D" | "YTD">("30D");
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [alerts, setAlerts] = useState<AlertNotification[]>(MOCK_ALERTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Sorting & Pagination
  const [sortField, setSortField] = useState<keyof Transaction>("timestamp");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals Toggle
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPlanConfigOpen, setIsPlanConfigOpen] = useState(false);

  // Row context menu dropdown
  const [activeMenuTxnId, setActiveMenuTxnId] = useState<string | null>(null);

  // Copied State feedback
  const [copiedTxnId, setCopiedTxnId] = useState<string | null>(null);

  // ==========================================
  // INVOICE CREATOR FORM STATE
  // ==========================================
  const [invoiceTenant, setInvoiceTenant] = useState("");
  const [invoiceTier, setInvoiceTier] = useState<"Starter" | "Professional" | "Enterprise" | "Custom">("Professional");
  const [invoiceLineItems, setInvoiceLineItems] = useState<InvoiceLineItem[]>([
    { id: "1", description: "Premium Queue Engine Tenant License (Rollover)", quantity: 1, unitPrice: 299.00 }
  ]);
  const [invoiceTax, setInvoiceTax] = useState<number>(8.25);
  const [invoiceOverage, setInvoiceOverage] = useState<number>(0);
  const [isInvoiceSubmitting, setIsInvoiceSubmitting] = useState(false);

  // ==========================================
  // PLAN CONFIGURATOR STATE
  // ==========================================
  const [plans, setPlans] = useState([
    { key: "Starter", name: "Base Starter", price: 49.00, limit: 10000, overage: 1.50 },
    { key: "Professional", name: "Pro Platform", price: 299.00, limit: 100000, overage: 1.20 },
    { key: "Enterprise", name: "Custom Enterprise", price: 1450.00, limit: 1000000, overage: 0.90 }
  ]);
  const [isPlanSaving, setIsPlanSaving] = useState(false);

  // Detail Drawer States
  const [refundSliderVal, setRefundSliderVal] = useState<number>(100);

  // ==========================================
  // METRIC COMPUTATIONS (based on range)
  // ==========================================
  const rangeMultiplier = useMemo(() => {
    switch (revenueRange) {
      case "7D": return 0.23;
      case "30D": return 1.0;
      case "90D": return 3.12;
      case "YTD": return 12.45;
    }
  }, [revenueRange]);

  const kpis = useMemo(() => {
    const rawTotal = transactions
      .filter(t => t.status === "Paid")
      .reduce((acc, curr) => acc + curr.grossAmount, 0);

    const rawFees = transactions
      .filter(t => t.status === "Paid")
      .reduce((acc, curr) => acc + curr.fees, 0);

    const mrrTotal = plans.reduce((acc, curr) => {
      // Calculate based on existing mock count
      const planCount = curr.key === "Starter" ? 18 : curr.key === "Professional" ? 27 : 8;
      return acc + (planCount * curr.price);
    }, 0);

    return {
      totalRevenue: rawTotal * rangeMultiplier * 14.5,
      netRevenue: (rawTotal - rawFees) * rangeMultiplier * 14.5,
      mrr: mrrTotal,
      churnRate: 1.42,
      activeSubscribers: 53 // 18 + 27 + 8
    };
  }, [transactions, revenueRange, rangeMultiplier, plans]);

  // ==========================================
  // CHART SIMULATED VALUES
  // ==========================================
  const chartData = useMemo(() => {
    // Return 6 high-density intervals mapping current ranges
    const slices = ["Interval 01", "Interval 02", "Interval 03", "Interval 04", "Interval 05", "Interval 06"];
    const baseVals = [4200, 5800, 4900, 7200, 8100, 6900];
    return slices.map((name, idx) => {
      const gross = Math.round(baseVals[idx] * rangeMultiplier);
      const fees = Math.round(gross * 0.029 + 15);
      const net = gross - fees;
      return { name, gross, fees, net };
    });
  }, [rangeMultiplier]);

  // Chart tooltip state
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // ==========================================
  // FILTERING & PAGINATION CALCULATIONS
  // ==========================================
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        t =>
          t.tenantName.toLowerCase().includes(query) ||
          t.id.toLowerCase().includes(query) ||
          t.invoiceNumber.toLowerCase().includes(query) ||
          t.gateway.toLowerCase().includes(query) ||
          t.status.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (typeof aVal === "string") {
        aVal = (aVal as string).toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [transactions, searchQuery, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [filteredTransactions, currentPage]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedTxnId(txt);
    triggerToast(`Copied transaction ID to clipboard.`, "success");
    setTimeout(() => setCopiedTxnId(null), 2000);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTransactions(paginatedTransactions.map(t => t.id));
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedTransactions.includes(id)) {
      setSelectedTransactions(selectedTransactions.filter(item => item !== id));
    } else {
      setSelectedTransactions([...selectedTransactions, id]);
    }
  };

  const handleManualAction = (txnId: string, action: "Force Settle" | "Mark as Refunded" | "Retry Processing") => {
    setTransactions(prev => prev.map(t => {
      if (t.id === txnId) {
        let updatedStatus = t.status;
        let timelineAdd = { time: new Date().toLocaleTimeString(), label: "", description: "" };
        
        if (action === "Force Settle") {
          updatedStatus = "Paid";
          timelineAdd = {
            time: new Date().toLocaleTimeString(),
            label: "Force Settled",
            description: "Manual override settle action executed by superadmin."
          };
        } else if (action === "Mark as Refunded") {
          updatedStatus = "Refunded";
          timelineAdd = {
            time: new Date().toLocaleTimeString(),
            label: "Refund Registered",
            description: "Gateway status override marked as full refund."
          };
        } else if (action === "Retry Processing") {
          updatedStatus = "Pending";
          timelineAdd = {
            time: new Date().toLocaleTimeString(),
            label: "Processor Retried",
            description: "Webhook re-dispatch event queued to main server."
          };
        }

        return {
          ...t,
          status: updatedStatus,
          timeline: [...t.timeline, timelineAdd]
        };
      }
      return t;
    }));

    const targetTxn = transactions.find(t => t.id === txnId);
    const tenantName = targetTxn ? targetTxn.tenantName : "Gateway Pipeline";

    addAuditLog(`Executed transaction action: ${action} for reference ${txnId}`, tenantName, action === "Force Settle" ? "Warning" : "Info");
    triggerToast(`Transaction status updated to: ${action}`, "success");
    setActiveMenuTxnId(null);
  };

  // Add line item to manual invoice creator
  const addInvoiceLineItem = () => {
    const newItem: InvoiceLineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0.00
    };
    setInvoiceLineItems([...invoiceLineItems, newItem]);
  };

  // Remove line item from manual invoice
  const removeInvoiceLineItem = (id: string) => {
    if (invoiceLineItems.length > 1) {
      setInvoiceLineItems(invoiceLineItems.filter(item => item.id !== id));
    } else {
      triggerToast("An invoice must contain at least one line item.", "error");
    }
  };

  // Update line item details
  const updateInvoiceLineItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setInvoiceLineItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Calculate current invoice totals
  const invoiceCalculations = useMemo(() => {
    const subtotal = invoiceLineItems.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
    const taxAmt = subtotal * (invoiceTax / 100);
    const total = subtotal + taxAmt + Number(invoiceOverage);
    return { subtotal, taxAmt, total };
  }, [invoiceLineItems, invoiceTax, invoiceOverage]);

  // Handle invoice submission
  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceTenant.trim()) {
      triggerToast("Please select a valid tenant company", "error");
      return;
    }

    setIsInvoiceSubmitting(true);

    setTimeout(() => {
      // Create fresh simulated transaction
      const newTxnId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}-MAN`;
      const freshInvoice: Transaction = {
        id: newTxnId,
        tenantId: `TEN-${Math.floor(100 + Math.random() * 900)}`,
        tenantName: invoiceTenant,
        tier: invoiceTier,
        grossAmount: invoiceCalculations.total,
        fees: 0.00,
        netAmount: invoiceCalculations.total,
        gateway: "Manual Bank Transfer",
        status: "Pending",
        method: "Bank Wire Invoice",
        invoiceNumber: `INV-2026-${Math.floor(5000 + Math.random() * 5000)}`,
        timestamp: new Date().toISOString(),
        timeline: [
          { time: new Date().toLocaleTimeString(), label: "Invoice Created", description: "Bespoke invoice dispatch. Sent to billing queue." }
        ],
        rawPayload: JSON.stringify({
          invoice_creator: "Sarah Connor",
          items: invoiceLineItems,
          taxRateApplied: invoiceTax,
          overageCalculated: invoiceOverage,
          clearingPipeline: "Awaiting clearing"
        }, null, 2)
      };

      setTransactions([freshInvoice, ...transactions]);
      addAuditLog(`Generated custom manual invoice ${freshInvoice.invoiceNumber} for ${invoiceTenant}`, invoiceTenant, "Info");
      triggerToast(`Invoice successfully dispatched to ${invoiceTenant}`, "success");
      
      // Reset form & Close modal
      setInvoiceTenant("");
      setInvoiceLineItems([{ id: "1", description: "Premium Queue Engine Tenant License (Rollover)", quantity: 1, unitPrice: 299.00 }]);
      setInvoiceOverage(0);
      setIsInvoiceSubmitting(false);
      setIsInvoiceModalOpen(false);
    }, 1200);
  };

  // Plan Configurator Save
  const handleSavePlanConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlanSaving(true);
    
    setTimeout(() => {
      setIsPlanSaving(false);
      setIsPlanConfigOpen(false);
      addAuditLog("Modified multi-tenant system subscription plans and base parameters", "Global Systems", "Critical");
      triggerToast("Subscription plan matrices saved and distributed.", "success");
    }, 1100);
  };

  // Download Trigger simulation
  const handleDownloadInvoice = (txn: Transaction) => {
    triggerToast(`Downloading PDF invoice asset for reference ${txn.invoiceNumber}...`, "success");
    addAuditLog(`Downloaded PDF invoice file for transaction ${txn.id}`, txn.tenantName, "Info");
  };

  // Remove individual alert notification
  const handleRemoveAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    triggerToast("Alert cleared successfully.", "info");
  };

  return (
    <div className="space-y-6 text-slate-900" id="billing-revenue-control-panel-root">
      
      {/* HEADER CONTROLS */}
      <div className="flex justify-end border-b border-slate-100 pb-5" id="control-panel-header-section">
        
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap" id="global-revenue-cta-buttons">
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="h-9 px-4 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            id="open-invoice-creator-btn"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            Create Invoice
          </button>
          
          <button
            onClick={() => setIsPlanConfigOpen(true)}
            className="h-9 px-4 bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-50 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            id="open-plan-matrix-btn"
          >
            <Sliders className="w-4 h-4 text-slate-500" />
            Configure Plans
          </button>
        </div>
      </div>

      {/* ==========================================
          TOP SECTION: EXECUTIVE KPI SNAPSHOT GRID
          ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="kpi-snapshot-grid">
        
        {/* KPI 1: TOTAL REVENUE */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs relative" id="kpi-card-total-revenue">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                12.4%
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-2xl font-black text-[#0F172A] tracking-tight font-sans leading-none tabular-nums">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(kpis.totalRevenue)}
            </p>
            
            <div className="flex items-center gap-1 mt-3">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={revenueRange}
                onChange={(e) => {
                  setRevenueRange(e.target.value as any);
                  triggerToast(`Revenue timeline adjusted to last ${e.target.value}`, "info");
                }}
                className="text-[10px] font-mono font-bold text-slate-500 hover:text-indigo-600 bg-transparent border-none outline-none cursor-pointer focus:ring-0 p-0"
              >
                <option value="7D">Last 7 Days</option>
                <option value="30D">Last 30 Days</option>
                <option value="90D">Last 90 Days</option>
                <option value="YTD">Year to Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPI 2: NET REVENUE */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs" id="kpi-card-net-revenue">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Net Revenue</span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              11.9%
            </span>
          </div>
          
          <div className="mt-4">
            <p className="text-2xl font-black text-[#0F172A] tracking-tight font-sans leading-none tabular-nums">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(kpis.netRevenue)}
            </p>
            <span className="text-[10px] text-slate-400 font-semibold font-mono mt-3 block uppercase leading-none">Gross minus fees</span>
          </div>
        </div>

        {/* KPI 3: MRR */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs" id="kpi-card-mrr">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">MRR Run-Rate</span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
              <Activity className="w-3 h-3" />
              SaaS Scale
            </span>
          </div>
          
          <div className="mt-4">
            <p className="text-2xl font-black text-indigo-600 tracking-tight font-sans leading-none tabular-nums">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(kpis.mrr)}
            </p>
            <span className="text-[10px] text-indigo-500 font-bold font-sans mt-3 block leading-none">Automated recurring billing</span>
          </div>
        </div>

        {/* KPI 4: CHURN RATE */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs" id="kpi-card-churn">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Tenant Churn</span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
              -0.2%
            </span>
          </div>
          
          <div className="mt-4">
            <p className="text-2xl font-black text-[#0F172A] tracking-tight font-sans leading-none tabular-nums">
              {kpis.churnRate}%
            </p>
            <span className="text-[10px] text-slate-400 font-semibold font-mono mt-3 block uppercase leading-none">30-day billing retention</span>
          </div>
        </div>

        {/* KPI 5: ACTIVE SUBSCRIPTIONS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs" id="kpi-card-active-subscribers">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Live Tenancies</span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
              <Users className="w-3 h-3" />
              Active
            </span>
          </div>
          
          <div className="mt-4">
            <p className="text-2xl font-black text-[#0F172A] tracking-tight font-sans leading-none tabular-nums">
              {kpis.activeSubscribers}
            </p>
            <span className="text-[10px] text-slate-400 font-semibold font-mono mt-3 block uppercase leading-none">Distributed cluster DBs</span>
          </div>
        </div>

      </div>

      {/* ==========================================
          CENTER SECTION: 65/35 SPLIT-SCREEN LAYOUT
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="center-operational-split">
        
        {/* LEFT COMPONENT: REVENUE & MRR OVER TIME CHART */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-2 flex flex-col shadow-xs" id="revenue-overtime-chart-panel">
          <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-outfit text-base font-bold text-[#0F172A] tracking-tight">Revenue & MRR Metrics Over Time</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">High-fidelity visualization tracking billing rollover intervals</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0F172A] inline-block" />
              <span>Gross Volume</span>
            </div>
          </div>

          {/* Interactive Bar Columns Chart */}
          <div className="flex-1 min-h-[220px] flex items-end justify-between gap-3 pt-6 relative" id="styled-columns-chart-wrapper">
            {chartData.map((data, index) => {
              const maxGross = Math.max(...chartData.map(d => d.gross));
              const percentHeight = maxGross > 0 ? (data.gross / maxGross) * 80 : 10;
              
              return (
                <div
                  key={data.name}
                  className="flex-1 flex flex-col items-center group cursor-pointer relative"
                  onMouseEnter={() => setHoveredBarIndex(index)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  {/* Floating Metatooltip */}
                  <AnimatePresence>
                    {hoveredBarIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full mb-3 bg-[#0F172A] text-white text-[11px] p-3 rounded-lg shadow-xl z-20 w-44 font-sans border border-slate-800"
                        id={`tooltip-${index}`}
                      >
                        <div className="border-b border-slate-800 pb-1.5 mb-1.5 font-bold font-mono text-[10px] uppercase text-indigo-400 tracking-wider">
                          {data.name} Breakdown
                        </div>
                        <div className="space-y-1 text-slate-300">
                          <div className="flex justify-between">
                            <span>Gross:</span>
                            <span className="font-mono text-white">${data.gross.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Fees (2.9%):</span>
                            <span className="font-mono">-${data.fees.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-800/80 pt-1.5 mt-1 font-bold text-emerald-400">
                            <span>Net Payout:</span>
                            <span className="font-mono">${data.net.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#0F172A]" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Visual Bar Column */}
                  <div className="w-full relative rounded-t-md overflow-hidden bg-slate-50 border border-slate-100 flex items-end justify-center min-h-[12px] h-[180px]">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${percentHeight}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className={`w-full ${hoveredBarIndex === index ? "bg-indigo-600" : "bg-[#0F172A]"} rounded-t-xs transition-colors duration-200`}
                    />
                  </div>
                  
                  {/* Label */}
                  <span className="text-[10px] font-mono font-bold text-slate-400 mt-2 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {data.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COMPONENT: REAL-TIME PLATFORM ALERTS PANEL */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col shadow-xs" id="alerts-quick-insights-panel">
          <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-outfit text-base font-bold text-[#0F172A]">Real-time Platform Alerts</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">High-priority operational warnings</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
              {alerts.length} Active
            </span>
          </div>

          <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[220px] pr-1" id="alerts-scrolling-container">
            <AnimatePresence initial={false}>
              {alerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10" id="empty-alerts-state">
                  <Check className="w-8 h-8 text-emerald-500 mb-2" />
                  <p className="text-xs font-bold text-slate-700">All gateway Webhooks healthy</p>
                  <p className="text-[10px] text-slate-400 mt-1">Zero pending dunning warnings logged.</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 rounded-lg border text-xs flex gap-3 relative group ${
                      alert.severity === "Critical"
                        ? "bg-rose-50/50 border-rose-100 text-rose-950"
                        : alert.severity === "Warning"
                        ? "bg-amber-50/50 border-amber-100 text-amber-950"
                        : "bg-slate-50/50 border-slate-100 text-slate-950"
                    }`}
                    id={`alert-item-${alert.id}`}
                  >
                    <div className="mt-0.5">
                      {alert.severity === "Critical" ? (
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      ) : alert.severity === "Warning" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 pr-6">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold tracking-tight">{alert.title}</span>
                        <span className="text-[9px] font-mono font-bold text-slate-400 whitespace-nowrap">{alert.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                        {alert.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveAlert(alert.id)}
                      className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-900 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      title="Dismiss Alert"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* ==========================================
          BOTTOM SECTION: OPERATIONS LEDGER DATA TABLE
          ========================================== */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs" id="operations-ledger-data-table-panel">
        
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50" id="table-filter-bar">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search billing ledger (tenant, TXN, gateway)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 text-xs font-medium rounded-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
              id="ledger-search-input"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600" id="table-pagination-header">
            <span className="tabular-nums text-slate-400 font-mono">
              Showing {filteredTransactions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length}
            </span>
            
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                title="Previous Page"
                id="pagination-prev-btn"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                title="Next Page"
                id="pagination-next-btn"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dense Responsive Grid Table */}
        <div className="overflow-x-auto" id="transactions-responsive-table-wrapper">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={paginatedTransactions.length > 0 && paginatedTransactions.every(t => selectedTransactions.includes(t.id))}
                    onChange={handleSelectAll}
                    className="rounded-xs border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                
                <th className="py-3 px-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => { setSortField("id"); setSortAsc(!sortAsc); }}>
                  Transaction ID
                </th>
                
                <th className="py-3 px-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => { setSortField("tenantName"); setSortAsc(!sortAsc); }}>
                  Tenant Profile
                </th>
                
                <th className="py-3 px-4 text-right cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => { setSortField("grossAmount"); setSortAsc(!sortAsc); }}>
                  Gross Amount
                </th>
                
                <th className="py-3 px-4 text-right cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => { setSortField("fees"); setSortAsc(!sortAsc); }}>
                  Gateway Fees
                </th>
                
                <th className="py-3 px-4 text-right cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => { setSortField("netAmount"); setSortAsc(!sortAsc); }}>
                  Net Amount
                </th>
                
                <th className="py-3 px-4">Gateway</th>
                
                <th className="py-3 px-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => { setSortField("status"); setSortAsc(!sortAsc); }}>
                  Status Pill
                </th>
                
                <th className="py-3 px-4">Method</th>
                
                <th className="py-3 px-4 text-center">Invoice</th>
                
                <th className="py-3 px-4 w-12 text-center"></th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 font-medium font-sans">
                    No matching ledger transactions found for your query.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map(txn => {
                  const isChecked = selectedTransactions.includes(txn.id);
                  return (
                    <tr
                      key={txn.id}
                      className={`hover:bg-slate-50/65 transition-colors cursor-pointer group/row ${isChecked ? "bg-indigo-50/20 border-l-2 border-l-indigo-600" : ""}`}
                      onClick={() => setSelectedTransaction(txn)}
                      id={`txn-row-${txn.id}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 w-10" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(txn.id)}
                          className="rounded-xs border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <span className="hover:text-indigo-600 cursor-pointer font-bold" onClick={() => setSelectedTransaction(txn)}>
                          {txn.id.slice(0, 12)}...
                        </span>
                        <button
                          onClick={() => handleCopy(txn.id)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded-md transition-all hover:bg-slate-100"
                          title="Copy Full ID"
                        >
                          {copiedTxnId === txn.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </td>

                      {/* Clickable Tenant Profile */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                              {txn.tenantName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                            </span>
                          </div>
                          
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-xs text-[9px] font-bold font-mono tracking-wider ${
                              txn.tier === "Enterprise"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                : txn.tier === "Professional"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}>
                              {txn.tier}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Gross Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(txn.grossAmount)}
                      </td>

                      {/* Fees */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400 tabular-nums">
                        {txn.fees > 0 
                          ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(txn.fees)
                          : "—"
                        }
                      </td>

                      {/* Net Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 tabular-nums">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(txn.netAmount)}
                      </td>

                      {/* Gateway ID */}
                      <td className="py-3.5 px-4 font-medium text-slate-500">
                        {txn.gateway}
                      </td>

                      {/* Status Pill */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold whitespace-nowrap tracking-wide leading-none ${
                          txn.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : txn.status === "Failed"
                            ? "bg-rose-50 text-rose-700"
                            : txn.status === "Refunded"
                            ? "bg-slate-150 text-slate-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            txn.status === "Paid"
                              ? "bg-emerald-500"
                              : txn.status === "Failed"
                              ? "bg-rose-500"
                              : txn.status === "Refunded"
                              ? "bg-slate-500"
                              : "bg-amber-500"
                          }`} />
                          {txn.status}
                        </span>
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {txn.method}
                      </td>

                      {/* Linked Invoice Asset */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDownloadInvoice(txn)}
                          className="p-1.5 bg-slate-50 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-slate-100"
                          title={`Download Invoice: ${txn.invoiceNumber}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* Row Action Trigger Menu */}
                      <td className="py-3.5 px-4 text-center w-12 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveMenuTxnId(activeMenuTxnId === txn.id ? null : txn.id)}
                          className="p-1 text-slate-400 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
                          title="Operational Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Inline Operational Menu */}
                        <AnimatePresence>
                          {activeMenuTxnId === txn.id && (
                            <>
                              <div className="fixed inset-0 z-20" onClick={() => setActiveMenuTxnId(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-8 top-0 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 w-44 text-left z-30 font-sans"
                              >
                                <button
                                  onClick={() => handleManualAction(txn.id, "Force Settle")}
                                  className="w-full px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 text-left block"
                                >
                                  Force Settle
                                </button>
                                <button
                                  onClick={() => handleManualAction(txn.id, "Mark as Refunded")}
                                  className="w-full px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-50 text-left block"
                                >
                                  Mark as Refunded
                                </button>
                                <button
                                  onClick={() => handleManualAction(txn.id, "Retry Processing")}
                                  className="w-full px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 text-left block"
                                >
                                  Retry Processing
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ==========================================
          INTERACTIVE OVERLAYS & SLIDE-OUTS
          ========================================== */}
      
      {/* A. RIGHT-SIDE SLIDE-OVER DETAIL DRAWER */}
      <AnimatePresence>
        {selectedTransaction && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTransaction(null)}
              className="fixed inset-0 bg-black z-40"
            />
            
            {/* Slide Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
              className="fixed right-0 top-0 bottom-0 max-w-xl w-full bg-white shadow-2xl z-50 overflow-y-auto flex flex-col border-l border-slate-200"
              id="transaction-slide-over-drawer"
            >
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Transaction Registry</span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                      selectedTransaction.status === "Paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-mono text-[#0F172A] mt-1 tracking-tight">
                    {selectedTransaction.id}
                  </h3>
                </div>
                
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 flex-1 space-y-6">
                
                {/* Visual Metadata Panel */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Registered Tenant</span>
                    <span className="text-sm font-black text-[#0F172A] mt-1.5 block leading-none">
                      {selectedTransaction.tenantName}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                      Invoice No: {selectedTransaction.invoiceNumber}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Settlement Net</span>
                    <span className="text-2xl font-black text-indigo-600 mt-1.5 block leading-none tabular-nums">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(selectedTransaction.netAmount)}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-400 block mt-2">
                      via {selectedTransaction.gateway}
                    </span>
                  </div>
                </div>

                {/* Breakdown Matrix */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">Itemized Financial Breakdown</h4>
                  
                  <div className="border border-slate-150 rounded-xl overflow-hidden divide-y divide-slate-100">
                    <div className="p-3.5 flex justify-between text-xs font-medium">
                      <span className="text-slate-500">Gross Invoiced Volume</span>
                      <span className="font-mono tabular-nums text-slate-900">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(selectedTransaction.grossAmount)}
                      </span>
                    </div>

                    <div className="p-3.5 flex justify-between text-xs font-medium">
                      <span className="text-slate-500">Gateway Pipeline Fees (Credit card standard)</span>
                      <span className="font-mono tabular-nums text-slate-500">
                        -{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(selectedTransaction.fees)}
                      </span>
                    </div>

                    <div className="p-3.5 flex justify-between text-xs font-medium bg-slate-50/50">
                      <span className="text-slate-900 font-bold">Adjusted Net Disbursed</span>
                      <span className="font-mono tabular-nums font-black text-[#0F172A]">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(selectedTransaction.netAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lifecycle Tracker */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">Transaction Lifecycle Timeline</h4>
                  
                  <div className="relative pl-6 space-y-4 border-l border-slate-150 py-1 ml-2">
                    {selectedTransaction.timeline.map((step, idx) => (
                      <div key={idx} className="relative text-xs">
                        {/* Bullet */}
                        <span className="absolute -left-[29px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-indigo-600 shadow-xs flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0F172A]">{step.label}</span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">{step.time}</span>
                        </div>
                        
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-medium">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Raw Code JSON View Payload Panel */}
                <div className="space-y-3">
                  <details className="group border border-slate-200 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between p-3.5 bg-slate-50 text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors select-none">
                      <span className="font-mono uppercase tracking-wider">Gateway Response Metadata</span>
                      <span className="text-xs text-indigo-600 font-sans group-open:hidden">Expand Payload</span>
                      <span className="text-xs text-slate-400 font-sans hidden group-open:inline">Collapse Payload</span>
                    </summary>
                    
                    <div className="p-4 border-t border-slate-200 bg-slate-900 text-white font-mono text-[10px] overflow-x-auto max-h-48 leading-relaxed">
                      <pre>{selectedTransaction.rawPayload}</pre>
                    </div>
                  </details>
                </div>

              </div>

              {/* Drawer Sticky Action Row */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600">Manual Refund Guarantee:</span>
                    <span className="font-mono text-indigo-600">{refundSliderVal}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={10}
                    value={refundSliderVal}
                    onChange={(e) => setRefundSliderVal(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                  />
                  <p className="text-[9px] font-mono font-bold text-slate-400 leading-normal">
                    Authorize the exact percentage offset parameters before execution.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    disabled={selectedTransaction.status === "Refunded"}
                    onClick={() => {
                      const amountRefunded = (selectedTransaction.grossAmount * (refundSliderVal / 100)).toFixed(2);
                      handleManualAction(selectedTransaction.id, "Mark as Refunded");
                      triggerToast(`Authorized partial refund of $${amountRefunded} via primary pipeline`, "success");
                      setSelectedTransaction(null);
                    }}
                    className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Confirm Refund
                  </button>

                  <button
                    onClick={() => {
                      triggerToast(`Clearing reference logs manually for ${selectedTransaction.invoiceNumber}`, "info");
                      setSelectedTransaction(null);
                    }}
                    className="h-9 px-4 bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-50 text-xs font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer"
                  >
                    Dismiss Workspace
                  </button>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* B. ACTION MODAL 1: MANUAL INVOICE CREATOR */}
      <AnimatePresence>
        {isInvoiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4" id="invoice-creator-modal-container">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInvoiceModalOpen(false)}
              className="fixed inset-0 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] z-50 font-sans"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] tracking-tight">Manual Invoice Generation Panel</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Dispatches manual ACH billing parameter structures onto core clusters.</p>
                </div>
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleGenerateInvoice} className="flex-1 overflow-y-auto p-6 space-y-5">
                
                {/* Form Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Select Merchant Tenant</label>
                    <select
                      value={invoiceTenant}
                      onChange={(e) => setInvoiceTenant(e.target.value)}
                      className="w-full h-9 px-3 border border-slate-200 text-xs font-semibold text-slate-700 bg-white rounded-lg focus:outline-none focus:border-indigo-500 transition-all"
                      required
                    >
                      <option value="">-- Choose Tenant Company --</option>
                      {tenants.map(t => (
                        <option key={t.id} value={t.name}>{t.name} ({t.plan} cluster)</option>
                      ))}
                      <option value="LexCorp Labs">LexCorp Labs (Custom Sandbox)</option>
                      <option value="Omni Consumer Products">Omni Consumer Products (Enterprise)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Subscription Tier Linkage</label>
                    <select
                      value={invoiceTier}
                      onChange={(e) => setInvoiceTier(e.target.value as any)}
                      className="w-full h-9 px-3 border border-slate-200 text-xs font-semibold text-slate-700 bg-white rounded-lg focus:outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="Starter">Starter</option>
                      <option value="Professional">Professional</option>
                      <option value="Enterprise">Enterprise</option>
                      <option value="Custom">Custom SLA Option</option>
                    </select>
                  </div>
                </div>

                {/* Line Items Grid */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Itemized Billing Allocations</label>
                    <button
                      type="button"
                      onClick={addInvoiceLineItem}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Custom Item
                    </button>
                  </div>

                  <div className="space-y-3" id="invoice-line-items-wrapper">
                    {invoiceLineItems.map((item, idx) => (
                      <div key={item.id} className="flex gap-3 items-center" id={`line-item-${item.id}`}>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Line Item Description (e.g. Extra queue quotas)"
                            value={item.description}
                            onChange={(e) => updateInvoiceLineItem(item.id, "description", e.target.value)}
                            className="w-full h-9 px-3 border border-slate-200 text-xs font-medium text-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition-all"
                            required
                          />
                        </div>
                        
                        <div className="w-20">
                          <input
                            type="number"
                            placeholder="Qty"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateInvoiceLineItem(item.id, "quantity", Number(e.target.value))}
                            className="w-full h-9 px-3 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg text-center focus:outline-none focus:border-indigo-500 transition-all"
                            required
                          />
                        </div>

                        <div className="w-28 relative">
                          <span className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold">$</span>
                          <input
                            type="number"
                            placeholder="Price"
                            step="0.01"
                            min="0.00"
                            value={item.unitPrice}
                            onChange={(e) => updateInvoiceLineItem(item.id, "unitPrice", Number(e.target.value))}
                            className="w-full h-9 pl-6 pr-3 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition-all"
                            required
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeInvoiceLineItem(item.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-100 transition-colors"
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adjustments row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Applied Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceTax}
                      onChange={(e) => setInvoiceTax(Number(e.target.value))}
                      className="w-full h-9 px-3 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Ad-hoc Overage Fee Adjustment ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceOverage}
                      onChange={(e) => setInvoiceOverage(Number(e.target.value))}
                      className="w-full h-9 px-3 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Calculations preview box */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Line Subtotal:</span>
                    <span className="font-mono tabular-nums">${invoiceCalculations.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Applied Tax Volume ({invoiceTax}%):</span>
                    <span className="font-mono tabular-nums">${invoiceCalculations.taxAmt.toFixed(2)}</span>
                  </div>
                  {Number(invoiceOverage) > 0 && (
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>Ad-hoc adjustment:</span>
                      <span className="font-mono tabular-nums">${Number(invoiceOverage).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black border-t border-slate-200/80 pt-2 text-[#0F172A]">
                    <span>Total Invoiced Gross Amount:</span>
                    <span className="font-mono tabular-nums text-indigo-600">${invoiceCalculations.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsInvoiceModalOpen(false)}
                    className="h-9 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isInvoiceSubmitting}
                    className="h-9 px-4 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isInvoiceSubmitting ? "Generating..." : "Generate & Dispatch Invoice"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* C. ACTION MODAL 2: PLAN CONFIGURATOR GRID */}
      <AnimatePresence>
        {isPlanConfigOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4" id="plan-configurator-modal-container">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPlanConfigOpen(false)}
              className="fixed inset-0 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col z-50 font-sans"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] tracking-tight">Active Platform Plan Matrix Configurator</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Mutate SaaS billing parameter variables and queue capacity limits global thresholds.</p>
                </div>
                <button
                  onClick={() => setIsPlanConfigOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Config Matrix */}
              <form onSubmit={handleSavePlanConfig} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="plans-configuration-matrix-grid">
                  
                  {plans.map((p, idx) => (
                    <div key={p.key} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between" id={`plan-config-card-${p.key}`}>
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">{p.name}</span>
                        
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-500">Monthly Price ($)</label>
                          <input
                            type="number"
                            value={p.price}
                            onChange={(e) => {
                              const updatedPrice = Number(e.target.value);
                              setPlans(prev => prev.map((item, i) => i === idx ? { ...item, price: updatedPrice } : item));
                            }}
                            className="w-full h-8 px-2 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-500">Queue Limit (Reqs)</label>
                          <input
                            type="number"
                            value={p.limit}
                            onChange={(e) => {
                              const updatedLimit = Number(e.target.value);
                              setPlans(prev => prev.map((item, i) => i === idx ? { ...item, limit: updatedLimit } : item));
                            }}
                            className="w-full h-8 px-2 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-500">Overage / 1k ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={p.overage}
                            onChange={(e) => {
                              const updatedOverage = Number(e.target.value);
                              setPlans(prev => prev.map((item, i) => i === idx ? { ...item, overage: updatedOverage } : item));
                            }}
                            className="w-full h-8 px-2 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/50">
                        <span className="text-[10px] text-slate-400 font-semibold italic">Global baseline parameter mapping</span>
                      </div>
                    </div>
                  ))}

                </div>

                {/* Footer Warning & Actions */}
                <div className="p-3.5 rounded-lg border border-amber-100 bg-amber-50/50 flex gap-2.5 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-semibold">
                    Warning: Saving configuration parameters triggers background cron jobs to update billing invoices on anniversaries. Active sessions won't disconnect.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlanConfigOpen(false)}
                    className="h-9 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isPlanSaving}
                    className="h-9 px-4 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {isPlanSaving ? "Saving Limits..." : "Save Configuration States"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
