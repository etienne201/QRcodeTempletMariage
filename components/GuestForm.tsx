import React, { useState, useEffect } from "react";
import { UserPlus, Save, X } from "lucide-react";

interface GuestFormProps {
  onSave: (name: string, table: number, tableName: string, lang: "fr" | "en") => void;
  onCancel: () => void;
  initialData?: { name: string; table: number; tableName: string; lang: "fr" | "en" } | null;
  tables: string[];
}

export function GuestForm({ onSave, onCancel, initialData, tables }: GuestFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [table, setTable] = useState(initialData?.table || 1);
  const [tableName, setTableName] = useState(initialData?.tableName || tables[0]);
  const [lang, setLang] = useState<"fr" | "en">(initialData?.lang || "fr");
  const [isCustomTable, setIsCustomTable] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTable(initialData.table);
      setTableName(initialData.tableName);
      setLang(initialData.lang);
      setIsCustomTable(!tables.includes(initialData.tableName));
    }
  }, [initialData, tables]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name, table, tableName, lang);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gold-light rounded-xl p-6 shadow-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-lg font-semibold text-gold mb-4 flex items-center gap-2">
        {initialData ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
        {initialData ? (lang === "fr" ? "Modifier l'invité" : "Edit Guest") : (lang === "fr" ? "Ajouter un invité" : "Add Guest")}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            {lang === "fr" ? "Langue d'invitation" : "Invitation Language"}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLang("fr")}
              className={`flex-1 py-2 rounded-lg border transition-all ${
                lang === "fr" 
                  ? "bg-gold/10 border-gold text-gold font-semibold" 
                  : "bg-gray-50 border-gray-200 text-gray-400"
              }`}
            >
              🇫🇷 Français
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`flex-1 py-2 rounded-lg border transition-all ${
                lang === "en" 
                  ? "bg-gold/10 border-gold text-gold font-semibold" 
                  : "bg-gray-50 border-gray-200 text-gray-400"
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            {lang === "fr" ? "Nom complet" : "Full Name"}
          </label>
          <input
            autoFocus
            type="text"
            required
            className="w-full px-4 py-2 bg-gray-50 border border-gold-light rounded-lg outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
            placeholder={lang === "fr" ? "Ex: Mme Claire Biya" : "Ex: Mr. John Smith"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {lang === "fr" ? "Numéro de table" : "Table Number"}
            </label>
            <input
              type="number"
              min={1}
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gold-light rounded-lg outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
              value={table}
              onChange={(e) => setTable(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {lang === "fr" ? "Nom de la table" : "Table Name"}
            </label>
            <select
              className="w-full px-4 py-2 bg-gray-50 border border-gold-light rounded-lg outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold cursor-pointer"
              value={isCustomTable ? "__custom" : tableName}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "__custom") {
                  setIsCustomTable(true);
                  setTableName("");
                } else {
                  setIsCustomTable(false);
                  setTableName(val);
                }
              }}
            >
              {tables.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="__custom">{lang === "fr" ? "Autre…" : "Other…"}</option>
            </select>
          </div>
        </div>

        {isCustomTable && (
          <div className="animate-in zoom-in-95 duration-200">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {lang === "fr" ? "Nom personnalisé" : "Custom name"}
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gold-light rounded-lg outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
              placeholder={lang === "fr" ? "Nom de la table" : "Table name"}
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-gold text-white font-medium py-2 rounded-lg hover:bg-gold/90 active:scale-[0.98] transition-all shadow-lg shadow-gold/10"
          >
            {initialData ? (lang === "fr" ? "Enregistrer" : "Save") : (lang === "fr" ? "Ajouter l'invité" : "Add Guest")}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 text-gray-500 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            {lang === "fr" ? "Annuler" : "Cancel"}
          </button>
        </div>
      </div>
    </form>
  );
}
