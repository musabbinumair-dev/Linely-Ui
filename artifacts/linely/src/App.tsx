import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WhyLinely from "./components/WhyLinely";
import TrustedBy from "./components/TrustedBy";
import Solution from "./components/Solution";
import Industries from "./components/Industries";
import Features from "./components/Features";
import StackingCards from "./components/StackingCards";
import WhyChoose from "./components/WhyChoose";
import Pricing from "./components/Pricing";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import OperatorConsole from "./components/OperatorConsole";
import AdminDashboard from "./components/AdminDashboard";
import AuthPage from "./components/AuthPage";
import ProductPage from "./components/ProductPage";
import WaitingRoomTV from "./components/WaitingRoomTV";
import SuperadminDashboard from "./components/SuperadminDashboard";
import CompanySuperadminDashboard from "./components/CompanySuperadminDashboard";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [view, setView] = useState<"landing" | "console" | "admin" | "contact" | "product" | "auth" | "tv" | "superadmin" | "company-superadmin">("landing");
  const [prevView, setPrevView] = useState<"landing" | "console" | "admin" | "contact" | "product" | "auth" | "superadmin" | "company-superadmin">("admin");
  const [productSection, setProductSection] = useState<string | undefined>(undefined);

  const handleSetView = (newView: "landing" | "console" | "admin" | "contact" | "product" | "auth" | "tv" | "superadmin" | "company-superadmin", section?: string) => {
    if (view !== "tv" && newView === "tv") {
      setPrevView(view as any);
    }
    setView(newView);
    if (newView === "product") {
      setProductSection(section);
    } else {
      setProductSection(undefined);
    }
    if (!section) {
      window.scrollTo({ top: 0 });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased selection:bg-brand-cyan selection:text-brand-navy">
      {["landing", "product", "contact"].includes(view) && (
        <Navbar
          onOpenConsole={() => handleSetView("auth")}
          onOpenAdmin={() => handleSetView("admin")}
          onOpenContact={() => handleSetView("contact")}
          onGoHome={() => handleSetView("landing")}
          onOpenProduct={(section) => handleSetView("product", section)}
        />
      )}
      <AnimatePresence mode="wait">
        {view === "landing" ? (
          <motion.div
            key="landing-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <Hero onStart={() => handleSetView("auth")} />
            <TrustedBy />
            <Solution onOpenProduct={(section) => handleSetView("product", section)} />
            <WhyLinely />
            <Industries onOpenProduct={(section) => handleSetView("product", section)} />
            <Features onOpenProduct={(section) => handleSetView("product", section)} />
            <WhyChoose onStart={() => handleSetView("auth")} />
            <StackingCards onStart={() => handleSetView("auth")} />
            <Pricing />
            <Footer
              onOpenContact={() => handleSetView("contact")}
              onOpenProduct={(section) => handleSetView("product", section)}
            />
          </motion.div>
        ) : view === "auth" ? (
          <motion.div
            key="auth-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <AuthPage
              onGoHome={() => handleSetView("landing")}
              onSelectConsole={() => handleSetView("console")}
              onSelectAdmin={() => handleSetView("admin")}
              onSelectSuperadmin={() => handleSetView("superadmin")}
              onSelectCompanySuperadmin={() => handleSetView("company-superadmin")}
            />
          </motion.div>
        ) : view === "console" ? (
          <motion.div
            key="console-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <OperatorConsole onLogout={() => handleSetView("landing")} onOpenTV={() => handleSetView("tv")} />
          </motion.div>
        ) : view === "admin" ? (
          <motion.div
            key="admin-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <AdminDashboard onLogout={() => handleSetView("landing")} onOpenTV={() => handleSetView("tv")} />
          </motion.div>
        ) : view === "superadmin" ? (
          <motion.div
            key="superadmin-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <SuperadminDashboard onLogout={() => handleSetView("landing")} />
          </motion.div>
        ) : view === "company-superadmin" ? (
          <motion.div
            key="company-superadmin-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <CompanySuperadminDashboard onLogout={() => handleSetView("landing")} />
          </motion.div>
        ) : view === "tv" ? (
          <motion.div
            key="tv-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <WaitingRoomTV onGoBack={() => handleSetView(prevView)} />
          </motion.div>
        ) : view === "product" ? (
          <motion.div
            key="product-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <ProductPage
              onStart={() => handleSetView("auth")}
              onOpenContact={() => handleSetView("contact")}
              initialSection={productSection}
              onClearInitialSection={() => setProductSection(undefined)}
            />
            <Footer
              onOpenContact={() => handleSetView("contact")}
              onOpenProduct={(section) => handleSetView("product", section)}
              theme="light"
            />
          </motion.div>
        ) : (
          <motion.div
            key="contact-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <Contact onGoHome={() => handleSetView("landing")} />
            <Footer
              onOpenContact={() => handleSetView("contact")}
              onOpenProduct={(section) => handleSetView("product", section)}
              theme="light"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
