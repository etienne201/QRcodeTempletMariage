"use client";

import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Users, X, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Language, translations } from "@/lib/translations";

interface AttendanceRecord {
  guestId: string;
  name: string;
  status: string;
  tableNumber?: number;
  tableName?: string;
  timestamp: string;
}

interface PresenceListProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function PresenceList({ isOpen, onClose, lang }: PresenceListProps) {
  const t = translations[lang] || translations.fr;
  const p = t.presence;
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAttendance();
    }
  }, [isOpen]);

  const fetchAttendance = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attendance");
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
      } else {
        setError(p.errorLoad);
      }
    } catch (err) {
      setError(p.errorGeneric);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    const drawBorder = (d: jsPDF) => {
      const margin = 5;
      const w = d.internal.pageSize.width;
      const h = d.internal.pageSize.height;
      d.setDrawColor(132, 103, 51); // Bronze
      d.setLineWidth(0.5);
      d.rect(margin, margin, w - margin * 2, h - margin * 2);
      d.rect(margin + 1.5, margin + 1.5, w - (margin + 1.5) * 2, h - (margin + 1.5) * 2);
    };

    drawBorder(doc);
    doc.setFontSize(22);
    doc.setTextColor(132, 103, 51); // #846733 (Bronze)
    doc.text(t.title, 105, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(p.downloadTitle, 105, 30, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${p.downloadSub} ${new Date().toLocaleString(lang)}`, 105, 36, { align: "center" });

    // Table
    const tableData = attendance.map((rec, index) => [
      index + 1,
      rec.name,
      rec.status === "Présent" ? t.attendance.presentBadge : t.attendance.honoredBadge,
      `${rec.tableNumber || "?"} - ${rec.tableName || "?"}`,
      new Date(rec.timestamp).toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    ]);

    autoTable(doc, {
      startY: 45,
      head: [["#", t.fullName, t.attendance.status, t.tableName, "Date/Time"]],
      body: tableData,
      headStyles: { fillColor: [132, 103, 51] }, // Bronze
      alternateRowStyles: { fillColor: [248, 245, 235] }, // Ivory-ish
      margin: { top: 45 },
    });

    doc.save(p.pdfName);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gold-light/20 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-ivory">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/10 rounded-xl">
                  <Users className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{p.listTitle}</h3>
                  <p className="text-xs text-gray-400">{attendance.length} {p.countLabel}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-gold animate-spin" />
                  <p className="text-gray-400 font-medium">{t.loading}</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                  <AlertCircle className="w-12 h-12 text-red-400 opacity-50" />
                  <p className="text-gray-500 font-medium">{error}</p>
                  <button 
                    onClick={fetchAttendance}
                    className="text-gold text-sm font-semibold hover:underline mt-2"
                  >
                    {p.retry}
                  </button>
                </div>
              ) : attendance.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                  <Users className="w-12 h-12 text-gray-200" />
                  <p className="text-gray-400 font-medium">{p.noData}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attendance.map((rec) => (
                    <div 
                      key={rec.guestId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gold-light/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 mb-2 sm:mb-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${rec.status === "Présent" ? "bg-emerald" : "bg-gold"}`} />
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{rec.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                            {p.scannedAt} {new Date(rec.timestamp).toLocaleDateString(lang)} {p.at} {new Date(rec.timestamp).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <span className={`self-start sm:self-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        rec.status === "Présent" ? "bg-emerald/10 text-emerald" : "bg-gold/10 text-gold"
                      }`}>
                        {rec.status === "Présent" ? t.attendance.presentBadge : t.attendance.honoredBadge}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={downloadPDF}
                disabled={attendance.length === 0 || isLoading}
                className="flex items-center gap-2 bg-emerald text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-dark transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                <Download className="w-5 h-5" />
                {t.pdfBtn || "PDF"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
