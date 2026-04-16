"use client";

import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Printer, ArrowLeft, Share2 } from "lucide-react";

interface Guest {
  id: number;
  name: string;
  table: number;
  tableName: string;
  lang: "fr" | "en";
}

interface QRCodeModalProps {
  guest: Guest;
  origin: string;
  onClose: () => void;
}

export function QRCodeModal({ guest, origin, onClose }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const guestUrl = `${origin}/guest?id=${guest.id}&name=${encodeURIComponent(guest.name)}&table=${guest.table}&tableName=${encodeURIComponent(guest.tableName)}&lang=${guest.lang}`;

  const downloadQR = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `invitation-${guest.name.replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
    }
  };

  const printQR = () => {
    window.print();
  };

  const invitationImg = guest.lang === "fr" ? "/invitation-fr.png" : "/invitation-en.png";

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-w-2xl w-full mx-auto border border-gold-light">
      {/* Decorative Top */}
      <div className="bg-gold p-3 text-center">
        <p className="text-[10px] text-gold-light/80 uppercase tracking-widest font-medium mb-1">
          {guest.lang === "fr" ? "Smart Invitation" : "Smart Invitation"}
        </p>
        <h3 className="text-white font-semibold flex items-center justify-center gap-2">
          Danie & John
        </h3>
      </div>

      <div className="p-4 md:p-8 text-center bg-ivory">
        {/* Invitation Card with QR Overlay */}
        <div className="relative inline-block shadow-2xl rounded-lg overflow-hidden border border-gold-light/30 mb-8 group transition-transform hover:scale-[1.02] duration-500">
          <img 
            src={invitationImg} 
            alt="Wedding Invitation" 
            className="w-full max-w-[600px] h-auto block"
          />
          
          {/* QR Code Overlay - Positioned to match the placeholder in the image */}
          <div className="absolute bottom-[3%] right-[3%] md:bottom-[4.5%] md:right-[4.5%] w-[18%] h-auto aspect-square bg-white p-1 rounded-sm shadow-sm md:shadow-md">
            <QRCodeCanvas
              value={guestUrl}
              size={500} // High res, scaled by CSS
              style={{ width: '100%', height: '100%' }}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: "/favicon.ico",
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>

          {/* Guest Name Overlay (Optional, if you want it on the image or just below) */}
          <div className="absolute top-[32%] left-[38%] w-[40%] text-left hidden sm:block">
             <p className="text-[10px] md:text-sm font-serif text-[#846733] italic truncate">
               {guest.name}
             </p>
          </div>
        </div>

        <div className="space-y-1 mb-8">
          <h4 className="text-xl font-bold text-gray-900">{guest.name}</h4>
          <p className="text-gold font-medium">
            Table {guest.table} — {guest.tableName}
          </p>
          <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-2">
            {guest.lang === "fr" ? "SCANNEZ-MOI • Accès & Placement" : "SCAN ME • Access & Seating"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <button
            onClick={downloadQR}
            className="flex items-center justify-center gap-2 bg-emerald text-white py-2.5 rounded-xl hover:bg-emerald-dark transition-all active:scale-95 shadow-lg shadow-emerald/10"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">PNG</span>
          </button>
          <button
            onClick={printQR}
            className="flex items-center justify-center gap-2 bg-gold text-white py-2.5 rounded-xl hover:bg-gold-dark transition-all active:scale-95 shadow-lg shadow-gold/10"
          >
            <Printer className="w-4 h-4" />
            <span className="text-sm font-medium">{guest.lang === "fr" ? "Imprimer" : "Print"}</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 flex items-center justify-center gap-2 text-gray-400 hover:text-gold transition-colors w-full text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {guest.lang === "fr" ? "Retour à la liste" : "Back to list"}
        </button>
      </div>

      {/* URL Preview (Subtle) */}
      <div className="bg-gray-50 p-3 border-t border-gray-100">
        <p className="text-[9px] text-gray-400 break-all font-mono leading-tight">
          {guestUrl}
        </p>
      </div>
    </div>
  );
}
