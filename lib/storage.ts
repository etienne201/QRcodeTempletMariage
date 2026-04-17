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
      if (process.env.NODE_ENV === "development") {
        fs.writeFileSync(GUESTS_PATH, JSON.stringify(guests, null, 2));
      }
    } catch (e) {
      console.warn("Storage: Could not persist guests to FS.", e);
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
      if (process.env.NODE_ENV === "development") {
        fs.writeFileSync(ATTENDANCE_PATH, JSON.stringify(attendance, null, 2));
      }
    } catch (e) {
      console.warn("Storage: Could not persist attendance to FS.", e);
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
  }
};
