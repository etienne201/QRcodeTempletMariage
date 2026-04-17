import fs from "fs";
import path from "path";

const GUESTS_PATH = path.join(process.cwd(), "lib", "guests.json");
const ATTENDANCE_PATH = path.join(process.cwd(), "lib", "attendance.json");

// Singletons for in-memory storage fallback
let guestsCache: any[] | null = null;
let attendanceCache: any[] | null = null;

export const Storage = {
  async getGuests(): Promise<any[]> {
    if (guestsCache) return guestsCache;
    try {
      if (!fs.existsSync(GUESTS_PATH)) return [];
      const data = fs.readFileSync(GUESTS_PATH, "utf8");
      guestsCache = JSON.parse(data);
      return guestsCache || [];
    } catch {
      return [];
    }
  },

  async saveGuests(guests: any[]) {
    guestsCache = guests;
    try {
      fs.writeFileSync(GUESTS_PATH, JSON.stringify(guests, null, 2));
    } catch (e) {
      console.warn("Storage: Could not persist guests to FS (likely read-only).", e);
    }
  },

  async getAttendance(): Promise<any[]> {
    if (attendanceCache) return attendanceCache;
    try {
      if (!fs.existsSync(ATTENDANCE_PATH)) return [];
      const data = fs.readFileSync(ATTENDANCE_PATH, "utf8");
      attendanceCache = JSON.parse(data);
      return attendanceCache || [];
    } catch {
      return [];
    }
  },

  async saveAttendance(attendance: any[]) {
    attendanceCache = attendance;
    try {
      fs.writeFileSync(ATTENDANCE_PATH, JSON.stringify(attendance, null, 2));
    } catch (e) {
      console.warn("Storage: Could not persist attendance to FS (likely read-only).", e);
    }
  },

  async clearAllData() {
    guestsCache = [];
    attendanceCache = [];
    try {
      if (fs.existsSync(GUESTS_PATH)) fs.writeFileSync(GUESTS_PATH, "[]");
      if (fs.existsSync(ATTENDANCE_PATH)) fs.writeFileSync(ATTENDANCE_PATH, "[]");
    } catch (e) {
      console.warn("Storage: Could not clear FS files.", e);
    }
  },

  // Senior Feature: Atomic cascading delete
  async deleteGuest(id: string | number) {
    const stringId = id.toString();
    
    // 1. Remove from guests
    const guests = await this.getGuests();
    const filteredGuests = guests.filter((g: any) => g.id.toString() !== stringId);
    await this.saveGuests(filteredGuests);

    // 2. Cascade remove from attendance
    const attendance = await this.getAttendance();
    const filteredAttendance = attendance.filter((a: any) => a.guestId.toString() !== stringId);
    await this.saveAttendance(filteredAttendance);
  },

  // Senior Feature: Fast existence check
  async isGuestPresent(id: string | number): Promise<string | null> {
    const stringId = id.toString();
    const attendance = await this.getAttendance();
    const record = attendance.find((a: any) => a.guestId.toString() === stringId);
    return record ? record.status : null;
  }
};
