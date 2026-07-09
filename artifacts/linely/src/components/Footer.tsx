export default function Footer({
  onOpenContact,
  onOpenProduct,
  theme = "light"
}: {
  onOpenContact?: () => void;
  onOpenProduct?: (section?: string) => void;
  theme?: "light" | "dark";
}) {
  const footerLinks = [
    {
      title: "Product",
      links: ["Features", "Security", "Integrations", "Enterprise", "Changelog"],
    },
    {
      title: "Solutions",
      links: ["Check-in Kiosk", "Waiting Room TV", "Remote Sign-In", "Analytics", "API Access"],
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "Customers", "Press", "Contact"],
    },
    {
      title: "Resources",
      links: ["Documentation", "Guides", "Blog", "System Status", "Help Center"],
    },
  ];

  const sectionMap: Record<string, string> = {
    "Features": "",
    "Check-in Kiosk": "self-service",
    "Waiting Room TV": "self-service",
    "Remote Sign-In": "self-service",
    "Analytics": "analytics",
    "Integrations": "security-compliance"
  };

  const socialLinks = ["Twitter", "LinkedIn", "Instagram"];

  const isDark = theme === "dark";

  return (
    <footer
      id="footer"
      className={`${
        isDark
          ? "bg-brand-navy border-t border-white/10 text-slate-200"
          : "bg-[#F3F4F6] border-t border-slate-200 text-slate-800"
      } pt-24 pb-12 px-6`}
    >
      <div className="max-w-7xl mx-auto flex flex-col">
        {/* Top: Logo + Columns */}
        <div
          className={`grid grid-cols-1 md:grid-cols-6 gap-12 md:gap-8 pb-16 border-b ${
            isDark ? "border-white/10" : "border-slate-200"
          }`}
        >
          {/* Logo Section */}
          <div className="md:col-span-2 flex flex-col items-start gap-4">
            <span
              className={`font-boldonse text-4xl tracking-tight select-none ${
                isDark ? "text-white" : "text-brand-navy"
              }`}
            >
              Linely
            </span>
            <p
              className={`font-cabin text-sm max-w-xs leading-relaxed ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}
            >
              Queue management, reimagined. Helping brands across the globe transform waiting rooms into friction-free, high-quality guest experiences.
            </p>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {footerLinks.map((col) => (
              <div key={col.title} className="flex flex-col gap-4">
                <span
                  className={`font-rethink text-xs font-extrabold tracking-widest uppercase ${
                    isDark ? "text-brand-cyan" : "text-brand-navy"
                  }`}
                >
                  {col.title}
                </span>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={(e) => {
                          if (link === "Contact" && onOpenContact) {
                            e.preventDefault();
                            onOpenContact();
                          } else if ((link === "Features" || link === "Check-in Kiosk" || link === "Waiting Room TV" || link === "Remote Sign-In" || link === "Analytics" || link === "Integrations") && onOpenProduct) {
                            e.preventDefault();
                            onOpenProduct(sectionMap[link]);
                          }
                        }}
                        className={`font-cabin text-sm transition-colors duration-200 ${
                          isDark
                            ? "text-slate-300 hover:text-white"
                            : "text-slate-600 hover:text-brand-navy"
                        }`}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <span className="font-instrument text-xs text-slate-400 order-2 md:order-1">
            &copy; 2026 Linely. All rights reserved.
          </span>

          {/* Social Links */}
          <div className="flex items-center gap-6 order-1 md:order-2">
            {socialLinks.map((social) => (
              <a
                key={social}
                href={`#${social.toLowerCase()}`}
                className={`font-rethink text-sm transition-colors duration-200 ${
                  isDark
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-brand-navy"
                }`}
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
