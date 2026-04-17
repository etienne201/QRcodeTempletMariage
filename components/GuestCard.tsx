import { QrCode, Edit2, Trash2, User, Link as LinkIcon, Copy } from "lucide-react";
import { translations } from "@/lib/translations";
import { useToast } from "@/hooks/useToast";

interface Guest {
  id: number;
  title: string;
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
  lang: "fr" | "en";
  origin: string;
}

export function GuestCard({ guest, onOpenQR, onEdit, onDelete, lang, origin }: GuestCardProps) {
  const t = translations[lang] || translations.fr;
  const { showToast } = useToast();

  const initials = guest.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleCopyLink = () => {
    const link = `${origin}/guest?id=${guest.id}`;
    navigator.clipboard.writeText(link);
    showToast(t.linkCopied, "info");
  };

  return (
    <div className="bg-white border border-gold-light hover:border-gold rounded-xl p-4 flex items-center shadow-sm transition-all duration-300 hover:shadow-md group">
      <div className="w-12 h-12 rounded-full bg-gold-light/50 flex items-center justify-center text-gold font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
        {initials || <User className="w-6 h-6" />}
      </div>

      <div className="ml-4 flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate tracking-tight">
          <span className="text-gold font-medium mr-1">{guest.title}</span> {guest.name}
        </h3>
        <p className="text-sm text-gray-500">
          Table <span className="text-gold font-medium">{guest.table}</span> — {guest.tableName}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 ml-2 transition-opacity">
        <button
          onClick={handleCopyLink}
          className="p-2.5 bg-ivory text-gold border border-gold-light rounded-lg hover:bg-gold/10 transition-all active:scale-95"
          title={t.copyLink}
          aria-label={`${t.copyLink} - ${guest.title} ${guest.name}`}
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={() => onOpenQR(guest)}
          className="p-2.5 bg-emerald text-white rounded-lg hover:bg-emerald-dark transition-all active:scale-95 shadow-sm"
          title={t.print}
          aria-label={`${t.print} - ${guest.title} ${guest.name}`}
        >
          <QrCode className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(guest)}
          className="p-2.5 border border-gold text-gold rounded-lg hover:bg-gold-light/20 transition-all active:scale-95"
          title={t.editGuest}
          aria-label={`${t.editGuest} - ${guest.title} ${guest.name}`}
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(guest.id)}
          className="p-2.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-all active:scale-95"
          title={t.deleteConfirm}
          aria-label={`${t.deleteConfirm} - ${guest.title} ${guest.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
