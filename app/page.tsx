"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, UserCheck } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Header } from "@/components/Header";
import { GuestCard } from "@/components/GuestCard";
import { GuestForm } from "@/components/GuestForm";
import { QRCodeModal } from "@/components/QRCodeModal";
import { Language, translations } from "@/lib/translations";

export interface Guest {
  id: number;
  title: string;
  name: string;
  table: number;
  tableName: string;
  lang: Language;
}

const INITIAL_GUESTS: Guest[] = [
  { id: 1, title: "M.", name: "Jean Dupont", table: 1, tableName: "Table des Témoins", lang: "fr" },
  { id: 2, title: "Mme", name: "Marie Foko", table: 2, tableName: "Table Famille Tchio", lang: "fr" },
  { id: 3, title: "Dr.", name: "Samuel Atud", table: 3, tableName: "Table Famille Atud", lang: "en" },
];

const TABLES = [
  "Table des Témoins",
  "Table Famille Tchio",
  "Table Famille Atud",
  "Table des Amis",
  "Table d'Honneur",
  "Table VIP",
  "Table des Collègues",
];

export default function Home() {
  const [guests, setGuests] = useLocalStorage<Guest[]>("mariage-guests", INITIAL_GUESTS);
  const [appLang, setAppLang] = useLocalStorage<Language>("mariage-app-lang", "fr");
  const [view, setView] = useState<"list" | "form" | "qr">("list");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("");

  const t = translations[appLang];

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const filteredGuests = useMemo(() => {
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.tableName.toLowerCase().includes(search.toLowerCase())
    );
  }, [guests, search]);

  const handleSaveGuest = (title: string, name: string, table: number, tableName: string, lang: Language) => {
    if (editId !== null) {
      setGuests((prev) =>
        prev.map((g) => (g.id === editId ? { ...g, title, name, table, tableName, lang } : g))
      );
      setEditId(null);
    } else {
      const newGuest: Guest = {
        id: Date.now(),
        title,
        name,
        table,
        tableName,
        lang,
      };
      setGuests((prev) => [...prev, newGuest]);
    }
    setView("list");
  };

  const handleDeleteGuest = (id: number) => {
    if (window.confirm(t.deleteConfirm)) {
      setGuests((prev) => prev.filter((g) => g.id !== id));
      if (selectedGuest?.id === id) setSelectedGuest(null);
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
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg active:scale-95 ${
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
      </div>

      {/* Content Area */}
      <div className="space-y-4 min-h-[400px]">
        {view === "list" && (
          <>
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
                    onDelete={handleDeleteGuest}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {view === "form" && (
          <GuestForm
            tables={TABLES}
            initialData={editId ? guests.find((g) => g.id === editId) : null}
            onSave={handleSaveGuest}
            onCancel={() => { setView("list"); setEditId(null); }}
            currentAppLang={appLang}
          />
        )}

        {view === "qr" && selectedGuest && (
          <div className="flex justify-center p-4">
            <QRCodeModal
              guest={selectedGuest}
              origin={origin}
              onClose={() => setView("list")}
            />
          </div>
        )}
      </div>

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
