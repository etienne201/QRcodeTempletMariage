import React from "react";
import { QrCode, Edit2, Trash2, User } from "lucide-react";

interface Guest {
  id: number;
  name: string;
  table: number;
  tableName: string;
  lang: "fr" | "en";
}

interface GuestCardProps {
  guest: Guest;
  onOpenQR: (g: Guest) => void;
  onEdit: (g: Guest) => void;
  onDelete: (id: number) => void;
}

export function GuestCard({ guest, onOpenQR, onEdit, onDelete }: GuestCardProps) {
  const initials = guest.name
    .replace(/^(M\.|Mme|Dr\.?|Prof\.?)\s*/i, "")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-white border border-gold-light hover:border-gold rounded-xl p-4 flex items-center shadow-sm transition-all duration-300 hover:shadow-md group">
      <div className="w-12 h-12 rounded-full bg-gold-light/50 flex items-center justify-center text-gold font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
        {initials || <User className="w-6 h-6" />}
      </div>

      <div className="ml-4 flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate tracking-tight">
          {guest.name}
        </h3>
        <p className="text-sm text-gray-500">
          Table <span className="text-gold font-medium">{guest.table}</span> — {guest.tableName}
        </p>
      </div>

      <div className="flex gap-2 ml-2 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onOpenQR(guest)}
          className="p-2 bg-emerald text-white rounded-lg hover:bg-emerald-dark transition-colors shadow-sm"
          title="Générer QR"
          aria-label={`Générer QR pour ${guest.name}`}
        >
          <QrCode className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(guest)}
          className="p-2 border border-gold text-gold rounded-lg hover:bg-gold-light/20 transition-colors"
          title="Modifier"
          aria-label={`Modifier ${guest.name}`}
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(guest.id)}
          className="p-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          title="Supprimer"
          aria-label={`Supprimer ${guest.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
