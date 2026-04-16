"use client";

import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Printer, ArrowLeft, Loader2 } from "lucide-react";
import { Language, translations } from "@/lib/translations";

interface Guest {
  id: number;
  title: string;
  name: string;
  table: number;
  tableName: string;
  lang: Language;
}

interface QRCodeModalProps {
  guest: Guest;
  origin: string;
  onClose: () => void;
}

export function QRCodeModal({ guest, origin, onClose }: QRCodeModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const guestUrl = `${origin}/guest?id=${guest.id}&title=${encodeURIComponent(guest.title)}&name=${encodeURIComponent(guest.name)}&table=${guest.table}&tableName=${encodeURIComponent(guest.tableName)}&lang=${guest.lang}`;
  const t = translations[guest.lang];

  const invitationImg = guest.lang === "fr" 
    ? "/images/InvitaionDanie&johnFr.png" 
    : "/images/InvitaionDanie&johnEN.png";

  const downloadInvitation = async () => {
    setIsGenerating(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Load the background image
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.src = invitationImg;
      
      await new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = reject;
      });

      // Set canvas size to image size
      canvas.width = bgImg.width;
      canvas.height = bgImg.height;

      // Draw background
      ctx.drawImage(bgImg, 0, 0);

      // 2. Draw Guest Name (Title + Name)
      // Standardize coordinates scaled to image size
      // Analysis: Y ~ 32.5%, X ~ 39%
      const textX = canvas.width * 0.395;
      const textY = canvas.height * 0.332;
      
      ctx.fillStyle = "#846733"; // Gold/Bronze color
      ctx.font = `italic 600 ${Math.round(canvas.height * 0.024)}px serif`; // Responsive font size
      ctx.fillText(`${guest.title} ${guest.name}`, textX, textY);

      // 3. Draw QR Code
      // Get the QR from the existing rendered component or redraw it
      const qrCanvas = document.querySelector("canvas");
      if (qrCanvas) {
        // Position Analyzed: X ~ 84%, Y ~ 82.5%, Size ~ 14%
        const qrSize = canvas.width * 0.145;
        const qrX = canvas.width * 0.832;
        const qrY = canvas.height * 0.822;

        // Draw a small white background for the QR if needed (though it's in a frame)
        ctx.fillStyle = "white";
        ctx.fillRect(qrX, qrY, qrSize, qrSize);
        
        ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
      }

      // 4. Trigger Download
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `invitation-${guest.name.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Erreur lors de la génération:", error);
      alert("Erreur lors de la génération de l'image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const printQR = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-w-2xl w-full mx-auto border border-gold-light">
      {/* Decorative Top */}
      <div className="bg-gold p-3 text-center">
        <p className="text-[10px] text-gold-light/80 uppercase tracking-widest font-medium mb-1">
          {t.smartInvitation}
        </p>
        <h3 className="text-white font-semibold flex items-center justify-center gap-2">
          {translations.fr.title}
        </h3>
      </div>

      <div className="p-4 md:p-8 text-center bg-ivory">
        {/* Invitation Card with Overlays (Live Preview) */}
        <div className="relative inline-block shadow-2xl rounded-lg overflow-hidden border border-gold-light/30 mb-8 group transition-transform hover:scale-[1.02] duration-500">
          <img 
            src={invitationImg} 
            alt="Wedding Invitation" 
            className="w-full max-w-[600px] h-auto block"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/600x400/004d40/ecc94b?text=Image+Manquante";
            }}
          />
          
          {/* QR Code Overlay */}
          <div className="absolute top-[82.2%] left-[83.2%] w-[14.5%] h-auto aspect-square bg-white p-0.5 rounded-sm shadow-sm md:shadow-md">
            <QRCodeCanvas
              value={guestUrl}
              size={512} // High res
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

          {/* Guest Name Overlay */}
          <div className="absolute top-[31%] left-[39.5%] w-[40%] text-left hidden sm:block">
             <p className="text-[10px] md:text-sm font-serif text-[#846733] italic truncate">
               {guest.title} {guest.name}
             </p>
          </div>
        </div>

        <div className="space-y-1 mb-8">
          <h4 className="text-xl font-bold text-gray-900">{guest.title} {guest.name}</h4>
          <p className="text-gold font-medium">
             Table {guest.table} — {guest.tableName}
          </p>
          <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-2">
            {t.scanMe}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <button
            onClick={downloadInvitation}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 bg-emerald text-white py-2.5 rounded-xl hover:bg-emerald-dark transition-all active:scale-95 shadow-lg shadow-emerald/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{t.downloadPNG}</span>
          </button>
          <button
            onClick={printQR}
            className="flex items-center justify-center gap-2 bg-gold text-white py-2.5 rounded-xl hover:bg-gold-dark transition-all active:scale-95 shadow-lg shadow-gold/10"
          >
            <Printer className="w-4 h-4" />
            <span className="text-sm font-medium">{t.print}</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 flex items-center justify-center gap-2 text-gray-400 hover:text-gold transition-colors w-full text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backToList}
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
