import React, { useEffect, useState, useMemo } from "react";
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

  const getDisplayTitle = (num?: number, name?: string) => {
    if (!name || name === "Non assignée" || name === "Unassigned") return `Table ${num || "?"}`;
    return name.toLowerCase().startsWith("table") ? name : `Table ${name}`;
  };

  const downloadPDF = async () => {
    setIsLoading(true); // Show loader while generating
    
    try {
      // 1. Generate the decorative SVGs to a PNG
      const createHeaderImage = async (): Promise<string> => {
        return new Promise((resolve) => {
          const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="800" height="150" viewBox="0 0 800 150">
              <rect width="800" height="150" fill="#fcfaf2" />
              <!-- Deco lines -->
              <line x1="80" y1="120" x2="720" y2="120" stroke="#846733" stroke-width="1.5" />
              <line x1="80" y1="125" x2="720" y2="125" stroke="#846733" stroke-width="0.5" />
              
              <g stroke="#846733" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                
                <!-- Bagues entrelacées (Alliances) -->
                <circle cx="210" cy="70" r="18" />
                <circle cx="230" cy="70" r="18" />
                <polygon points="210,48 214,53 210,56 206,53" fill="#846733" stroke-width="1" />
                
                <!-- Fleurs Rénovées (Lotus/Rosace) -->
                <!-- Gauche -->
                <g stroke="#846733" fill="none" stroke-width="2">
                  <path d="M 130 80 Q 130 50 145 45 Q 160 50 160 80 Q 145 95 130 80 Z" />
                  <path d="M 130 80 Q 105 60 115 50 Q 135 55 135 75 Z" />
                  <path d="M 160 80 Q 185 60 175 50 Q 155 55 155 75 Z" />
                </g>
                <!-- Droite -->
                <g stroke="#846733" fill="none" stroke-width="2">
                  <path d="M 280 80 Q 280 50 295 45 Q 310 50 310 80 Q 295 95 280 80 Z" />
                  <path d="M 280 80 Q 255 60 265 50 Q 285 55 285 75 Z" />
                  <path d="M 310 80 Q 335 60 325 50 Q 305 55 305 75 Z" />
                </g>
                
                <!-- Église -->
                <path d="M 370 80 L 400 40 L 430 80 L 430 110 L 370 110 Z" />
                <line x1="400" y1="20" x2="400" y2="40" />
                <line x1="390" y1="30" x2="410" y2="30" />
                <path d="M 390 110 L 390 90 A 10 10 0 0 1 410 90 L 410 110" />

                <!-- Réception (Coupes de champagne) -->
                <path d="M 520 50 L 540 50 L 530 75 L 530 110 M 520 110 L 540 110" />
                <path d="M 560 50 L 580 50 L 570 75 L 570 110 M 560 110 L 580 110" />
                <!-- Bulles -->
                <circle cx="530" cy="65" r="1" fill="#846733" />
                <circle cx="570" cy="60" r="1.5" fill="#846733" />
                
                <!-- Cérémonie Traditionnelle (Motif losange étoilé Ndop stylisé) -->
                <polygon points="660,70 680,50 700,70 680,90" />
                <polygon points="660,70 680,60 700,70 680,80" />
                <line x1="680" y1="50" x2="680" y2="90" />
                <line x1="660" y1="70" x2="700" y2="70" />
              </g>

              <!-- Textes sous les icônes -->
              <g fill="#846733" font-family="serif" font-size="12" text-anchor="middle" font-style="italic">
                 <text x="210" y="110">Alliances &amp; Fleurs</text>
                 <text x="400" y="140">Cérémonie &amp; Bénédiction</text>
                 <text x="550" y="110">Réception</text>
                 <text x="680" y="110">Tradition</text>
              </g>
            </svg>
          `;
          const base64Svg = btoa(unescape(encodeURIComponent(svgContent)));
          const img = new Image();
          img.src = "data:image/svg+xml;base64," + base64Svg;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 800;
            canvas.height = 150;
            const ctx = canvas.getContext("2d");
            if (ctx) ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          };
          img.onerror = () => resolve(""); // Fallback empty
        });
      };

      const headerBase64 = await createHeaderImage();
      const doc = new jsPDF();
      
      const drawBorder = (d: jsPDF) => {
        const margin = 5;
        const w = d.internal.pageSize.width;
        const h = d.internal.pageSize.height;
        d.setDrawColor(132, 103, 51); // Or
        d.setLineWidth(0.5);
        d.rect(margin, margin, w - margin * 2, h - margin * 2);
        d.rect(margin + 1.5, margin + 1.5, w - (margin + 1.5) * 2, h - (margin + 1.5) * 2);
      };

      drawBorder(doc);
      
      // Inject Graphical Header if generated
      if (headerBase64) {
        doc.addImage(headerBase64, 'PNG', 10, 10, 190, 35);
      }
      
      // Texts (moved down to create spacing from header)
      const textStartY = headerBase64 ? 60 : 20;

      doc.setFontSize(22);
      doc.setTextColor(132, 103, 51);
      doc.text(t.title, 105, textStartY, { align: "center" });
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(p.downloadTitle, 105, textStartY + 10, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`${p.downloadSub} ${new Date().toLocaleString(lang)}`, 105, textStartY + 16, { align: "center" });

      // PDF Table Colors definition
      const PDF_THEME_COLORS = [
        [59, 130, 246],  // Blue-500
        [16, 185, 129],  // Emerald-500
        [244, 63, 94],   // Rose-500
        [245, 158, 11],  // Amber-500
        [139, 92, 246],  // Purple-500
        [6, 182, 212]    // Cyan-500
      ];

      // Grouping records by table

      const groups = attendance.reduce((acc, current) => {
        const key = (current.tableNumber || 0).toString();
        if (!acc[key]) {
          acc[key] = {
            tableNumber: current.tableNumber,
            tableName: current.tableName,
            guests: []
          };
        }
        acc[key].guests.push(current);
        return acc;
      }, {} as Record<string, {tableNumber?: number, tableName?: string, guests: AttendanceRecord[]}>);

      const sortedTables = Object.values(groups).sort((a, b) => (a.tableNumber || 0) - (b.tableNumber || 0));

      let currentY = textStartY + 25;

      sortedTables.forEach((group, idx) => {
        const title = getDisplayTitle(group.tableNumber, group.tableName);
        const color = PDF_THEME_COLORS[idx % PDF_THEME_COLORS.length];

        doc.setFontSize(12);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(`${title} (${group.guests.length} invités)`, 14, currentY);
        currentY += 5;

        const tableData = group.guests.map((rec, i) => [
          i + 1,
          rec.name,
          rec.status === "Présent" ? t.attendance.presentBadge : t.attendance.honoredBadge,
          new Date(rec.timestamp).toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { 
            hour: '2-digit', minute: '2-digit' 
          })
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [["#", t.fullName, t.attendance.status, "Heure"]],
          body: tableData,
          headStyles: { fillColor: [color[0], color[1], color[2]] },
          alternateRowStyles: { fillColor: [250, 250, 246] }, // Subtle warm ivory
        });


        // @ts-ignore
        currentY = doc.lastAutoTable.finalY + 12;

        if (currentY > doc.internal.pageSize.getHeight() - 30 && idx < sortedTables.length - 1) {
          doc.addPage();
          drawBorder(doc);
          currentY = 20;
        }
      });

      if (sortedTables.length === 0) {
        doc.text("Aucune donnée", 105, textStartY + 30, { align: "center" });
      }

      doc.save(p.pdfName);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-ivory shrink-0">
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

            {/* Content Flat List */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
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
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-colors group hover:border-gold-light"
                    >
                      <div className="flex items-center gap-3 mb-2 sm:mb-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${rec.status === "Présent" ? "bg-emerald" : "bg-gold"}`} />
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{rec.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                            {getDisplayTitle(rec.tableNumber, rec.tableName)} • {p.scannedAt} {new Date(rec.timestamp).toLocaleDateString(lang)} {p.at} {new Date(rec.timestamp).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
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
            <div className="p-6 border-t border-gray-100 bg-ivory flex justify-end shrink-0">
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
