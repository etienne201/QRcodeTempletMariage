"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, Calendar, UtensilsCrossed, CheckCircle2 } from "lucide-react";
import { AttendanceModal } from "@/components/AttendanceModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import { FloatingDecorations } from "@/components/FloatingDecorations";
import { translations, Language } from "@/lib/translations";
import { useToast } from "@/hooks/useToast";

function GuestContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { showToast } = useToast();


  useEffect(() => {
    const guestId = searchParams.get("id");
    setId(guestId);
    
    if (guestId) {
      // Fetch guest data from API
      fetch(`/api/guests?id=${guestId}`)
        .then((res: Response) => res.json())
        .then((resData: any) => {
          setData(resData);
          setLoading(false);
          setTimeout(() => setIsPageLoading(false), 300); // Tiny delay for smooth transition
          
          // Show modal after data is loaded if not already checked in
          // Senior approach: Prioritize server status, fallback to localStorage
          const serverStatus = resData.attendanceStatus;
          const storedStatus = localStorage.getItem(`attendance-${guestId}`);
          
          if (serverStatus || storedStatus) {
            setHasCheckedIn(true);
            setCheckInStatus(serverStatus || (storedStatus as string));
          } else {
            setTimeout(() => setShowModal(true), 1000); // Faster appearance
          }
        })
        .catch((err: Error | any) => {
          console.error("Error fetching guest:", err);
          setLoading(false);
          setIsPageLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fullName = data ? (data.title ? `${data.title} ${data.name}` : data.name) : "Cher invité";
  const lang = data?.lang || "fr";
  const t = translations[lang as Language] || translations.fr;
  const table = data?.table || "?";
  const tableName = data?.tableName || (lang === "fr" ? "Non assignée" : "Unassigned");

  const invitationImages = lang === "fr" 
    ? ["/images/InvitaionDanie&johnFr.png"] 
    : ["/images/InvitaionDanie&johnEN.png"];

  const handleAttendance = async (status: "Présent" | "Honoré") => {
    if (!id) return;
    
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          guestId: id, 
          name: fullName, 
          status, 
          tableNumber: table, 
          tableName: tableName 
        }),
      });

      if (res.ok) {
        setHasCheckedIn(true);
        setCheckInStatus(status);
        setShowModal(false);
        showToast(
          lang === "fr" ? "Confirmation enregistrée !" : "Check-in confirmed!", 
          "success"
        );
        localStorage.setItem(`attendance-${id}`, status);
      }
    } catch (error) {
      console.error("Error during check-in:", error);
      showToast(
        lang === "fr" ? "Erreur de connexion" : "Connection error", 
        "error"
      );
    }
  };

  const Confetti = () => {
    return (
      <div className="fixed inset-0 pointer-events-none z-[150] overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: "50vw", 
              y: "100vh", 
              opacity: 1, 
              scale: Math.random() * 0.5 + 0.5,
              rotate: 0 
            }}
            animate={{ 
              x: `${Math.random() * 100}vw`, 
              y: `${Math.random() * 100}vh`,
              opacity: 0,
              rotate: 360
            }}
            transition={{ duration: 2, ease: "easeOut" }}
            className={`absolute w-3 h-3 rounded-full ${i % 2 === 0 ? "bg-gold" : "bg-emerald"}`}
            style={{ 
              left: `${Math.random() * 20 - 10}%`,
              top: `${Math.random() * 20 - 10}%`
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatePresence>
        {hasCheckedIn && <Confetti />}
      </AnimatePresence>
      <FloatingDecorations type={lang === "fr" ? "traditional" : "civil"} />
      <LoadingScreen 
        isLoading={isPageLoading} 
        title={fullName} 
        images={invitationImages} 
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={!isPageLoading ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gold-light/30 relative"
      >
        {/* Decorative background embellishments */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gold/5 rounded-full -translate-x-16 -translate-y-16 blur-2xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald/5 rounded-full translate-x-20 translate-y-20 blur-3xl" />
        
        {/* Header Section */}
        <div className="bg-emerald-dark p-8 md:p-10 text-center text-white relative">
          <motion.div 
            initial={{ scale: 0 }}
            animate={!isPageLoading ? { scale: 1 } : {}}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Heart className="w-6 h-6 text-gold-light fill-gold-light" />
            </div>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={!isPageLoading ? { opacity: 0.7 } : {}}
            transition={{ delay: 0.8 }}
            className="text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase opacity-70 mb-2"
          >
            {t.welcome}
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={!isPageLoading ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1 }}
            className="text-3xl md:text-4xl font-bold text-gold-light tracking-tight mb-2"
          >
            {t.title}
          </motion.h1>
          <div className="flex items-center justify-center gap-4 text-sm opacity-80 font-light">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {t.date}
            </span>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {t.location}
            </span>
          </div>
        </div>

        {/* Guest Info Section */}
        <div className="p-8 md:p-12 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={!isPageLoading ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.2 }}
            className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-3">
              {t.greeting}
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 break-words leading-tight">
              {fullName}
            </h2>
          </motion.div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={!isPageLoading ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 1.5, type: "spring" }}
            className="bg-gold-light/20 rounded-3xl p-6 md:p-8 border border-gold-light/40 relative group transition-all duration-500 hover:shadow-lg hover:shadow-gold/5"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full border border-gold-light text-gold text-[10px] font-bold uppercase tracking-widest shadow-sm">
              {t.placement}
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="mb-2 p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-8 h-8 text-emerald" />
              </div>
              <p className="text-sm text-gray-500 font-medium">{t.tableNumLabel}</p>
              <p className="text-4xl font-black text-emerald tracking-tighter mb-1">
                {table}
              </p>
              <p className="text-lg font-semibold text-emerald-dark drop-shadow-sm">
                {tableName}
              </p>
            </div>
            
            {hasCheckedIn && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 flex items-center justify-center gap-2 text-emerald font-bold bg-white/50 py-2 rounded-xl border border-emerald/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                {t.attendance.status}: {checkInStatus === "Présent" ? t.attendance.presentBadge : t.attendance.honoredBadge}
              </motion.div>
            )}
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={!isPageLoading ? { opacity: 1 } : {}}
            transition={{ delay: 2 }}
            className="mt-12 text-sm text-gray-400 font-serif italic"
          >
            {t.quote}
          </motion.p>
        </div>


        {/* Footer Accent */}
        <div className="h-2 bg-gradient-to-r from-gold via-gold-light to-gold" />
      </motion.div>

      <AttendanceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleAttendance}
        guestName={fullName}
        lang={lang}
      />
    </div>
  );
}

export default function GuestPage() {
  return (
    <div className="bg-[#fcfaf2] min-h-full font-sans antialiased text-gray-900">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-center p-4">
          <div className="w-12 h-12 border-4 border-gold-light border-t-gold rounded-full animate-spin" />
          <p className="text-gold font-medium animate-pulse">Chargement...</p>
        </div>
      }>
        <GuestContent />
      </Suspense>
    </div>
  );
}
