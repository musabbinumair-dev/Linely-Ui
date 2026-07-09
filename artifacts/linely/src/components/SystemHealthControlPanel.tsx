import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from "recharts";
import { 
  Activity, 
  RefreshCw, 
  Settings, 
  Search, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  X, 
  ChevronRight, 
  Cpu, 
  Database, 
  Server, 
  Clock, 
  Play, 
  AlertOctagon, 
  Terminal, 
  HardDrive, 
  Network, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  Bell, 
  BellOff, 
  Info, 
  HelpCircle,
  Sparkles,
  RotateCw,
  Sliders,
  Power,
  Zap,
  Globe,
  Lock,
  ChevronDown,
  UserCheck
} from "lucide-react";

// --- Types ---
export interface ServiceHealth {
  id: string;
  name: string;
  status: "Healthy" | "Warning" | "Degraded" | "Critical" | "Maintenance" | "Unknown";
  uptime: string;
  responseTime: number; // ms
  errorCount: number;
  lastRestart: string;
  version: string;
  dependencies: string[];
  host: string;
  cpu: number;
  memory: number; // MB
}

export interface Incident {
  id: string;
  title: string;
  severity: "Critical" | "Warning" | "Info";
  impactedService: string;
  startTime: string;
  duration: string;
  owner: string;
  status: "Unassigned" | "Investigating" | "Identified" | "Mitigated" | "Resolved";
  notes: string[];
}

export interface AlertRule {
  id: string;
  metric: string;
  operator: string;
  threshold: number;
  duration: string;
  service: string;
  isMuted: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  severity: "Debug" | "Info" | "Warning" | "Error" | "Critical";
  service: string;
  host: string;
  tenant: string;
  message: string;
  stackTrace?: string;
  correlationId: string;
  requestId: string;
}

interface SystemHealthControlPanelProps {
  tenants: any[];
  addAuditLog: (action: string, target: string, severity?: "Info" | "Warning" | "Critical") => void;
  triggerToast: (msg: string, type: "success" | "info" | "warning" | "error") => void;
}

// --- Initial Mock Data ---
const INITIAL_SERVICES: ServiceHealth[] = [
  { id: "frontend", name: "Frontend Portal", status: "Healthy", uptime: "99.99%", responseTime: 42, errorCount: 1, lastRestart: "14d ago", version: "v4.12.2", dependencies: ["API Gateway"], host: "web-pod-01", cpu: 14, memory: 342 },
  { id: "api-gateway", name: "API Gateway", status: "Healthy", uptime: "99.95%", responseTime: 124, errorCount: 4, lastRestart: "3d ago", version: "v4.12.2", dependencies: ["PostgreSQL DB", "Redis Cache", "Auth Service"], host: "api-pod-01", cpu: 28, memory: 512 },
  { id: "worker-queue", name: "Worker Queue", status: "Warning", uptime: "99.82%", responseTime: 1840, errorCount: 38, lastRestart: "6h ago", version: "v4.12.0", dependencies: ["Redis Cache", "PostgreSQL DB"], host: "worker-node-02", cpu: 74, memory: 1240 },
  { id: "redis-cache", name: "Redis Cache", status: "Healthy", uptime: "100.00%", responseTime: 1, errorCount: 0, lastRestart: "45d ago", version: "v7.2", dependencies: [], host: "redis-master", cpu: 8, memory: 2048 },
  { id: "postgres-db", name: "PostgreSQL DB", status: "Healthy", uptime: "99.98%", responseTime: 12, errorCount: 2, lastRestart: "45d ago", version: "v16.2", dependencies: ["S3 Storage"], host: "db-replica-01", cpu: 45, memory: 3120 },
  { id: "auth-service", name: "Auth Service", status: "Healthy", uptime: "99.99%", responseTime: 88, errorCount: 0, lastRestart: "3d ago", version: "v2.1.0", dependencies: ["PostgreSQL DB"], host: "auth-pod-01", cpu: 12, memory: 198 },
  { id: "s3-storage", name: "S3 Storage", status: "Healthy", uptime: "100.00%", responseTime: 240, errorCount: 0, lastRestart: "Never", version: "v1.0.0", dependencies: [], host: "aws-s3", cpu: 2, memory: 110 },
  { id: "webhook-engine", name: "Webhook Engine", status: "Warning", uptime: "99.74%", responseTime: 3210, errorCount: 142, lastRestart: "12h ago", version: "v1.4.1", dependencies: ["PostgreSQL DB", "API Gateway"], host: "web-pod-02", cpu: 55, memory: 780 },
  { id: "scheduler", name: "Scheduler", status: "Healthy", uptime: "100.00%", responseTime: 5, errorCount: 0, lastRestart: "3d ago", version: "v1.1.0", dependencies: ["Redis Cache"], host: "worker-node-01", cpu: 5, memory: 120 },
  { id: "sms-email-notification", name: "Notification Service", status: "Healthy", uptime: "99.90%", responseTime: 310, errorCount: 12, lastRestart: "3d ago", version: "v2.4.5", dependencies: ["PostgreSQL DB"], host: "worker-node-01", cpu: 18, memory: 250 },
  { id: "elasticsearch", name: "Elasticsearch", status: "Healthy", uptime: "99.88%", responseTime: 180, errorCount: 3, lastRestart: "12d ago", version: "v8.11", dependencies: ["PostgreSQL DB"], host: "search-cluster-01", cpu: 32, memory: 4096 }
];

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "INC-9042",
    title: "Optical Character Recognition queue backup on bulk documents",
    severity: "Warning",
    impactedService: "Worker Queue",
    startTime: "2026-07-08T03:10:00Z",
    duration: "2h 4m",
    owner: "Ellen Ripley",
    status: "Investigating",
    notes: [
      "Detected heavy surge of doc uploads from Tenant ID: TEN-981 (Acme Medical).",
      "OCR tasks consuming extensive worker-queue memory allocations.",
      "Worker scale group launched with 3 additional containers."
    ]
  },
  {
    id: "INC-8931",
    title: "Webhook delivery failure rate spike to Webhook Engine",
    severity: "Warning",
    impactedService: "Webhook Engine",
    startTime: "2026-07-08T01:45:00Z",
    duration: "3h 29m",
    owner: "John Connor",
    status: "Identified",
    notes: [
      "Stripe webhooks failing with connection timeouts on legacy receiver endpoints.",
      "Retry scheduler backed off automatically. Auto-dunning warning emails sent."
    ]
  }
];

const INITIAL_ALERTS: AlertRule[] = [
  { id: "rule-01", metric: "CPU Utilization", operator: ">", threshold: 85, duration: "5m", service: "Worker Queue", isMuted: false },
  { id: "rule-02", metric: "API Error Rate", operator: ">", threshold: 1.5, duration: "3m", service: "API Gateway", isMuted: false },
  { id: "rule-03", metric: "p95 Latency", operator: ">", threshold: 500, duration: "2m", service: "Frontend Portal", isMuted: true },
  { id: "rule-04", metric: "Disk Utilization", operator: ">", threshold: 90, duration: "10m", service: "PostgreSQL DB", isMuted: false }
];

const GENERATED_LOGS: LogEntry[] = [
  { id: "log-101", timestamp: "05:14:10", severity: "Info", service: "API Gateway", host: "api-pod-01", tenant: "TEN-003", message: "GET /api/v1/workspaces - HTTP 200 (12ms) - correlation: corr-8a2f", correlationId: "corr-8a2f", requestId: "req-9231" },
  { id: "log-102", timestamp: "05:14:12", severity: "Warning", service: "Worker Queue", host: "worker-node-02", tenant: "TEN-981", message: "OCR task timed out after 30s. Retrying in segment bucket 2.", correlationId: "corr-f92a", requestId: "req-9232" },
  { id: "log-103", timestamp: "05:14:15", severity: "Error", service: "Webhook Engine", host: "web-pod-02", tenant: "TEN-412", message: "Failed to dispatch webhook 'invoice.paid' to client target https://mock-endpoints.io/acme/hook. HTTP 504 Gateway Timeout.", stackTrace: "at WebhookEngine.dispatch (engine.ts:204)\nat processTicksAndRejections (node:internal/process/task_queues:95)", correlationId: "corr-3b12", requestId: "req-9233" },
  { id: "log-104", timestamp: "05:14:18", severity: "Info", service: "PostgreSQL DB", host: "db-replica-01", tenant: "SYSTEM", message: "VACUUM ANALYZE completed on schema public. SLA metrics optimum.", correlationId: "corr-1122", requestId: "req-9234" },
  { id: "log-105", timestamp: "05:14:21", severity: "Debug", service: "Auth Service", host: "auth-pod-01", tenant: "TEN-005", message: "JWT Token verification succeeded for sub: user_90832 (expiry: 3600s)", correlationId: "corr-a34f", requestId: "req-9235" },
  { id: "log-106", timestamp: "05:14:24", severity: "Info", service: "Frontend Portal", host: "web-pod-01", tenant: "TEN-102", message: "Client app bundle loaded successfully. DNS resolve time: 4ms.", correlationId: "corr-78bc", requestId: "req-9236" },
  { id: "log-107", timestamp: "05:14:28", severity: "Critical", service: "Worker Queue", host: "worker-node-02", tenant: "TEN-981", message: "FATAL: OutOfMemoryError in PDF optical parsing threadpool. Heap allocation exhausted.", stackTrace: "java.lang.OutOfMemoryError: Java heap space\nat java.base/java.util.Arrays.copyOf(Arrays.java:3537)\nat java.base/java.io.ByteArrayOutputStream.write(ByteArrayOutputStream.java:128)\nat org.apache.pdfbox.pdfparser.COSParser.parseFDF(COSParser.java:231)", correlationId: "corr-f92a", requestId: "req-9237" }
];

export default function SystemHealthControlPanel({ tenants, addAuditLog, triggerToast }: SystemHealthControlPanelProps) {
  // --- Core States ---
  const [services, setServices] = useState<ServiceHealth[]>(INITIAL_SERVICES);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(INITIAL_ALERTS);
  const [logs, setLogs] = useState<LogEntry[]>(GENERATED_LOGS);
  
  const [timeRange, setTimeRange] = useState<"15m" | "1h" | "6h" | "24h" | "7d">("1h");
  const [env, setEnv] = useState<"Production" | "Staging" | "UAT" | "Dev">("Production");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(15);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveTailing, setIsLiveTailing] = useState(true);

  // --- Search Filtering ---
  const filteredServices = useMemo(() => {
    return services.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => 
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.impactedService.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [incidents, searchTerm]);

  // --- Active Panels & Selectors ---
  const [metricTab, setMetricTab] = useState<"resources" | "database" | "traffic">("resources");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceHealth | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  const [endpointResult, setEndpointResult] = useState<any | null>(null);
  
  // Incident Form / Management State
  const [activeIncidentFilter, setActiveIncidentFilter] = useState<"All" | "Active" | "Resolved">("Active");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [noteInput, setNoteInput] = useState("");
  
  // Alert Rule States
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newRuleMetric, setNewRuleMetric] = useState("CPU Utilization");
  const [newRuleOperator, setNewRuleOperator] = useState(">");
  const [newRuleThreshold, setNewRuleThreshold] = useState(80);
  const [newRuleService, setNewRuleService] = useState("Frontend Portal");

  // Logs Drawer State
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);
  const [logsSearch, setLogsSearch] = useState("");
  const [logsSeverity, setLogsSeverity] = useState<string>("All");
  const [logsService, setLogsService] = useState<string>("All");

  // Sweep diagnostic trace
  const [diagnosticSweeping, setDiagnosticSweeping] = useState(false);
  const [sweepProgress, setSweepProgress] = useState(0);
  const [sweepLogs, setSweepLogs] = useState<string[]>([]);

  // Dependency Map Hover
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Ref to log body container for automatic scroll to bottom
  const logContainerRef = useRef<HTMLDivElement>(null);

  // --- Auto-Refresh Timer ---
  useEffect(() => {
    let interval: any = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        setRefreshCountdown(prev => {
          if (prev <= 1) {
            triggerRefresh(true);
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // --- Live Log Tail Feed Simulation ---
  useEffect(() => {
    let interval: any = null;
    if (isLiveTailing) {
      interval = setInterval(() => {
        const servicesList = ["API Gateway", "Worker Queue", "Webhook Engine", "PostgreSQL DB", "Auth Service", "Frontend Portal"];
        const severities: ("Debug" | "Info" | "Warning" | "Error" | "Critical")[] = ["Debug", "Info", "Info", "Warning", "Error"];
        const messagesMap: Record<string, string[]> = {
          "API Gateway": ["GET /api/v1/compliance-reports - HTTP 200 (45ms)", "POST /api/v1/auth/mfa-verify - HTTP 201 (112ms)", "GET /api/v1/tenants/status - HTTP 200 (18ms)"],
          "Worker Queue": ["OCR processing thread picked up doc chunk #8921", "Pruned 15 expired system lock records", "Worker scaling controller checked metric thresholds"],
          "Webhook Engine": ["Dispatched payload for events 'audit.log.created' to webhook proxy.", "Connection reset on target endpoint, preparing retry backoff #1"],
          "PostgreSQL DB": ["Executed bulk insert of compliance metric records", "Idle connection closed (host: app-pod-05)"],
          "Auth Service": ["Revoked session token for user-092 due to password reset event.", "JWT signature verified successfully"],
          "Frontend Portal": ["Page view tracked on superadmin-compliance-timeline", "Re-established socket cluster handshake connection"]
        };

        const randomService = servicesList[Math.floor(Math.random() * servicesList.length)];
        const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
        const messages = messagesMap[randomService] || ["Routine health heartbeats synchronized."];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        const now = new Date();
        const timestampStr = now.toTimeString().split(" ")[0];

        const newLog: LogEntry = {
          id: `log-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          timestamp: timestampStr,
          severity: randomSeverity,
          service: randomService,
          host: `web-pod-0${Math.floor(Math.random() * 3) + 1}`,
          tenant: Math.random() > 0.3 ? `TEN-0${Math.floor(Math.random() * 9) + 1}` : "SYSTEM",
          message: randomMessage,
          correlationId: `corr-${Math.random().toString(36).substring(2, 6)}`,
          requestId: `req-${Math.floor(1000 + Math.random() * 9000)}`
        };

        setLogs(prev => {
          const updated = [...prev, newLog];
          if (updated.length > 50) updated.shift(); // keep last 50 logs
          return updated;
        });

        // If specific rules are hit, slightly update resources
        setServices(prev => 
          prev.map(s => {
            if (s.name === randomService) {
              const deltaCpu = Math.floor(Math.random() * 5) - 2;
              const deltaMem = Math.floor(Math.random() * 10) - 5;
              const newCpu = Math.max(5, Math.min(95, s.cpu + deltaCpu));
              const newMem = Math.max(100, Math.min(8000, s.memory + deltaMem));
              return {
                ...s,
                cpu: newCpu,
                memory: newMem,
                responseTime: Math.max(1, s.responseTime + (randomSeverity === "Error" ? 50 : Math.floor(Math.random() * 6) - 3))
              };
            }
            return s;
          })
        );

      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isLiveTailing]);

  // --- Scroll Logs ---
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, showLogsDrawer]);

  // --- Actions ---
  const triggerRefresh = (isAuto = false) => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString());
      if (!isAuto) {
        triggerToast("Platform metrics synchronized across all regions.", "success");
        addAuditLog("Executed manual system health audit refresh", "Global Infrastructure", "Info");
      }
    }, 800);
  };

  const handleRunSweep = () => {
    if (diagnosticSweeping) return;
    setDiagnosticSweeping(true);
    setSweepProgress(5);
    setSweepLogs(["Initializing local diagnostics bridge..."]);
    addAuditLog("Triggered full active Diagnostics Sweep", "Global Infrastructure", "Warning");

    const steps = [
      { progress: 20, log: "Analyzing active PostgreSQL query locks and connection pools..." },
      { progress: 45, log: "Testing Redis pub-sub throughput latency (Target baseline: <2ms)..." },
      { progress: 70, log: "Verifying secure Web TLS certificates and domain records..." },
      { progress: 90, log: "Probing secondary cloud storage buckets & dunning hooks..." },
      { progress: 100, log: "Diagnostic sweep concluded. Zero critical leaks detected." }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setSweepProgress(step.progress);
        setSweepLogs(prev => [...prev, step.log]);
        if (step.progress === 100) {
          setDiagnosticSweeping(false);
          // Set Worker status to healthy
          setServices(prev => prev.map(s => s.id === "worker-queue" ? { ...s, status: "Healthy" } : s));
          triggerToast("Diagnostics Sweep succeeded! Worker queue issues reconciled.", "success");
        }
      }, (index + 1) * 1200);
    });
  };

  const handleTestEndpoint = (service: ServiceHealth) => {
    setTestingEndpoint(service.name);
    setEndpointResult(null);

    setTimeout(() => {
      const responseCode = service.status === "Critical" ? 500 : 200;
      const ttfb = Math.floor(service.responseTime * 0.7);
      const dataSize = Math.floor(Math.random() * 20) + 2; // KB
      setEndpointResult({
        dnsLookup: "4ms",
        tcpConnect: "8ms",
        tlsHandshake: "14ms",
        ttfb: `${ttfb}ms`,
        transferTime: `${Math.floor(service.responseTime * 0.3)}ms`,
        totalTime: `${service.responseTime}ms`,
        statusCode: responseCode,
        payloadSize: `${dataSize} KB`,
        ipAddress: `10.240.4.${Math.floor(Math.random() * 254) + 1}`
      });
    }, 1500);
  };

  const handleRestartService = (service: ServiceHealth) => {
    if (window.confirm(`Are you absolutely sure you want to perform a hard reboot on ${service.name}? This will transiently interrupt active connections.`)) {
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, status: "Maintenance" } : s));
      addAuditLog(`Issued a supervisor-level hard reboot signal`, service.name, "Warning");
      triggerToast(`Restart signal sent to ${service.name}. Rebooting container...`, "warning");

      setTimeout(() => {
        setServices(prev => prev.map(s => s.id === service.id ? { ...s, status: "Healthy", errorCount: 0, uptime: "100.00%", responseTime: Math.floor(s.responseTime / 2) } : s));
        const now = new Date().toTimeString().split(" ")[0];
        const restartLog: LogEntry = {
          id: `log-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          timestamp: now,
          severity: "Info",
          service: service.name,
          host: service.host,
          tenant: "SYSTEM",
          message: `Service container started successfully. Version ${service.version} up.`,
          correlationId: `corr-sys-${Date.now().toString().slice(-4)}`,
          requestId: `req-sys-${Date.now().toString().slice(-4)}`
        };
        setLogs(prev => [...prev, restartLog]);
        triggerToast(`${service.name} successfully re-provisioned and active.`, "success");
        addAuditLog(`Reboot cycle completed successfully`, service.name, "Info");
      }, 3000);
    }
  };

  const handleIncidentAction = (incId: string, actionType: "Acknowledge" | "Resolve") => {
    setIncidents(prev => 
      prev.map(inc => {
        if (inc.id === incId) {
          if (actionType === "Acknowledge") {
            const updatedNotes = [...inc.notes, `Incident acknowledged by administrator Sarah Connor.`];
            return { ...inc, status: "Investigating" as const, owner: "Sarah Connor", notes: updatedNotes };
          } else {
            const updatedNotes = [...inc.notes, `Incident resolved by administrator Sarah Connor.`];
            return { ...inc, status: "Resolved" as const, notes: updatedNotes };
          }
        }
        return inc;
      })
    );

    const detailText = actionType === "Acknowledge" 
      ? `Acknowledged active incident ${incId} and assigned to Sarah Connor` 
      : `Closed incident ${incId} with resolution status`;
    
    addAuditLog(detailText, "Incident Manager", actionType === "Acknowledge" ? "Warning" : "Info");
    triggerToast(`Incident ${incId} ${actionType === "Acknowledge" ? "acknowledged" : "resolved"}.`, "success");
  };

  const handleAddIncidentNote = (incId: string) => {
    if (!noteInput.trim()) return;
    setIncidents(prev => 
      prev.map(inc => {
        if (inc.id === incId) {
          return { ...inc, notes: [...inc.notes, noteInput.trim()] };
        }
        return inc;
      })
    );
    setNoteInput("");
    triggerToast("Diagnostic note added to incident record.", "success");
  };

  const handleCreateAlertRule = () => {
    const newRule: AlertRule = {
      id: `rule-${Date.now().toString().slice(-4)}`,
      metric: newRuleMetric,
      operator: newRuleOperator,
      threshold: newRuleThreshold,
      duration: "5m",
      service: newRuleService,
      isMuted: false
    };

    setAlertRules(prev => [...prev, newRule]);
    setShowAddAlert(false);
    triggerToast(`Created new alert rule for ${newRuleService}`, "success");
    addAuditLog(`Created alerting threshold rule for ${newRuleService}: ${newRuleMetric} ${newRuleOperator} ${newRuleThreshold}`, "Alert Policy Engine", "Info");
  };

  const toggleMuteRule = (ruleId: string) => {
    setAlertRules(prev => 
      prev.map(r => r.id === ruleId ? { ...r, isMuted: !r.isMuted } : r)
    );
    const targetRule = alertRules.find(r => r.id === ruleId);
    if (targetRule) {
      const logAction = targetRule.isMuted ? "Unmuted" : "Muted";
      triggerToast(`Alert policy ${targetRule.metric} ${logAction.toLowerCase()} successfully.`, "info");
      addAuditLog(`${logAction} telemetry alert rules for ${targetRule.service}`, "Alert Policy Engine", "Info");
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    const targetRule = alertRules.find(r => r.id === ruleId);
    setAlertRules(prev => prev.filter(r => r.id !== ruleId));
    if (targetRule) {
      triggerToast(`Alert policy deleted.`, "warning");
      addAuditLog(`Permanently removed alerting threshold policy: ${targetRule.metric}`, "Alert Policy Engine", "Critical");
    }
  };

  const handleTestAlertSignal = () => {
    triggerToast("SIMULATION: Alert rule 'rule-01' breached CPU threshold. Slack and PagerDuty triggered.", "error");
    addAuditLog("Dispatched diagnostic PagerDuty notification event", "System Health", "Critical");
  };

  // --- Chart Data Mock ---
  const metricChartData = useMemo(() => {
    const data = [];
    const count = timeRange === "15m" ? 15 : timeRange === "1h" ? 12 : timeRange === "6h" ? 24 : 30;
    
    for (let i = 0; i < count; i++) {
      const baselineCpu = metricTab === "resources" ? 35 : metricTab === "database" ? 42 : 120;
      const noise = Math.floor(Math.sin(i / 2) * 12) + Math.floor(Math.random() * 8);
      const value = baselineCpu + noise;
      const yesterdayValue = value * 0.9 + Math.floor(Math.random() * 15) - 7;
      
      let label = "";
      if (timeRange === "15m") label = `${i}m ago`;
      else if (timeRange === "1h") label = `${i * 5}m ago`;
      else if (timeRange === "6h") label = `${Math.floor(i / 4)}h ago`;
      else label = `July ${8 - Math.floor((30 - i) / 5)}`;

      data.push({
        name: label,
        currentValue: value,
        compareValue: compareMode ? yesterdayValue : null,
        errorRate: (Math.random() * 0.1).toFixed(2),
        latency: 140 + Math.floor(Math.sin(i / 3) * 30) + Math.floor(Math.random() * 15)
      });
    }
    return data;
  }, [metricTab, timeRange, compareMode]);

  // Sparkline data for mini cards
  const generateSparklineData = (seed: number) => {
    return Array.from({ length: 12 }, (_, i) => ({
      val: seed + Math.sin(i) * (seed * 0.15) + (Math.random() * (seed * 0.05))
    }));
  };

  // --- Filter Logs for the Drawer ---
  const logsFilteredForDrawer = useMemo(() => {
    return logs.filter(l => {
      const matchesSearch = l.message.toLowerCase().includes(logsSearch.toLowerCase()) ||
                            l.requestId.toLowerCase().includes(logsSearch.toLowerCase()) ||
                            l.correlationId.toLowerCase().includes(logsSearch.toLowerCase());
      const matchesSeverity = logsSeverity === "All" ? true : l.severity === logsSeverity;
      const matchesService = logsService === "All" ? true : l.service === logsService;
      return matchesSearch && matchesSeverity && matchesService;
    }).reverse();
  }, [logs, logsSearch, logsSeverity, logsService]);

  // Jump to specific section handler (simulating jumping from KPI click)
  const jumpToSection = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      el.classList.add("ring-2", "ring-brand-cyan/40", "transition-all");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-brand-cyan/40");
      }, 2000);
    }
  };

  return (
    <div className="space-y-6 text-slate-900" id="system-health-panel-root">
      
      {/* 1. TOP HEADER & TELEMETRY CONTROLS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-150 pb-5">
        <div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-black animate-pulse inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            ALL SYSTEMS OPTIMAL
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 xl:self-end">
          
          {/* Environment */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 text-xs shadow-xs">
            {(["Production", "Staging", "Dev"] as const).map(item => (
              <button
                key={item}
                onClick={() => setEnv(item)}
                className={`px-2.5 py-1 rounded-md font-mono font-bold transition-all text-[10px] uppercase cursor-pointer ${
                  env === item 
                    ? "bg-[#0F172A] text-white shadow-xs" 
                    : "text-slate-500 hover:text-[#0F172A]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 font-mono text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-cyan shadow-xs cursor-pointer"
          >
            <option value="15m">LAST 15 MINUTES</option>
            <option value="1h">LAST 1 HOUR</option>
            <option value="6h">LAST 6 HOURS</option>
            <option value="24h">LAST 24 HOURS</option>
            <option value="7d">LAST 7 DAYS</option>
          </select>

          {/* Live Auto Refresh toggle and Progress Circle */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-8 text-xs font-mono">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded text-brand-cyan focus:ring-brand-cyan"
              />
              <span className="text-[10px] font-bold text-slate-500 uppercase">AUTO-TICK</span>
            </label>
            {autoRefresh && (
              <span className="text-[10px] text-brand-cyan font-bold bg-brand-cyan/10 px-1.5 py-0.5 rounded ml-1 animate-pulse">
                {refreshCountdown}s
              </span>
            )}
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={() => triggerRefresh(false)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 h-8 px-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-[#0F172A] rounded-lg text-[11px] font-mono font-bold uppercase cursor-pointer transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? "animate-spin text-brand-cyan" : ""}`} />
            <span>Sync</span>
          </button>

          {/* Logs Drawer Trigger */}
          <button
            onClick={() => {
              setLogsService("All");
              setShowLogsDrawer(true);
            }}
            className="flex items-center gap-1.5 h-8 px-3 bg-brand-navy hover:bg-black text-white rounded-lg text-[11px] font-mono font-bold uppercase cursor-pointer transition-all shadow-xs"
          >
            <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Raw Logs</span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR (Filters services, incidents, nodes) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2.5 shadow-2xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Instant filter diagnostics by service, metrics, hosts, or tenants..."
          className="bg-transparent border-none outline-none text-xs text-slate-700 w-full font-medium"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. EXECUTIVE SUMMARY ROW (8 KPI CARDS WITH SPARKLY MINI-CHARTS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3" id="kpi-row-group">
        
        {/* Card 1: Platform Uptime */}
        <button 
          onClick={() => jumpToSection("historical-timeline-section")}
          className="bg-white border border-slate-200 hover:border-brand-cyan p-3 rounded-xl flex flex-col justify-between text-left transition-all hover:shadow-xs group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">Uptime (24h)</span>
              <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-cyan" />
            </div>
            <p className="text-lg font-black text-[#0F172A] font-outfit mt-1">99.96%</p>
            <p className="text-[9px] text-emerald-600 font-mono font-bold mt-0.5 flex items-center">
              <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> +0.02%
            </p>
          </div>
          {/* Sparkline SVG */}
          <div className="h-6 mt-2 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 24">
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="1.5"
                points="0,18 9,20 18,12 27,15 36,10 45,14 54,8 63,12 72,5 81,10 90,2 100,2"
              />
            </svg>
          </div>
        </button>

        {/* Card 2: Active Incidents */}
        <button 
          onClick={() => jumpToSection("incident-management-section")}
          className="bg-white border border-slate-200 hover:border-brand-cyan p-3 rounded-xl flex flex-col justify-between text-left transition-all hover:shadow-xs group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">Incidents</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-lg font-black text-amber-600 font-outfit mt-1">2 Active</p>
            <p className="text-[9px] text-amber-600 font-mono font-bold mt-0.5 flex items-center">
              <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" /> -1 vs yesterday
            </p>
          </div>
          <div className="h-6 mt-2 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 24">
              <polyline fill="none" stroke="#F59E0B" strokeWidth="1.5" points="0,5 15,5 30,18 45,18 60,5 75,5 90,20 100,20" />
            </svg>
          </div>
        </button>

        {/* Card 3: API Error Rate */}
        <button 
          onClick={() => { setMetricTab("traffic"); jumpToSection("resource-metrics-section"); }}
          className="bg-white border border-slate-200 hover:border-brand-cyan p-3 rounded-xl flex flex-col justify-between text-left transition-all hover:shadow-xs group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">Error Rate</span>
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-lg font-black text-[#0F172A] font-outfit mt-1">0.04%</p>
            <p className="text-[9px] text-emerald-600 font-mono font-bold mt-0.5 flex items-center">
              <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" /> -0.01%
            </p>
          </div>
          <div className="h-6 mt-2 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 24">
              <polyline fill="none" stroke="#10B981" strokeWidth="1.5" points="0,5 15,12 30,3 45,18 60,10 75,14 90,2 100,1" />
            </svg>
          </div>
        </button>

        {/* Card 4: p95 Latency */}
        <button 
          onClick={() => { setMetricTab("traffic"); jumpToSection("resource-metrics-section"); }}
          className="bg-white border border-slate-200 hover:border-brand-cyan p-3 rounded-xl flex flex-col justify-between text-left transition-all hover:shadow-xs group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">p95 Latency</span>
              <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-cyan" />
            </div>
            <p className="text-lg font-black text-[#0F172A] font-outfit mt-1">184ms</p>
            <p className="text-[9px] text-amber-600 font-mono font-bold mt-0.5 flex items-center">
              <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> +5ms deviation
            </p>
          </div>
          <div className="h-6 mt-2 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 24">
              <polyline fill="none" stroke="#3B82F6" strokeWidth="1.5" points="0,15 15,10 30,12 45,6 60,18 75,14 90,20 100,22" />
            </svg>
          </div>
        </button>

        {/* Card 5: CPU Load */}
        <button 
          onClick={() => { setMetricTab("resources"); jumpToSection("resource-metrics-section"); }}
          className="bg-white border border-slate-200 hover:border-brand-cyan p-3 rounded-xl flex flex-col justify-between text-left transition-all hover:shadow-xs group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">Cluster CPU</span>
              <Cpu className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-cyan" />
            </div>
            <p className="text-lg font-black text-[#0F172A] font-outfit mt-1">42%</p>
            <p className="text-[9px] text-slate-500 font-mono mt-0.5">Stable baseline</p>
          </div>
          <div className="h-6 mt-2 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 24">
              <polyline fill="none" stroke="#0F172A" strokeWidth="1.5" points="0,18 15,15 30,20 45,10 60,8 75,12 90,14 100,10" />
            </svg>
          </div>
        </button>

        {/* Card 6: RAM Footprint */}
        <button 
          onClick={() => { setMetricTab("resources"); jumpToSection("resource-metrics-section"); }}
          className="bg-white border border-slate-200 hover:border-brand-cyan p-3 rounded-xl flex flex-col justify-between text-left transition-all hover:shadow-xs group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">Cluster RAM</span>
              <Database className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-cyan" />
            </div>
            <p className="text-lg font-black text-[#0F172A] font-outfit mt-1">5.12 GB</p>
            <p className="text-[9px] text-amber-500 font-mono font-bold mt-0.5 flex items-center">
              <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> +0.2 GB alloc
            </p>
          </div>
          <div className="h-6 mt-2 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 24">
              <polyline fill="none" stroke="#6366F1" strokeWidth="1.5" points="0,20 15,18 30,16 45,12 60,10 75,8 90,5 100,4" />
            </svg>
          </div>
        </button>

        {/* Card 7: Disk Space */}
        <button 
          onClick={() => { setMetricTab("resources"); jumpToSection("resource-metrics-section"); }}
          className="bg-white border border-slate-200 hover:border-brand-cyan p-3 rounded-xl flex flex-col justify-between text-left transition-all hover:shadow-xs group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">Storage Disk</span>
              <HardDrive className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-cyan" />
            </div>
            <p className="text-lg font-black text-[#0F172A] font-outfit mt-1">68.4%</p>
            <p className="text-[9px] text-slate-500 font-mono mt-0.5">2.4 TB remaining</p>
          </div>
          <div className="h-6 mt-2 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 24">
              <polyline fill="none" stroke="#64748B" strokeWidth="1.5" points="0,15 20,15 40,14 60,14 80,13 100,13" />
            </svg>
          </div>
        </button>

        {/* Card 8: Queue Depth */}
        <button 
          onClick={() => { setMetricTab("database"); jumpToSection("resource-metrics-section"); }}
          className="bg-white border border-slate-200 hover:border-brand-cyan p-3 rounded-xl flex flex-col justify-between text-left transition-all hover:shadow-xs group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">Queue Lag</span>
              <Layers className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-cyan" />
            </div>
            <p className="text-lg font-black text-[#0F172A] font-outfit mt-1">24 msg</p>
            <p className="text-[9px] text-rose-500 font-mono font-bold mt-0.5 flex items-center">
              <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> High backlog
            </p>
          </div>
          <div className="h-6 mt-2 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 100 24">
              <polyline fill="none" stroke="#EF4444" strokeWidth="1.5" points="0,2 15,2 30,10 45,18 60,20 75,22 90,22 100,24" />
            </svg>
          </div>
        </button>

      </div>

      {/* 3. PLATFORM STATUS SUMMARY PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Summary Block */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-brand-navy text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-cyan" />
              <span className="text-[10px] font-mono font-bold text-brand-cyan uppercase tracking-wider">Active Platform Diagnostics</span>
            </div>

            <h2 className="text-xl md:text-2xl font-black font-outfit mt-3 leading-tight">
              Microservices running with minor warnings on bulk processors.
            </h2>
            <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
              Active load limits are stable. A temporary backlog in the <strong className="text-amber-300">worker-queue</strong> is currently throttled as compliance documents are bulk-verified. Automatic horizontal pods have scaled.
            </p>

            <div className="grid grid-cols-3 gap-4 mt-6 max-w-md">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Healthy Services</span>
                <p className="text-xl font-bold font-outfit mt-0.5 text-emerald-400">9 / 11</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Total Warnings</span>
                <p className="text-xl font-bold font-outfit mt-0.5 text-amber-400">2 Active</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">SLA Impact</span>
                <p className="text-xl font-bold font-outfit mt-0.5 text-brand-cyan">0.02% affected</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10 pt-5 mt-6">
            <div className="text-[11px] font-mono text-slate-300">
              <span className="text-amber-400 font-bold">Top affected:</span> webhook-engine, worker-queue
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => jumpToSection("incident-management-section")}
                className="h-8 px-3.5 bg-brand-cyan hover:bg-white text-brand-navy hover:text-black font-bold rounded-lg text-[10px] font-mono uppercase transition-all cursor-pointer"
              >
                Triage Incidents
              </button>
              <button
                onClick={handleRunSweep}
                disabled={diagnosticSweeping}
                className="h-8 px-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-[10px] font-mono uppercase transition-all border border-white/15 cursor-pointer flex items-center gap-1"
              >
                {diagnosticSweeping ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-brand-cyan" />
                    <span>Sweeping ({sweepProgress}%)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-brand-cyan" />
                    <span>Run Diagnostics Sweep</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Active Diagnostic Logs Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-outfit text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-slate-500" />
                <span>Live Event Stream</span>
              </h3>
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isLiveTailing ? "bg-emerald-500 animate-ping" : "bg-slate-300"}`}></span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">TAIL</span>
                <input
                  type="checkbox"
                  checked={isLiveTailing}
                  onChange={(e) => setIsLiveTailing(e.target.checked)}
                  className="rounded text-brand-cyan focus:ring-brand-cyan ml-1"
                />
              </div>
            </div>

            {/* Sweep logs display if running, else system logs */}
            {diagnosticSweeping ? (
              <div className="mt-3.5 space-y-2 text-[10px] font-mono bg-slate-900 text-brand-cyan p-4 rounded-xl h-44 overflow-y-auto">
                <p className="text-white/60">*** DIAGNOSTICS DEPLOYED ***</p>
                {sweepLogs.map((log, idx) => (
                  <p key={idx} className="leading-relaxed">
                    &gt; {log}
                  </p>
                ))}
              </div>
            ) : (
              <div className="mt-3.5 space-y-2 max-h-44 overflow-y-auto font-mono text-[10px]">
                {logs.slice(-5).map((log) => (
                  <div key={log.id} className="flex items-start gap-1.5 p-1 rounded hover:bg-slate-50">
                    <span className="text-slate-400 shrink-0">{log.timestamp}</span>
                    <span className={`font-bold shrink-0 ${
                      log.severity === "Critical" || log.severity === "Error" 
                        ? "text-rose-600" 
                        : log.severity === "Warning" 
                          ? "text-amber-500" 
                          : "text-blue-500"
                    }`}>
                      [{log.severity.slice(0, 3).toUpperCase()}]
                    </span>
                    <span className="text-slate-700 font-semibold truncate shrink-0 max-w-[80px]">{log.service}:</span>
                    <span className="text-slate-500 truncate">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Stored Logs Buffer: {logs.length}/50</span>
            <button
              onClick={() => {
                setLogsSeverity("All");
                setLogsService("All");
                setShowLogsDrawer(true);
              }}
              className="text-[10px] font-mono font-bold text-brand-cyan hover:text-brand-navy hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect All Event Logs</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. SERVICE HEALTH GRID */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs" id="service-health-grid-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-outfit text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Server className="w-5 h-5 text-brand-cyan" />
              <span>SaaS Microservices Status</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Individual monitoring modules reporting latency, heap load, and inter-service system integrity.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 border border-slate-200 px-2.5 py-1 rounded font-bold text-slate-600">
            {filteredServices.length} SERVICES MONITORED
          </span>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
          {filteredServices.map((service) => {
            const isSelected = selectedService?.id === service.id;
            return (
              <div 
                key={service.id} 
                className={`border rounded-xl p-4 transition-all flex flex-col justify-between ${
                  isSelected 
                    ? "ring-2 ring-brand-cyan bg-slate-50/50 border-brand-cyan" 
                    : service.status === "Warning" 
                      ? "border-amber-200 bg-amber-50/20 hover:bg-amber-50/40" 
                      : service.status === "Critical" 
                        ? "border-rose-200 bg-rose-50/20 hover:bg-rose-50/40 animate-pulse"
                        : "border-slate-200 bg-white hover:bg-slate-50/30 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A] font-outfit">{service.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{service.host}</span>
                    </div>
                    
                    {/* Severity pill */}
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border uppercase ${
                      service.status === "Healthy" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                        : service.status === "Warning" 
                          ? "bg-amber-50 text-amber-700 border-amber-100" 
                          : service.status === "Maintenance"
                            ? "bg-blue-50 text-blue-700 border-blue-100 animate-pulse"
                            : "bg-rose-50 text-rose-700 border-rose-100"
                    }`}>
                      {service.status}
                    </span>
                  </div>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5">
                      <span className="text-[8px] text-slate-400 font-mono font-bold block uppercase">Uptime</span>
                      <span className="text-xs font-bold text-slate-700 font-mono">{service.uptime}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5">
                      <span className="text-[8px] text-slate-400 font-mono font-bold block uppercase">Latency</span>
                      <span className="text-xs font-bold text-slate-700 font-mono">{service.responseTime}ms</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5">
                      <span className="text-[8px] text-slate-400 font-mono font-bold block uppercase">Errors</span>
                      <span className={`text-xs font-bold font-mono ${service.errorCount > 10 ? "text-rose-600" : "text-slate-700"}`}>
                        {service.errorCount}
                      </span>
                    </div>
                  </div>

                  {/* Extra specs */}
                  <div className="mt-3.5 space-y-1.5 text-[10px] text-slate-500 font-medium">
                    <div className="flex justify-between">
                      <span>Heap RAM Usage:</span>
                      <span className="font-mono font-bold text-slate-700">{service.memory} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Core CPU Load:</span>
                      <span className="font-mono font-bold text-slate-700">{service.cpu}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Module Release:</span>
                      <span className="font-mono font-bold text-slate-600">{service.version}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-dashed border-slate-200 mt-1.5">
                      <span>Depends on:</span>
                      <span className="text-[9px] font-mono text-slate-400 truncate max-w-[140px]" title={service.dependencies.join(", ")}>
                        {service.dependencies.length > 0 ? service.dependencies.join(", ") : "None"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick actions row */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => {
                      setLogsService(service.name);
                      setLogsSeverity("All");
                      setShowLogsDrawer(true);
                    }}
                    className="flex-1 h-7 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded text-[10px] font-mono font-bold text-slate-600 uppercase transition-all cursor-pointer text-center"
                  >
                    Logs
                  </button>
                  <button
                    onClick={() => handleTestEndpoint(service)}
                    className="flex-1 h-7 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded text-[10px] font-mono font-bold text-slate-600 uppercase transition-all cursor-pointer text-center"
                  >
                    Probe
                  </button>
                  <button
                    onClick={() => handleRestartService(service)}
                    disabled={service.status === "Maintenance"}
                    className="flex-1 h-7 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded text-[10px] font-mono font-bold text-rose-600 uppercase transition-all cursor-pointer text-center disabled:opacity-50"
                  >
                    Reboot
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Testing Modal Drawer */}
        <AnimatePresence>
          {testingEndpoint && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl text-slate-900"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold font-outfit text-[#0F172A] flex items-center gap-1.5">
                    <Activity className="w-5 h-5 text-brand-cyan" />
                    <span>Ping Analyzer probe: {testingEndpoint}</span>
                  </h3>
                  <button onClick={() => setTestingEndpoint(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Firing a diagnostics HTTP client payload into the internal VPC mesh to check latency, routing limits, and SSL Handshake buffers.
                  </p>

                  {!endpointResult ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-brand-cyan" />
                      <p className="text-xs font-mono font-bold text-slate-400 animate-pulse uppercase">TRANSMITTING TELEMETRY PROBE CODES...</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {/* Grid metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Response Code</span>
                          <p className={`text-lg font-black font-outfit ${endpointResult.statusCode === 200 ? "text-emerald-600" : "text-rose-600"}`}>
                            {endpointResult.statusCode} OK
                          </p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Target VPC IP</span>
                          <p className="text-sm font-bold font-mono text-slate-700">{endpointResult.ipAddress}</p>
                        </div>
                      </div>

                      {/* Diagnostic sequence timing */}
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-900 text-white font-mono text-xs space-y-2">
                        <p className="text-brand-cyan font-bold border-b border-white/10 pb-1.5 uppercase text-[10px]">Mesh Connection Timing Trace</p>
                        <div className="flex justify-between text-slate-300">
                          <span>1. VPC DNS Resolution</span>
                          <span>{endpointResult.dnsLookup}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>2. TCP Sockets Handshake</span>
                          <span>{endpointResult.tcpConnect}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>3. TLS/SSL Verification</span>
                          <span>{endpointResult.tlsHandshake}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>4. Time to First Byte (TTFB)</span>
                          <span>{endpointResult.ttfb}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>5. Network Data Transfer</span>
                          <span>{endpointResult.transferTime}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-1.5 text-white font-bold">
                          <span>Total Response Pipeline</span>
                          <span className="text-brand-cyan">{endpointResult.totalTime}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setTestingEndpoint(null)}
                    className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-bold rounded-lg cursor-pointer transition-all"
                  >
                    Dismiss Probe
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. INTERACTIVE RESOURCE METRICS PANEL (WITH CHARTS & THRESHOLDS) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs" id="resource-metrics-section">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-outfit text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-cyan" />
              <span>Diagnostic Metric Visualizer</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live graphing suite with custom comparison thresholds and real-time p95 latency alerts.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs gap-1">
            <button
              onClick={() => setMetricTab("resources")}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                metricTab === "resources" ? "bg-white text-[#0F172A] shadow-xs" : "text-slate-500 hover:text-[#0F172A]"
              }`}
            >
              CPU / RAM Allocations
            </button>
            <button
              onClick={() => setMetricTab("database")}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                metricTab === "database" ? "bg-white text-[#0F172A] shadow-xs" : "text-slate-500 hover:text-[#0F172A]"
              }`}
            >
              Postgres / Redis Threads
            </button>
            <button
              onClick={() => setMetricTab("traffic")}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                metricTab === "traffic" ? "bg-white text-[#0F172A] shadow-xs" : "text-slate-500 hover:text-[#0F172A]"
              }`}
            >
              Traffic & Latency
            </button>
          </div>
        </div>

        {/* Mini settings bar */}
        <div className="flex items-center justify-between gap-4 py-3 bg-slate-50 px-4 rounded-xl mt-4 border border-slate-150 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-500">Metric Selected:</span>
            <span className="font-bold text-brand-navy uppercase">{metricTab === "resources" ? "Container CPU/RAM Footprint" : metricTab === "database" ? "SQL Pool Locks & Queue Depth" : "Mesh Traffic & p95 Latency"}</span>
          </div>

          <label className="flex items-center gap-1.5 font-mono cursor-pointer select-none">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
              className="rounded text-brand-cyan focus:ring-brand-cyan"
            />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Compare with Yesterday</span>
          </label>
        </div>

        {/* Core Chart Body */}
        <div className="h-72 mt-5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metricChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="compareGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} className="font-mono" />
              <YAxis stroke="#94A3B8" fontSize={9} className="font-mono" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0F172A", border: "none", borderRadius: "12px", color: "#F8FAFC" }}
                itemStyle={{ color: "#38BDF8" }}
              />
              <Area 
                name="Current Period" 
                type="monotone" 
                dataKey="currentValue" 
                stroke="#3B82F6" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#currentGradient)" 
              />
              {compareMode && (
                <Area 
                  name="Yesterday (Offset)" 
                  type="monotone" 
                  dataKey="compareValue" 
                  stroke="#94A3B8" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4" 
                  fillOpacity={0.5} 
                  fill="url(#compareGradient)" 
                />
              )}
              {metricTab === "resources" && (
                <ReferenceLine y={80} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'CRITICAL THRESHOLD (80%)', fill: '#EF4444', fontSize: 9, position: "top" }} />
              )}
              {metricTab === "database" && (
                <ReferenceLine y={70} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'WARNING POOL LIMIT (70)', fill: '#F59E0B', fontSize: 9, position: "top" }} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. INCIDENT MANAGEMENT PANEL */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs" id="incident-management-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-outfit text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Operational Incident Control Room</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Triage active platform-level incident alarms, dispatch team members, and log live notes.
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex items-center gap-1.5">
            {(["All", "Active", "Resolved"] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveIncidentFilter(f)}
                className={`px-3 h-7 rounded-md font-mono text-[10px] font-bold border cursor-pointer uppercase transition-all ${
                  activeIncidentFilter === f
                    ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Incident Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs text-left text-slate-500 font-medium">
            <thead className="bg-slate-50 font-mono text-[9px] text-slate-400 border-b border-slate-200 uppercase">
              <tr>
                <th className="p-3">Incident ID</th>
                <th className="p-3">Title / Core Problem</th>
                <th className="p-3">Impacted Module</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Start Time</th>
                <th className="p-3">Assigned Owner</th>
                <th className="p-3">Current Status</th>
                <th className="p-3 text-right">Triage Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#0F172A]" id="incident-table-rows">
              {filteredIncidents.filter(inc => {
                if (activeIncidentFilter === "Active") return inc.status !== "Resolved";
                if (activeIncidentFilter === "Resolved") return inc.status === "Resolved";
                return true;
              }).map((inc) => (
                <React.Fragment key={inc.id}>
                  <tr className={`hover:bg-slate-50/40 transition-all ${inc.status !== "Resolved" ? "bg-amber-50/10" : ""}`}>
                    <td className="p-3 font-mono font-bold text-slate-400">{inc.id}</td>
                    <td className="p-3 max-w-[280px]">
                      <p className="font-bold text-[#0F172A]">{inc.title}</p>
                      <button
                        onClick={() => setSelectedIncident(selectedIncident?.id === inc.id ? null : inc)}
                        className="text-[10px] font-mono font-bold text-brand-cyan hover:underline mt-1 cursor-pointer flex items-center gap-0.5"
                      >
                        {selectedIncident?.id === inc.id ? "Collapse Diagnostics" : `Inspect Timeline (${inc.notes.length} logs)`}
                        <ChevronDown className={`w-3 h-3 transition-transform ${selectedIncident?.id === inc.id ? "rotate-180" : ""}`} />
                      </button>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{inc.impactedService}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border uppercase ${
                        inc.severity === "Critical" 
                          ? "bg-rose-50 text-rose-700 border-rose-100 animate-pulse" 
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-500">{new Date(inc.startTime).toLocaleTimeString()}</td>
                    <td className="p-3 font-bold text-slate-700">{inc.owner}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold text-brand-navy bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {inc.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {inc.status !== "Resolved" ? (
                        <>
                          {inc.status === "Unassigned" && (
                            <button
                              onClick={() => handleIncidentAction(inc.id, "Acknowledge")}
                              className="h-7 px-2.5 bg-[#0F172A] hover:bg-black text-white text-[10px] font-mono font-bold rounded cursor-pointer"
                            >
                              ACK
                            </button>
                          )}
                          {inc.status !== "Unassigned" && (
                            <button
                              onClick={() => handleIncidentAction(inc.id, "Resolve")}
                              className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-mono font-bold rounded cursor-pointer"
                            >
                              RESOLVE
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">RESOLVED</span>
                      )}
                    </td>
                  </tr>

                  {/* Expanded timeline view */}
                  {selectedIncident?.id === inc.id && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={8} className="p-4 border-t border-b border-slate-200">
                        <div className="max-w-2xl space-y-3 font-mono text-[11px] text-slate-600">
                          <p className="font-bold uppercase text-slate-400 text-[10px] tracking-wide border-b border-slate-200 pb-1">Incident Runbook / Diagnostic History</p>
                          <div className="space-y-2 border-l border-slate-200 pl-3">
                            {inc.notes.map((note, noteIdx) => (
                              <div key={noteIdx} className="relative">
                                <span className="absolute -left-[16px] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                <p className="leading-relaxed">{note}</p>
                              </div>
                            ))}
                          </div>

                          {/* Add a diagnostic note */}
                          {inc.status !== "Resolved" && (
                            <div className="mt-3.5 flex items-center gap-2">
                              <input
                                type="text"
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                placeholder="Log investigation update message..."
                                className="flex-1 h-8 rounded border border-slate-200 bg-white px-2 text-[10px] focus:outline-none"
                              />
                              <button
                                onClick={() => handleAddIncidentNote(inc.id)}
                                className="h-8 px-3 bg-[#0F172A] hover:bg-black text-white text-[10px] font-bold rounded cursor-pointer uppercase"
                              >
                                Add log
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. DEPENDENCY MAP & TIMELINE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Dependency Map Component */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs" id="dependency-map-section">
          <div>
            <h3 className="font-outfit text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
              <Network className="w-4 h-4 text-slate-500" />
              <span>Microservices Dependency Mesh</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Interactive node topography mapping inter-service calls. Red lines flag active cascade failures.
            </p>
          </div>

          {/* Graph visual area (SVG) */}
          <div className="relative border border-slate-100 rounded-xl bg-slate-900 h-64 mt-4 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                </marker>
                <marker id="arrow-warn" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#F59E0B" />
                </marker>
              </defs>

              {/* Connections (Lines) */}
              <g opacity="0.8">
                {/* Frontend -> API */}
                <line x1="60" y1="120" x2="160" y2="120" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />
                
                {/* API -> Auth */}
                <line x1="160" y1="120" x2="260" y2="50" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />
                
                {/* API -> Postgres */}
                <line x1="160" y1="120" x2="260" y2="190" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />
                
                {/* API -> Redis */}
                <line x1="160" y1="120" x2="260" y2="120" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />
                
                {/* API -> Worker (Warning path) */}
                <line x1="160" y1="120" x2="360" y2="120" stroke="#F59E0B" strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#arrow-warn)" className="animate-pulse" />
                
                {/* Worker -> Redis */}
                <line x1="360" y1="120" x2="260" y2="120" stroke="#F59E0B" strokeWidth="1.5" markerEnd="url(#arrow-warn)" />
                
                {/* Webhooks -> Postgres */}
                <line x1="360" y1="50" x2="260" y2="190" stroke="#475569" strokeWidth="1" markerEnd="url(#arrow)" />
              </g>
            </svg>

            {/* Nodes placed via coordinate placement absolute */}
            {/* Frontend Node */}
            <div 
              style={{ left: "20px", top: "100px" }} 
              className="absolute bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-white font-mono text-[10px] font-bold shadow-md cursor-pointer hover:border-brand-cyan transition-all"
              onMouseEnter={() => setHoveredNode("Frontend")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>frontend</span>
              </div>
            </div>

            {/* API Gateway Node */}
            <div 
              style={{ left: "120px", top: "100px" }} 
              className="absolute bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-white font-mono text-[10px] font-bold shadow-md cursor-pointer hover:border-brand-cyan transition-all"
              onMouseEnter={() => setHoveredNode("API")}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>api-gateway</span>
              </div>
            </div>

            {/* Auth Service Node */}
            <div 
              style={{ left: "220px", top: "30px" }} 
              className="absolute bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-white font-mono text-[10px] font-bold shadow-md cursor-pointer hover:border-brand-cyan transition-all"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>auth-service</span>
              </div>
            </div>

            {/* Redis Cache Node */}
            <div 
              style={{ left: "220px", top: "100px" }} 
              className="absolute bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-white font-mono text-[10px] font-bold shadow-md cursor-pointer hover:border-brand-cyan transition-all"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>redis-cache</span>
              </div>
            </div>

            {/* PostgreSQL DB Node */}
            <div 
              style={{ left: "210px", top: "170px" }} 
              className="absolute bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-white font-mono text-[10px] font-bold shadow-md cursor-pointer hover:border-brand-cyan transition-all"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>postgres-db</span>
              </div>
            </div>

            {/* Worker Queue Node */}
            <div 
              style={{ left: "320px", top: "100px" }} 
              className="absolute bg-slate-800 border border-amber-500 px-3 py-1.5 rounded-lg text-white font-mono text-[10px] font-bold shadow-md cursor-pointer hover:border-brand-cyan transition-all animate-pulse"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                <span>worker-queue</span>
              </div>
            </div>

            {/* Webhook Node */}
            <div 
              style={{ left: "320px", top: "30px" }} 
              className="absolute bg-slate-800 border border-amber-500 px-3 py-1.5 rounded-lg text-white font-mono text-[10px] font-bold shadow-md cursor-pointer hover:border-brand-cyan transition-all"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                <span>webhooks</span>
              </div>
            </div>

            {/* Dynamic Status Display Box */}
            <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 border border-white/10 rounded-lg p-2 text-[9px] font-mono text-slate-400 flex justify-between items-center">
              <span>{hoveredNode ? `Focused link: ${hoveredNode} API route bindings` : "Hover nodes to analyze cascading SLA delays"}</span>
              <span className="text-amber-400 font-bold">1 active bottleneck: worker-queue</span>
            </div>
          </div>
        </div>

        {/* Historical Timeline Timeline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs" id="historical-timeline-section">
          <div>
            <h3 className="font-outfit text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Diagnostic Timeline & deployments</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Outages, recurring alert conditions, and deployment events over past 30 days.
            </p>
          </div>

          <div className="mt-4 space-y-4 max-h-64 overflow-y-auto pr-2">
            
            {/* Event 1 */}
            <div className="relative pl-5 border-l-2 border-brand-cyan/30">
              <span className="absolute -left-1.5 top-1.5 w-3.5 h-3.5 bg-brand-cyan/25 border-2 border-brand-cyan rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full"></span>
              </span>
              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
                <span>JULY 8, 2026 - 04:30 AM</span>
                <span className="text-emerald-600 uppercase">DEPLOYMENT APPROVED</span>
              </div>
              <h4 className="text-xs font-bold text-brand-navy mt-1">Superadmin Version v4.12.2 Applied</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                Deployed minor hotfix to reduce websocket memory leaks on idle browser tabs. Code verification and checksum verified.
              </p>
            </div>

            {/* Event 2 */}
            <div className="relative pl-5 border-l-2 border-amber-300/30">
              <span className="absolute -left-1.5 top-1.5 w-3.5 h-3.5 bg-amber-200 border-2 border-amber-500 rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              </span>
              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
                <span>JULY 7, 2026 - 11:15 PM</span>
                <span className="text-amber-600 uppercase">DEGRADED OPERATION</span>
              </div>
              <h4 className="text-xs font-bold text-brand-navy mt-1">Stripe Webhook Gateway Timeout Recovery</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                Stripe webhook engine experienced transient 504 gateway response timeouts due to a Cloud DNS routing delay. System recovered automatically after 45m.
              </p>
            </div>

            {/* Event 3 */}
            <div className="relative pl-5 border-l-2 border-slate-200">
              <span className="absolute -left-1.5 top-1.5 w-3.5 h-3.5 bg-slate-100 border-2 border-slate-400 rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
              </span>
              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
                <span>JUNE 29, 2026 - 02:00 PM</span>
                <span className="text-slate-500 uppercase">SCHEDULED MAINTENANCE</span>
              </div>
              <h4 className="text-xs font-bold text-brand-navy mt-1">Primary DB Major Engine Pruning</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                PostgreSQL primary db engine storage vacuumed. Cleared obsolete transaction records to preserve target SLAs. Uptime remained continuous via secondary read-replicas.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* 8. ALERT POLICY ENGINE & THRESHOLD CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs" id="alert-policy-engine-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-outfit text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-600" />
              <span>Operational Telemetry Alert Rules</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Specify active threshold alerts. Unmuted rules automatically trigger administrative Slack and PagerDuty channels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestAlertSignal}
              className="h-8 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg text-[10px] font-mono uppercase transition-all border border-rose-100 cursor-pointer"
            >
              Test Alert Dispatch
            </button>
            <button
              onClick={() => setShowAddAlert(!showAddAlert)}
              className="h-8 px-3.5 bg-brand-navy hover:bg-black text-white font-bold rounded-lg text-[10px] font-mono uppercase transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Define Alert Rule</span>
            </button>
          </div>
        </div>

        {/* Add Alert form */}
        <AnimatePresence>
          {showAddAlert && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-slate-100 bg-slate-50 rounded-xl mt-4 p-4 border border-slate-200"
            >
              <h4 className="text-xs font-bold font-mono text-[#0F172A] uppercase">Define New VPC Alert Rule</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-3 text-xs font-medium text-slate-700">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Telemetry Metric</label>
                  <select
                    value={newRuleMetric}
                    onChange={(e) => setNewRuleMetric(e.target.value)}
                    className="w-full h-8 rounded border border-slate-200 bg-white px-2"
                  >
                    <option>CPU Utilization</option>
                    <option>Memory Footprint</option>
                    <option>p95 Latency</option>
                    <option>API Error Rate</option>
                    <option>Queue Depth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Target Microservice</label>
                  <select
                    value={newRuleService}
                    onChange={(e) => setNewRuleService(e.target.value)}
                    className="w-full h-8 rounded border border-slate-200 bg-white px-2"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Condition Threshold</label>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={newRuleOperator}
                      onChange={(e) => setNewRuleOperator(e.target.value)}
                      className="w-16 h-8 rounded border border-slate-200 bg-white px-2"
                    >
                      <option>&gt;</option>
                      <option>&lt;</option>
                      <option>=</option>
                    </select>
                    <input
                      type="number"
                      value={newRuleThreshold}
                      onChange={(e) => setNewRuleThreshold(parseFloat(e.target.value))}
                      className="w-full h-8 rounded border border-slate-200 bg-white px-2"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleCreateAlertRule}
                    className="w-full h-8 bg-brand-cyan hover:bg-brand-navy text-white hover:text-white font-mono font-bold text-[10px] rounded uppercase cursor-pointer transition-all"
                  >
                    Save Rule
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alert rules listing */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
          {alertRules.map((rule) => (
            <div key={rule.id} className="border border-slate-200 rounded-xl p-4 bg-white hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">{rule.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border uppercase ${
                    rule.isMuted 
                      ? "bg-slate-100 text-slate-400 border-slate-200" 
                      : "bg-emerald-50 text-emerald-700 border-emerald-100"
                  }`}>
                    {rule.isMuted ? "MUTED" : "ACTIVE"}
                  </span>
                </div>

                <div className="mt-3.5 space-y-1.5 text-xs">
                  <p className="font-bold text-brand-navy">{rule.metric}</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Trigger alert if metric <strong className="text-[#0F172A]">{rule.operator} {rule.threshold}</strong> persists for {rule.duration} on <strong className="text-brand-cyan">{rule.service}</strong>.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => toggleMuteRule(rule.id)}
                  className={`flex-1 h-7 rounded text-[10px] font-mono font-bold uppercase border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    rule.isMuted 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {rule.isMuted ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                  <span>{rule.isMuted ? "Unmute" : "Mute"}</span>
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="h-7 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-600 rounded text-[10px] font-mono font-bold uppercase cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. SLIDEOUT FULL LOGS DRAWER (WITH MULTI-FILTER STREAM) */}
      <AnimatePresence>
        {showLogsDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            {/* Backdrop click closer */}
            <div className="absolute inset-0" onClick={() => setShowLogsDrawer(false)}></div>

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col justify-between text-slate-900 border-l border-slate-200"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-outfit text-base font-bold text-[#0F172A] flex items-center gap-1.5">
                    <Terminal className="w-5 h-5 text-brand-cyan" />
                    <span>Raw JSON Systems Log Buffer</span>
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 font-bold uppercase mt-0.5">ADMIN SECURE VPC AUDIT PORT</p>
                </div>
                <button onClick={() => setShowLogsDrawer(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Advanced Filter Toolbar */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-semibold">
                
                {/* Search */}
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Regex Search</label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 h-8">
                    <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                    <input
                      type="text"
                      value={logsSearch}
                      onChange={(e) => setLogsSearch(e.target.value)}
                      placeholder="req-id, correlation..."
                      className="bg-transparent border-none outline-none text-[11px] w-full"
                    />
                  </div>
                </div>

                {/* Service Filter */}
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Microservice</label>
                  <select
                    value={logsService}
                    onChange={(e) => setLogsService(e.target.value)}
                    className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2 font-mono text-[10px] text-slate-600 cursor-pointer"
                  >
                    <option value="All">All Services</option>
                    <option value="API Gateway">API Gateway</option>
                    <option value="Worker Queue">Worker Queue</option>
                    <option value="Webhook Engine">Webhook Engine</option>
                    <option value="PostgreSQL DB">PostgreSQL DB</option>
                    <option value="Auth Service">Auth Service</option>
                    <option value="Frontend Portal">Frontend Portal</option>
                  </select>
                </div>

                {/* Severity Filter */}
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">SLA Severity</label>
                  <select
                    value={logsSeverity}
                    onChange={(e) => setLogsSeverity(e.target.value)}
                    className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2 font-mono text-[10px] text-slate-600 cursor-pointer"
                  >
                    <option value="All">All Levels</option>
                    <option value="Debug">Debug</option>
                    <option value="Info">Info</option>
                    <option value="Warning">Warning</option>
                    <option value="Error">Error</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {/* Sync Tailing */}
                <div className="flex flex-col justify-end">
                  <div className="flex items-center justify-between border border-slate-200 bg-white rounded-lg h-8 px-2 text-[10px] font-mono text-slate-500">
                    <span className="font-bold">LIVE STREAM</span>
                    <input
                      type="checkbox"
                      checked={isLiveTailing}
                      onChange={(e) => setIsLiveTailing(e.target.checked)}
                      className="rounded text-brand-cyan focus:ring-brand-cyan"
                    />
                  </div>
                </div>
              </div>

              {/* Logs Console Container */}
              <div ref={logContainerRef} className="flex-1 overflow-y-auto p-4 bg-slate-900 text-slate-200 font-mono text-[11px] space-y-2">
                {logsFilteredForDrawer.length === 0 ? (
                  <div className="py-24 text-center text-slate-500">
                    <AlertTriangle className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p>No telemetry traces match the active drawer filters.</p>
                  </div>
                ) : (
                  logsFilteredForDrawer.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">{log.timestamp}</span>
                          <span className={`px-1.5 py-0.2 rounded font-black text-[9px] uppercase ${
                            log.severity === "Critical" 
                              ? "bg-rose-500 text-white" 
                              : log.severity === "Error" 
                                ? "bg-rose-900 text-rose-200 border border-rose-700" 
                                : log.severity === "Warning" 
                                  ? "bg-amber-900 text-amber-200 border border-amber-700" 
                                  : "bg-blue-900 text-blue-200 border border-blue-700"
                          }`}>
                            {log.severity}
                          </span>
                          <span className="text-brand-cyan font-bold">{log.service}</span>
                          <span className="text-slate-500 font-medium">{log.host}</span>
                        </div>
                        <div className="text-slate-400 text-[9px]">
                          <span>Req: {log.requestId}</span>
                          <span className="mx-1">•</span>
                          <span>Corr: {log.correlationId}</span>
                        </div>
                      </div>
                      <p className="text-slate-300 leading-relaxed break-all font-semibold">{log.message}</p>
                      
                      {log.stackTrace && (
                        <pre className="text-[10px] text-rose-300/80 bg-black/40 p-2 rounded-md overflow-x-auto border border-rose-900/30 whitespace-pre-wrap leading-relaxed mt-1">
                          {log.stackTrace}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Status bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Displaying {logsFilteredForDrawer.length} of {logs.length} buffer packets</span>
                <button
                  onClick={() => setLogs(GENERATED_LOGS)}
                  className="text-brand-navy hover:underline font-bold text-[10px] uppercase cursor-pointer"
                >
                  Clear Buffer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
