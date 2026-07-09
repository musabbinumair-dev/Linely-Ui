import { motion } from "motion/react";
import { 
  Sparkles, 
  MessageSquare, 
  Phone, 
  Bell, 
  Calendar, 
  TrendingUp, 
  User, 
  CheckCircle2, 
  Layers, 
  Clock, 
  Smartphone,
  Check,
  Plus,
  Settings,
  ChevronRight,
  Shield,
  Play,
  Sliders,
  Users,
  Cpu
} from "lucide-react";

export default function WhyLinely() {
  return (
    <section
      id="why-linely"
      className="bg-[#0B0F2B] py-24 md:py-32 px-6 relative overflow-hidden"
    >
      {/* Premium ambient glows in dark background */}
      <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] bg-brand-cyan/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-16 relative z-10">
        
        {/* Section Headline */}
        <div className="max-w-3xl">
          {/* Eyebrow Label */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 text-brand-cyan font-rethink text-[10px] md:text-xs font-semibold uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-6 shadow-lg cursor-default select-none"
          >
            The Preferred Choice
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-boldonse text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.1] font-bold"
          >
            Why Linely is the preferred platform at <span className="text-brand-cyan">500+ locations</span> worldwide
          </motion.h2>
        </div>

        {/* 3 Tall Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
          {/* CARD 1 — Full width light card on top */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7 }}
            className="md:col-span-2 bg-[#FCF9F2] border border-[#EBE0CD] rounded-[32px] flex flex-col justify-between overflow-hidden min-h-[600px] md:h-[660px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_45px_80px_-20px_rgba(0,0,0,0.7)] transition-all duration-500 group"
          >
            {/* Top Text Content (35%) */}
            <div className="p-8 sm:p-12 flex flex-col items-start text-left max-w-2xl justify-center">
              <span className="font-rethink text-brand-ocean text-xs font-bold uppercase tracking-wider mb-2">
                Unified Operations
              </span>
              <h3 className="font-boldonse text-2xl sm:text-3xl text-brand-navy font-bold mb-3">
                One platform for walk-ins and appointments
              </h3>
              <p className="font-cabin text-slate-600 text-sm sm:text-base leading-relaxed">
                Connect calendars, check-in kiosks, and real-time walk-ins into a single workspace. Give your front-desk operators complete visibility and absolute control over visitor flow.
              </p>
              <a 
                href="#features" 
                className="font-rethink font-bold text-sm text-brand-ocean hover:text-brand-navy transition-colors duration-200 flex items-center gap-1.5 mt-4"
              >
                Learn more <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
              </a>
            </div>

            {/* Bottom Visual (65%) — Real Premium Operator Console mockup */}
            <div className="h-[60%] bg-[#080B1C] relative border-t border-[#EBE0CD]/20 flex overflow-hidden select-none">
              
              {/* Dashboard Left Sidebar */}
              <div className="w-[180px] hidden sm:flex flex-col bg-[#050714] border-r border-white/5 p-4 shrink-0">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-5 h-5 rounded-lg bg-brand-cyan flex items-center justify-center">
                    <span className="text-[10px] font-bold text-brand-navy">L</span>
                  </div>
                  <span className="text-white font-rethink text-xs font-bold tracking-wide">Linely Desk</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 text-brand-cyan text-xs font-semibold">
                    <Users size={12} />
                    <span>Live Queue</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 text-xs transition-colors">
                    <Calendar size={12} />
                    <span>Appointments</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 text-xs transition-colors">
                    <TrendingUp size={12} />
                    <span>Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 text-xs transition-colors">
                    <Settings size={12} />
                    <span>Config</span>
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-white text-[9px] font-bold">
                      OP
                    </div>
                    <div>
                      <div className="text-[10px] text-white font-semibold font-rethink">Agent-04</div>
                      <div className="text-[8px] text-emerald-400">Counter 1</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Main Console Panel */}
              <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
                {/* Console Header Bar */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <h4 className="text-white text-xs sm:text-sm font-semibold font-rethink">Active Waitlist</h4>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Counter 1 Online
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-[10px] text-white/60 font-mono">
                      Service: Support
                    </div>
                  </div>
                </div>

                {/* Queue Cards Grid */}
                <div className="flex flex-col gap-2.5 w-full overflow-y-auto pb-4 max-h-[175px] sm:max-h-[220px]">
                  
                  {/* Visitor 1 — Real looking ticket card */}
                  <div className="bg-[#111633] border border-white/10 hover:border-brand-cyan/30 rounded-xl p-3 flex items-center justify-between gap-4 transition-all duration-300 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-cyan/20 to-brand-cyan/5 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan font-bold text-xs">
                        DM
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-brand-cyan tracking-wider">GP-0107</span>
                          <span className="bg-amber-500/15 text-amber-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-amber-500/10">HIGH PRIORITY</span>
                        </div>
                        <h5 className="text-white text-xs font-semibold mt-0.5 font-rethink">David Müller</h5>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden xs:block">
                        <div className="text-[10px] text-white/40 font-rethink">Wait Time</div>
                        <div className="text-xs text-white/90 font-bold flex items-center gap-1 font-mono">
                          <Clock size={10} className="text-slate-400" /> 12m
                        </div>
                      </div>
                      <button className="bg-brand-cyan hover:bg-white text-brand-navy font-bold text-[11px] px-3.5 py-1.5 rounded-lg transition-colors shadow-sm">
                        Serve
                      </button>
                    </div>
                  </div>

                  {/* Visitor 2 — Real looking ticket card */}
                  <div className="bg-[#111633]/80 border border-white/5 hover:border-white/10 rounded-xl p-3 flex items-center justify-between gap-4 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                        HW
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-white/70 tracking-wider">AO-0264</span>
                          <span className="bg-blue-500/15 text-blue-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-blue-500/10">REGULAR</span>
                        </div>
                        <h5 className="text-white/95 text-xs font-semibold mt-0.5 font-rethink">Hina Waqar</h5>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden xs:block">
                        <div className="text-[10px] text-white/40 font-rethink">Wait Time</div>
                        <div className="text-xs text-white/80 font-bold flex items-center gap-1 font-mono">
                          <Clock size={10} /> 8m
                        </div>
                      </div>
                      <button className="bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-lg transition-colors">
                        Call
                      </button>
                    </div>
                  </div>

                  {/* Visitor 3 — Real looking ticket card */}
                  <div className="bg-[#111633]/50 border border-white/5 opacity-70 rounded-xl p-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/10 flex items-center justify-center text-rose-400 font-bold text-xs">
                        AN
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-white/50 tracking-wider">P-0118</span>
                          <span className="bg-rose-500/15 text-rose-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-rose-500/10">VIP Client</span>
                        </div>
                        <h5 className="text-white/80 text-xs font-semibold mt-0.5 font-rethink">Ayesha Noor</h5>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden xs:block">
                        <div className="text-[10px] text-white/30 font-rethink">Wait Time</div>
                        <div className="text-xs text-white/60 font-bold flex items-center gap-1 font-mono">
                          <Clock size={10} /> 4m
                        </div>
                      </div>
                      <button className="bg-white/5 text-white/40 font-bold text-[11px] px-3.5 py-1.5 rounded-lg cursor-not-allowed">
                        Call
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </motion.div>

          {/* CARD 2 — Dark card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="bg-[#131A3C] border border-white/10 rounded-[32px] flex flex-col justify-between overflow-hidden min-h-[560px] md:h-[600px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] hover:border-white/20 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] transition-all duration-500 group"
          >
            {/* Top Text Content (40%) */}
            <div className="p-8 sm:p-10 flex flex-col items-start text-left justify-center">
              <span className="font-rethink text-brand-cyan text-xs font-bold uppercase tracking-wider mb-2">
                Smart Automations
              </span>
              <h3 className="font-boldonse text-2xl text-white font-bold mb-3">
                Built-in AI and smart notifications
              </h3>
              <p className="font-cabin text-white/70 text-sm leading-relaxed">
                Connect your physical counters with WhatsApp, Twilio, and calendars. Build conditional message rules driven by Gemini AI that execute automatically on live arrivals.
              </p>
              <a 
                href="#features" 
                className="font-rethink font-bold text-sm text-brand-cyan hover:text-white transition-colors duration-200 flex items-center gap-1.5 mt-4"
              >
                Learn more <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
              </a>
            </div>

            {/* Bottom Visual (60%) — Premium Real Automation Control Panel Mockup */}
            <div className="h-[60%] bg-[#080B1C] relative border-t border-white/5 flex flex-col p-5 overflow-hidden select-none">
              
              {/* AI Trigger Node Flow representation */}
              <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                
                {/* Flow Step 1: Trigger */}
                <div className="bg-[#121735] border border-white/15 rounded-xl p-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Play size={14} className="fill-indigo-400/20" />
                    </div>
                    <div>
                      <div className="text-[9px] text-white/40 uppercase font-semibold font-mono">FLOW TRIGGER</div>
                      <div className="text-white text-xs font-bold font-rethink">Walk-in arrival registered</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">Active</span>
                </div>

                {/* Vertical Connector Line */}
                <div className="h-4 w-0.5 bg-gradient-to-b from-indigo-500 to-brand-cyan ml-6 opacity-60"></div>

                {/* Flow Step 2: AI Evaluation */}
                <div className="bg-[#121735] border border-brand-cyan/20 rounded-xl p-3 flex flex-col gap-2 shadow-lg relative">
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
                    <span className="text-[8px] text-brand-cyan font-bold font-mono">AI THINKING</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
                      <Cpu size={14} />
                    </div>
                    <div>
                      <div className="text-[9px] text-brand-cyan uppercase font-semibold font-mono">Gemini Intelligent Evaluator</div>
                      <div className="text-white text-xs font-bold font-rethink mt-0.5">Is predicted wait time &gt; 15 mins?</div>
                    </div>
                  </div>
                  <div className="bg-[#090C1A] border border-white/5 rounded-lg p-2 mt-1">
                    <div className="text-[9px] text-white/50 font-rethink leading-normal italic">
                      "Draft personalized SMS apology & offer VIP refreshment ticket"
                    </div>
                  </div>
                </div>

                {/* Vertical Connector Line */}
                <div className="h-4 w-0.5 bg-gradient-to-b from-brand-cyan to-emerald-400 ml-6 opacity-60"></div>

                {/* Flow Step 3: Outbound Channels status indicators */}
                <div className="bg-[#121735] border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <MessageSquare size={14} />
                    </div>
                    <div>
                      <div className="text-[9px] text-white/40 uppercase font-semibold font-mono">OUTBOUND CHANNEL</div>
                      <div className="text-white text-xs font-bold font-rethink">WhatsApp Notification Engine</div>
                    </div>
                  </div>
                  {/* Real Looking Premium Toggle Switch */}
                  <div className="w-8 h-4.5 bg-emerald-500 rounded-full p-0.5 flex items-center justify-end cursor-pointer">
                    <div className="w-3.5 h-3.5 bg-white rounded-full shadow"></div>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>

          {/* CARD 3 — Light card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-[#FCF9F2] border border-[#EBE0CD] rounded-[32px] flex flex-col justify-between overflow-hidden min-h-[560px] md:h-[600px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] transition-all duration-500 group"
          >
            {/* Top Text Content (40%) */}
            <div className="p-8 sm:p-10 flex flex-col items-start text-left justify-center">
              <span className="font-rethink text-brand-ocean text-xs font-bold uppercase tracking-wider mb-2">
                Frictionless Journey
              </span>
              <h3 className="font-boldonse text-2xl text-brand-navy font-bold mb-3">
                Effortless for operators and customers
              </h3>
              <p className="font-cabin text-slate-600 text-sm leading-relaxed">
                No complex apps or accounts to download. Customers join the line via secure SMS links or QR codes and get beautiful, live alerts on the go.
              </p>
              <a 
                href="#features" 
                className="font-rethink font-bold text-sm text-brand-ocean hover:text-brand-navy transition-colors duration-200 flex items-center gap-1.5 mt-4"
              >
                Learn more <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
              </a>
            </div>

            {/* Bottom Visual (60%) — WhatsApp notification bubble */}
            <div className="h-[60%] bg-[#E5DDD5] relative border-t border-[#EBE0CD]/20 flex flex-col p-6 overflow-hidden select-none">
              {/* WhatsApp UI Mockup */}
              <div className="w-full max-w-sm mx-auto flex flex-col gap-4 mt-2">
                {/* Header of Chat */}
                <div className="bg-white border border-slate-200/80 px-3.5 py-2.5 rounded-full flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-brand-navy flex items-center justify-center text-white text-[10px] font-bold font-boldonse">
                      L
                    </div>
                    <div>
                      <h4 className="text-slate-800 text-xs font-bold font-rethink">Linely Alerts</h4>
                      <span className="text-[9px] text-emerald-500 flex items-center gap-1 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Verified Business
                      </span>
                    </div>
                  </div>
                  <Smartphone size={14} className="text-slate-400" />
                </div>

                {/* Message 1 — Incoming from Linely */}
                <motion.div 
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white text-slate-800 rounded-2xl rounded-tl-none p-3.5 shadow-sm max-w-[85%] text-xs sm:text-sm leading-relaxed relative flex flex-col"
                >
                  <p className="font-cabin text-slate-700">
                    Hi Ahmed! Almost your turn at <span className="font-bold text-brand-navy">Counter 2</span>.
                  </p>
                  <div className="mt-1.5 bg-[#FAF6F0] p-2 rounded-xl border border-brand-cream/40 flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-brand-ocean">Token GP-0089</span>
                    <span className="text-[10px] text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full font-bold">2 people ahead</span>
                  </div>
                  <p className="font-cabin text-slate-700 mt-1.5">
                    Head back now ⏱️
                  </p>
                  <span className="text-[9px] text-slate-400 self-end mt-1">10:42 AM</span>
                </motion.div>

                {/* Message 2 — Outgoing reply from Ahmed */}
                <motion.div 
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.65 }}
                  className="bg-[#DCF8C6] text-slate-800 rounded-2xl rounded-tr-none p-3.5 shadow-sm max-w-[80%] text-xs sm:text-sm leading-relaxed ml-auto relative flex flex-col"
                >
                  <p className="font-cabin text-slate-800 font-medium font-rethink">
                    Thank you! On my way
                  </p>
                  <div className="flex items-center gap-1 self-end mt-1">
                    <span className="text-[9px] text-slate-500">10:43 AM</span>
                    <span className="text-sky-500 text-[10px] font-bold flex items-center">
                      <Check size={11} className="-mr-1.5" />
                      <Check size={11} />
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
