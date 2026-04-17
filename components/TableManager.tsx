"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Hash, Edit3 } from "lucide-react";
import { Language, translations } from "@/lib/translations";
import { ConfirmModal } from "./ConfirmModal";

export interface Table {
  id: string;
  name: string;
  number: number;
}

interface TableManagerProps {
  isOpen: boolean;
  onClose: () => void;
  tables: Table[];
  onUpdateTables: (tables: Table[]) => void;
  lang: Language;
}

export function TableManager({ isOpen, onClose, tables, onUpdateTables, lang }: TableManagerProps) {
  const t = translations[lang];
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState<number>(tables.length + 1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    const newTable: Table = {
      id: Date.now().toString(),
      name: newName.trim(),
      number: newNumber
    };
    
    onUpdateTables([...tables, newTable]);
    setNewName("");
    setNewNumber(tables.length + 2);
  };

  const handleDelete = (id: string) => {
    onUpdateTables(tables.filter(t => t.id !== id));
    setDeleteId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gold-light/20 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-ivory">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/10 rounded-xl">
                  <Hash className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-bold text-gray-900 text-xl">{t.tableManager.title}</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Form to Add Table */}
            <form onSubmit={handleAdd} className="p-6 bg-gray-50/50 border-b border-gray-100">
               <div className="flex gap-2">
                 <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-full px-3 py-2.5 bg-white border border-gold-light rounded-xl outline-none focus:ring-2 focus:ring-gold/20"
                      placeholder={t.tableManager.tableNumber}
                      value={newNumber}
                      onChange={(e) => setNewNumber(Number(e.target.value))}
                    />
                 </div>
                 <div className="flex-1">
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gold-light rounded-xl outline-none focus:ring-2 focus:ring-gold/20"
                      placeholder={t.tableManager.tableName}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                 </div>
                 <button 
                   type="submit"
                   className="p-2.5 bg-gold text-white rounded-xl shadow-lg shadow-gold/20 hover:bg-gold-dark active:scale-95 transition-all"
                 >
                   <Plus className="w-6 h-6" />
                 </button>
               </div>
            </form>

            {/* List of Tables */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {tables.length === 0 ? (
                <div className="text-center py-10">
                   <p className="text-gray-400">{t.tableManager.noTables}</p>
                </div>
              ) : (
                tables.map((table) => (
                  <div 
                    key={table.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-gold-light/50 transition-colors group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                       <span className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg font-bold text-gold text-sm border border-gold-light/20">
                         {table.number}
                       </span>
                       <span className="font-medium text-gray-700">{table.name}</span>
                    </div>
                    <button 
                      onClick={() => setDeleteId(table.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <ConfirmModal
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={() => deleteId && handleDelete(deleteId)}
            message={t.tableManager.deleteConfirm}
            lang={lang}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
