"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, UserCheck, Users, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Header } from "@/components/Header";
import { GuestCard } from "@/components/GuestCard";
import { GuestForm } from "@/components/GuestForm";
import { QRCodeModal } from "@/components/QRCodeModal";
import { PresenceList } from "@/components/PresenceList";
import { LoadingScreen } from "@/components/LoadingScreen";
import { FloatingDecorations } from "@/components/FloatingDecorations";
import { TableManager, Table } from "@/components/TableManager";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Language, translations } from "@/lib/translations";

export interface Guest {
  id: number;
  title: string;
  name: string;
  table: number;
  tableName: string;
  lang: Language;
}

const INITIAL_GUESTS: Guest[] = [];

const INITIAL_TABLES: Table[] = [
  { id: "1", name: "Table des Témoins", number: 1 },
  { id: "2", name: "Table Famille Tchio", number: 2 },
  { id: "3", name: "Table Famille Atud", number: 3 },
  { id: "4", name: "Table des Amis", number: 4 },
  { id: "5", name: "Table d'Honneur", number: 5 },
  { id: "6", name: "Table VIP", number: 6 },
  { id: "7", name: "Table des Collègues", number: 7 },
];

export default function Home() {
  const [guests, setGuests] = useLocalStorage<Guest[]>("mariage-guests", INITIAL_GUESTS);
  const [appLang, setAppLang] = useLocalStorage<Language>("mariage-app-lang", "fr");
  const [customTables, setCustomTables] = useLocalStorage<Table[]>("mariage-tables", INITIAL_TABLES);
  const [view, setView] = useState<"list" | "form" | "qr">("list");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteGuestId, setDeleteGuestId] = useState<number | null>(null);
  const [isTableManagerOpen, setIsTableManagerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("");
  const [showPresence, setShowPresence] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [theme, setTheme] = useState<"traditional" | "civil">("traditional");

  const invitationImages = [
    "/images/InvitaionDanie&johnFr.png",
    "/images/InvitaionDanie&johnEN.png"
  ];

  const t = translations[appLang];

  useEffect(() => {
    setOrigin(window.location.origin);
    // Initial sync from API to keep server as source of truth
    fetch("/api/guests")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setGuests(data);
        }
        // Simulated premium loading delay for WOW factor
        setTimeout(() => setIsPageLoading(false), 2000);
      })
      .catch(err => {
        console.error("Initial sync error:", err);
        setIsPageLoading(false);
      });
  }, []);

  const filteredGuests = useMemo(() => {
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.tableName.toLowerCase().includes(search.toLowerCase())
    );
  }, [guests, search]);

  const handleSaveGuest = async (title: string, name: string, table: number, tableName: string, lang: Language) => {
    const guestData = {
      id: editId !== null ? editId : Date.now(),
      title,
      name,
      table,
      tableName,
      lang,
    };

    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guestData),
      });

      if (res.ok) {
        // If it's a new table name, add it to our persistent list if not coming from manager
        const existingTable = customTables.find(t => t.name === tableName);
        if (tableName && !existingTable) {
          const newTable: Table = {
            id: Date.now().toString(),
            name: tableName,
            number: table
          };
          setCustomTables((prev) => [...prev, newTable]);
        }

        if (editId !== null) {
          setGuests((prev) => prev.map((g) => (g.id === editId ? guestData : g)));
          setEditId(null);
        } else {
          setGuests((prev) => [...prev, guestData]);
        }
        setView("list");
      }
    } catch (error) {
      console.error("Error saving guest:", error);
      alert("Erreur lors de la sauvegarde sur le serveur.");
    }
  };

  const handleDeleteGuest = async (id: number) => {
    try {
      const res = await fetch(`/api/guests?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setGuests((prev) => prev.filter((g) => g.id !== id));
        if (selectedGuest?.id === id) setSelectedGuest(null);
      }
    } catch (error) {
      console.error("Error deleting guest:", error);
    }
  };

  const handleStartEdit = (g: Guest) => {
    setEditId(g.id);
    setView("form");
  };

  const handleOpenQR = (g: Guest) => {
    setSelectedGuest(g);
    setView("qr");
  };

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 md:py-12">
      <Header 
        guestCount={guests.length} 
        lang={appLang} 
        onLanguageChange={setAppLang}
      />

      {/* Navigation & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gold transition-colors" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gold-light rounded-xl outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <button
          onClick={() => { setEditId(null); setView(view === "form" ? "list" : "form"); }}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg active:scale-95 ${
            view === "form" 
              ? "bg-white border border-gold text-gold" 
              : "bg-gold text-white shadow-gold/20 hover:bg-gold/90"
          }`}
        >
          {view === "form" ? t.viewList : (
            <>
              <Plus className="w-4 h-4" />
              <span>{t.addGuest}</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowPresence(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald/10 text-emerald border border-emerald/20 rounded-xl font-medium hover:bg-emerald/20 transition-all active:scale-95 shadow-sm"
          title="Liste des présences"
        >
          <Users className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsTableManagerOpen(true)}
          className="flex items-center justify-center p-2.5 bg-emerald/10 text-emerald border border-emerald/20 rounded-xl hover:bg-emerald/20 transition-all active:scale-95 shadow-sm"
          title={t.tablesBtn}
        >
          <Hash className="w-4 h-4" />
        </button>

        <button
          onClick={() => setTheme(theme === "traditional" ? "civil" : "traditional")}
          className="flex items-center justify-center p-2.5 bg-gold/10 text-gold border border-gold/20 rounded-xl hover:bg-gold/20 transition-all active:scale-95 shadow-sm"
          title="Changer le thème"
        >
          {theme === "traditional" ? "🌸" : "💍"}
        </button>
      </div>

      {/* Content Area with Transitions */}
      <div className="space-y-4 min-h-[400px]">
        <AnimatePresence mode="wait">
          {view === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {filteredGuests.length === 0 ? (
                <div className="text-center py-20 bg-white/50 border border-dashed border-gold-light rounded-2xl">
                  <UserCheck className="w-12 h-12 text-gold-light mx-auto mb-3 opacity-50" />
                  <p className="text-gray-400 font-medium">{t.noGuests}</p>
                  <button 
                    onClick={() => setSearch("")}
                    className="text-gold text-sm mt-2 hover:underline"
                  >
                    {t.clearSearch}
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 animate-in fade-in duration-500">
                  {filteredGuests.map((g) => (
                    <GuestCard
                      key={g.id}
                      guest={g}
                      onOpenQR={handleOpenQR}
                      onEdit={handleStartEdit}
                      onDelete={(id) => setDeleteGuestId(id)}
                      lang={appLang}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GuestForm
                tables={customTables}
                initialData={editId ? guests.find((g) => g.id === editId) : null}
                onSave={handleSaveGuest}
                onCancel={() => { setView("list"); setEditId(null); }}
                currentAppLang={appLang}
              />
            </motion.div>
          )}

          {view === "qr" && selectedGuest && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex justify-center p-4"
            >
              <QRCodeModal
                guest={selectedGuest}
                origin={origin}
                onClose={() => setView("list")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LoadingScreen isLoading={isPageLoading} images={invitationImages} />
      <FloatingDecorations type={theme} />

      <PresenceList 
        isOpen={showPresence} 
        onClose={() => setShowPresence(false)} 
        lang={appLang}
      />

      <TableManager
        isOpen={isTableManagerOpen}
        onClose={() => setIsTableManagerOpen(false)}
        tables={customTables}
        onUpdateTables={setCustomTables}
        lang={appLang}
      />

      <ConfirmModal
        isOpen={!!deleteGuestId}
        onClose={() => setDeleteGuestId(null)}
        onConfirm={() => deleteGuestId && handleDeleteGuest(deleteGuestId)}
        message={t.confirm.deleteGuest}
        lang={appLang}
      />

      {/* Footer Info */}
      <footer className="mt-12 p-6 bg-gold-light/30 border border-gold-light rounded-2xl">
        <h4 className="text-sm font-semibold text-gold flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 bg-gold rounded-full" />
          {t.guideTitle}
        </h4>
        <p className="text-xs text-gold/80 leading-relaxed italic">
          {t.guideText}
        </p>
      </footer>
    </main>
  );
}
