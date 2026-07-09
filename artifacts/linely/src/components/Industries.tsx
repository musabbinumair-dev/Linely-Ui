import { motion } from "motion/react";
import { Heart, ShoppingBag, Building2, Landmark, GraduationCap, Bed } from "lucide-react";

interface IndustriesProps {
  onOpenProduct?: (section?: string) => void;
}

export default function Industries({ onOpenProduct }: IndustriesProps = {}) {
  const industries = [
    {
      name: "Healthcare",
      description: "Manage patient arrivals, triage waitlists, and optimize clinical workflow.",
      icon: Heart,
      photo: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
      detailedProblem: "Linely transforms the patient arrival experience by digitizing waitlists and triaging workflows in real time. Instead of waiting in a crowded and stressful clinic reception room, patients check in via QR code or SMS and receive accurate wait times. Clinicians can prioritize urgent cases dynamically, while automated text alerts keep patients informed so they can step away until their provider is ready.",
      quote: "Linely completely revolutionized our clinic's patient flow. Lobby congestion has decreased by over 60%, and patients are significantly calmer when they sit down with our medical providers.",
      authorName: "Dr. Evelyn Marcus",
      authorRole: "Director of Clinic Operations",
    },
    {
      name: "Retail",
      description: "Transform long checkout queues into smooth virtual waitlists with updates.",
      icon: ShoppingBag,
      photo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
      detailedProblem: "Physical checkout queues are one of the primary drivers of store abandonment and lost revenue. Linely converts long physical lines into smooth virtual waitlists. Shoppers simply scan a QR code to join a digital checkout or support queue, letting them continue browsing the sales floor, drinking a coffee, or resting. This increases in-store dwell times, boosts the average basket size, and turns checkout friction into a premium, self-paced experience.",
      quote: "By letting customers browse our store instead of standing in checkout lines, we saw a direct 18% increase in average basket value. Our checkout friction is completely gone.",
      authorName: "Marcus Thorne",
      authorRole: "VP of Retail Experience",
    },
    {
      name: "Government",
      description: "Organize citizen check-ins, verify appointments, and reduce lobby crowds.",
      icon: Building2,
      photo: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
      detailedProblem: "Municipal service centers, DMVs, and citizen support lobbies are notoriously plagued by long wait times and crowded public halls. Linely introduces order by allowing citizens to check in remotely or at an in-lobby kiosk, selecting their precise service needs. Staff receive organized lists of citizens sorted by appointment or check-in order, minimizing lobby congestion and streamlining citizen throughput.",
      quote: "Handling morning citizen rushes was a major daily challenge. Linely smoothed out our service peaks, reduced lobby crowding, and gave our staff clear, structured triaging tools.",
      authorName: "Diana Reynolds",
      authorRole: "Chief of Municipal Services",
    },
    {
      name: "Banking",
      description: "Direct customers to the right advisors efficiently with automated queuing.",
      icon: Landmark,
      photo: "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?auto=format&fit=crop&w=800&q=80",
      detailedProblem: "Lobby flow management is critical for premium branch banking. Linely ensures clients are routed automatically and discreetly to the appropriate advisor or teller window. Whether a customer is arriving for basic transactions or a scheduled mortgage consultation, Linely coordinates the queue with real-time status updates, reducing advisor idle time and giving customers a premium, stress-free waiting environment.",
      quote: "Our wealth management clients love the private, virtual queuing experience. It allows our branch advisors to prepare for each specific client consult before they even approach the desk.",
      authorName: "Arthur Sterling",
      authorRole: "VP of Branch Transformation",
    },
    {
      name: "Education",
      description: "Streamline registrar sign-ins, financial aid queues, and student services.",
      icon: GraduationCap,
      photo: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
      detailedProblem: "Campus administration offices, registrar counters, and financial aid departments experience major bottlenecks during enrollment and academic deadlines. Linely helps universities orchestrate campus traffic by allowing students to join virtual queues directly from their mobile phones. Students can wait in the library or student union and receive a notification only when their advisor is ready, transforming peak registration periods into a seamless experience.",
      quote: "Registrar sign-in weeks used to be chaos for students and staff. With Linely, students sign up from their campus dorms and walk to our office only when they receive our text alert.",
      authorName: "Sophia Vance",
      authorRole: "University Registrar",
    },
    {
      name: "Hospitality",
      description: "Coordinate check-ins, table waitlists, and VIP guest experiences flawlessly.",
      icon: Bed,
      photo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      detailedProblem: "First impressions define the guest journey, but arrival rushes at front desks can leave tired travelers waiting with heavy luggage. Linely automates check-ins and check-outs by shifting guest arrivals into a flexible digital waitlist. Guests check in on arrival and are notified automatically when their room is ready or their counter is vacant, allowing them to relax in the lounge, enjoy a complimentary drink, or begin exploring immediately.",
      quote: "Front-desk arrival rushes used to hurt our service ratings. Shifting to virtual check-in queues lets our guests start enjoying the resort amenities the minute they arrive, without the wait.",
      authorName: "Julian Fontaine",
      authorRole: "General Manager",
    },
  ];

  return (
    <section
      id="industries"
      className="bg-gradient-to-b from-[#FCFAF5] to-[#FAF5EB] py-24 md:py-32 px-6 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center bg-white/40 backdrop-blur-xl border border-white/60 text-brand-navy/80 font-rethink text-[10px] md:text-xs font-light uppercase tracking-[0.22em] px-4.5 py-1.5 rounded-full mb-8 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.85),0_4px_12px_rgba(0,0,0,0.03)] cursor-default select-none"
        >
          Built for every industry
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-boldonse text-4xl sm:text-6xl md:text-[70px] text-brand-navy tracking-normal text-center leading-[1.1] mb-16 whitespace-nowrap sm:whitespace-normal"
        >
          Who uses Linely?
        </motion.h2>

        {/* Overview Grid: 2 columns on desktop/tablet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mb-28">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{
                scale: 1.015,
                borderColor: "#1A87C2",
                boxShadow: "0 10px 30px rgba(26,35,114,0.06)",
              }}
              className="bg-white/95 backdrop-blur-md border border-brand-cream/60 text-slate-800 rounded-3xl p-6 md:p-8 flex items-start gap-5 transition-all duration-300 shadow-sm hover:shadow-lg cursor-default select-none animate-none"
            >
              {/* Bold Solid Icon representation (Shopify-admin style weight) */}
              <div className="flex-shrink-0 bg-[#0D1A5E]/5 w-14 h-14 rounded-2xl text-[#0D1A5E] flex items-center justify-center">
                <ind.icon className="w-7 h-7 fill-current text-[#0D1A5E]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-boldonse text-lg sm:text-xl font-bold tracking-tight mb-2 text-brand-navy">
                  {ind.name}
                </span>
                <p className="font-cabin text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                  {ind.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Divider line */}
        <div className="w-full max-w-5xl h-[1px] bg-slate-200/60 mb-28" />

        {/* Deep-Dive Solutions Section */}
        <div className="w-full max-w-5xl space-y-32">
          {industries.map((ind, i) => {
            const isEven = i % 2 === 0;
            return (
              <div 
                key={ind.name + "-deep"}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
              >
                {/* Photo & Testimonial Column (Alternating placement) */}
                <div className={`space-y-6 ${isEven ? "order-1" : "order-1 lg:order-2"}`}>
                  {/* Photo with Custom Brand Navy-tinted Duotone effect */}
                  <div className="relative overflow-hidden rounded-3xl bg-[#0D1A5E]/10 shadow-xl group aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-72">
                    <img 
                      src={ind.photo} 
                      alt={ind.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-95 group-hover:scale-102 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-[#0D1A5E]/20 mix-blend-color pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#091244]/45 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Fictional/Illustrative Testimonial Card */}
                  <div className="bg-[#091244] text-white p-6 md:p-7 rounded-3xl shadow-lg border border-white/5 relative overflow-hidden">
                    <div className="absolute -top-6 -left-6 text-white/5 font-serif text-8xl pointer-events-none select-none">
                      “
                    </div>
                    
                    <p className="font-cabin text-xs sm:text-sm text-slate-200 leading-relaxed italic relative z-10 mb-5 font-light">
                      "{ind.quote}"
                    </p>
                    
                    <div className="flex justify-between items-end relative z-10">
                      <div>
                        <span className="font-boldonse text-xs font-bold text-brand-cyan block">
                          {ind.authorName}
                        </span>
                        <span className="font-cabin text-[10px] text-slate-400 block font-light">
                          {ind.authorRole}
                        </span>
                      </div>
                      
                      <span className="font-cabin text-[9px] text-slate-400/80 italic block leading-none select-none font-light">
                        Illustrative example
                      </span>
                    </div>
                  </div>
                </div>

                {/* Text Solution Column */}
                <div className={`space-y-6 ${isEven ? "order-2" : "order-2 lg:order-1"}`}>
                  <h4 className="font-boldonse text-3xl md:text-4xl font-black text-brand-navy tracking-tight leading-tight">
                    {ind.name}
                  </h4>
                  <p className="font-cabin text-sm md:text-base text-slate-600 leading-relaxed font-light">
                    {ind.detailedProblem}
                  </p>
                  
                  <button 
                    onClick={() => {
                      if (onOpenProduct) {
                        onOpenProduct("contact");
                      } else {
                        const element = document.getElementById("contact");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }
                    }}
                    className="inline-flex items-center gap-2 font-rethink font-bold text-sm text-brand-ocean hover:text-brand-navy transition-colors duration-200 group cursor-pointer"
                  >
                    Explore {ind.name} <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Elegant light border line at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-200/50 w-full" />
    </section>
  );
}
