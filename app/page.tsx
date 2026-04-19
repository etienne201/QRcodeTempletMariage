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
import { useToast } from "@/hooks/useToast";

export interface Guest {
  id: number;
  title: string;
  name: string;
  table: number;
  tableName: string;
  lang: Language;
}

const INITIAL_GUESTS: Guest[] = [];

const INITIAL_TABLES: Table[] = [];

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
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const { showToast } = useToast();

  const handleUpdateTables = async (newTables: Table[] | ((prev: Table[]) => Table[])) => {
    const updated = typeof newTables === "function" ? newTables(customTables) : newTables;
    setCustomTables(updated);
    try {
      await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error("Failed to sync tables", err);
    }
  };

  const invitationImages = appLang === "fr"
    ? ["/images/InvitaionDanie&johnFr.png"]
    : ["/images/InvitaionDanie&johnEN.png"];

  const t = translations[appLang];

  useEffect(() => {
    setOrigin(window.location.origin);

    const syncData = async (isInitial = false) => {
      try {
        const res = await fetch("/api/guests");
        const data = await res.json();
        if (Array.isArray(data)) {
          // Senior check: only update if data actually changed to avoid unnecessary renders
          setGuests(data);
        }

        const resTables = await fetch("/api/tables");
        const dataTables = await resTables.json();
        if (Array.isArray(dataTables)) {
          setCustomTables(dataTables);
        }

        if (isInitial) {
          setIsPageLoading(false);
        }
      } catch (err) {
        console.error("Sync error:", err);
        if (isInitial) setIsPageLoading(false);
      }
    };

    syncData(true);

    // Senior background polling (30s) to keep multi-device sessions in sync
    const interval = setInterval(() => syncData(), 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredGuests = useMemo(() => {
    const filtered = guests.filter(
      (g) =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.tableName.toLowerCase().includes(search.toLowerCase())
    );
    return filtered.sort((a, b) => {
      if (a.table !== b.table) return a.table - b.table;
      return a.name.localeCompare(b.name);
    });
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
          handleUpdateTables((prev) => [...prev, newTable]);
        }

        if (editId !== null) {
          setGuests((prev) => prev.map((g) => (g.id === editId ? guestData : g)));
          showToast(appLang === "fr" ? "Modifié avec succès" : "Updated successfully", "success");
          setEditId(null);
        } else {
          setGuests((prev) => [...prev, guestData]);
          showToast(appLang === "fr" ? "Ajouté avec succès" : "Added successfully", "success");
        }
        setView("list");
      }
    } catch (error) {
      console.error("Error saving guest:", error);
      showToast(appLang === "fr" ? "Erreur de connexion" : "Connection error", "error");
    }
  };

  const handleDeleteGuest = async (id: number) => {
    try {
      const res = await fetch(`/api/guests?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setGuests((prev) => prev.filter((g) => g.id !== id));
        if (selectedGuest?.id === id) setSelectedGuest(null);
        showToast(appLang === "fr" ? "Supprimé avec succès" : "Deleted successfully", "info");
      }
    } catch (error) {
      console.error("Error deleting guest:", error);
      showToast(appLang === "fr" ? "Erreur lors de la suppression" : "Deletion error", "error");
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch("/api/guests?all=true", { method: "DELETE" });
      if (res.ok) {
        setGuests([]);
        handleUpdateTables([]); // Clear tables too
        showToast(appLang === "fr" ? translations.fr.confirm.clearSuccess : translations.en.confirm.clearSuccess, "success");
      }
    } catch (error) {
      console.error("Error clearing data:", error);
      showToast(appLang === "fr" ? "Erreur lors de la suppression" : "Deletion error", "error");
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
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg active:scale-95 ${view === "form"
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
                      origin={origin}
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
                guests={guests}
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
        onUpdateTables={handleUpdateTables}
        lang={appLang}
      />

      <ConfirmModal
        isOpen={!!deleteGuestId}
        onClose={() => setDeleteGuestId(null)}
        onConfirm={() => deleteGuestId && handleDeleteGuest(deleteGuestId)}
        message={t.confirm.deleteGuest}
        lang={appLang}
      />

      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearAll}
        title={t.confirm.clearAll}
        message={t.confirm.clearAllConfirm}
        lang={appLang}
      />

      {/* Footer Info */}
      <footer className="mt-12 p-6 bg-gold-light/30 border border-gold-light rounded-2xl">
        <h4 className="text-sm font-semibold text-gold flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 bg-gold rounded-full" />
          {t.guideTitle}
        </h4>
        <p className="text-xs text-gold/80 leading-relaxed italic mb-4">
          {t.guideText}
        </p>
        <button
          onClick={() => setIsClearModalOpen(true)}
          className="text-[10px] uppercase tracking-wider font-bold text-red-400 hover:text-red-500 transition-colors py-2 px-3 border border-red-400/20 rounded-lg bg-red-400/5 hover:bg-red-400/10"
        >
          {t.confirm.clearAll}
        </button>
      </footer>
    </main>
  );
}
