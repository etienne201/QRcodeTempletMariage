import React, { useState, useEffect } from "react";
import { UserPlus, Save } from "lucide-react";
import { Language, translations } from "@/lib/translations";
import { Table } from "./TableManager";
import { useToast } from "@/hooks/useToast";

interface GuestFormProps {
  onSave: (title: string, name: string, table: number, tableName: string, lang: Language) => void;
  onCancel: () => void;
  initialData?: { id?: number; title: string; name: string; table: number; tableName: string; lang: Language } | null;
  tables: Table[];
  guests: any[];
  currentAppLang: Language;
}

export function GuestForm({ onSave, onCancel, initialData, tables, guests, currentAppLang }: GuestFormProps) {
  const t = translations[currentAppLang];
  const { showToast } = useToast();
  
  const [title, setTitle] = useState(initialData?.title || t.titles[4]); // Default to M./Mr.
  const [name, setName] = useState(initialData?.name || "");
  const [table, setTable] = useState(initialData?.table || 1);
  const [tableName, setTableName] = useState<string>(initialData?.tableName || (tables[0]?.name || ""));
  const [lang, setLang] = useState<Language>(initialData?.lang || currentAppLang);
  const [isCustomTable, setIsCustomTable] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setName(initialData.name);
      setTable(initialData.table);
      setTableName(initialData.tableName);
      setLang(initialData.lang);
      setIsCustomTable(!tables.some(t => t.name === initialData.tableName));
    }
  }, [initialData, tables]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const guestsInTable = guests.filter(g => g.table === table);
    // If editing guest in the same table, subtract 1 from current total
    const isEditingCurrentGuestInSameTable = initialData?.id && initialData.table === table;
    const currentCount = isEditingCurrentGuestInSameTable ? guestsInTable.length - 1 : guestsInTable.length;

    if (currentCount >= 10) {
      // @ts-ignore - errors will exist based on our translation file updates
      showToast(t.errors?.tableFull || "Cette table est pleine (10 max)", "error");
      return;
    }

    onSave(title, name, table, tableName, lang);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gold-light rounded-xl p-6 shadow-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-lg font-semibold text-gold mb-4 flex items-center gap-2">
        {initialData ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
        {initialData ? t.editGuest : t.newGuest}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            {t.invitationLang}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLang("fr")}
              className={`flex-1 py-2 rounded-lg border transition-all text-sm ${
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
              className={`flex-1 py-2 rounded-lg border transition-all text-sm ${
                lang === "en" 
                  ? "bg-gold/10 border-gold text-gold font-semibold" 
                  : "bg-gray-50 border-gray-200 text-gray-400"
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-1/3">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {t.titleLabel}
            </label>
            <select
              className="w-full px-3 py-2 bg-gray-50 border border-gold-light rounded-lg outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold cursor-pointer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            >
              {translations[lang].titles.map((prefix) => (
                <option key={prefix} value={prefix}>{prefix}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {t.fullName}
            </label>
            <input
              autoFocus
              type="text"
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gold-light rounded-lg outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              placeholder={t.fullNamePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {t.tableNumber}
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
              {t.tableName}
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
                  // Sync table number automatically
                  const selectedTable = tables.find(t => t.name === val);
                  if (selectedTable) setTable(selectedTable.number);
                }
              }}
            >
              {tables.map((tbl) => (
                <option key={tbl.id} value={tbl.name}>{tbl.name}</option>
              ))}
              <option value="__custom">{t.otherTable}</option>
            </select>
          </div>
        </div>

        {isCustomTable && (
          <div className="animate-in zoom-in-95 duration-200">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {t.customTableName}
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gold-light rounded-lg outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
              placeholder={t.tableName}
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
            {t.save}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 text-gray-500 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </form>
  );
}
