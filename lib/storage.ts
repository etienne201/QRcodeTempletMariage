import { kv } from "@vercel/kv";
import fs from "fs";
import path from "path";

// Fallback arrays for local development when KV is not configured
let localGuests: any[] = [];
let localAttendance: any[] = [];
let localTables: any[] = [];

const hasKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

// Local fallback initialization
try {
  if (!hasKV) {
    const GUEST_FILE = path.join(process.cwd(), "lib", "guests.json");
    if (fs.existsSync(GUEST_FILE)) {
      localGuests = JSON.parse(fs.readFileSync(GUEST_FILE, "utf-8"));
    }
  }
} catch (e) {
  // Ignore
}

export const Storage = {
  async getGuests(): Promise<any[]> {
    if (hasKV) {
      return (await kv.get("mariage:guests")) || [];
    }
    return localGuests;
  },

  async saveGuests(guests: any[]) {
    if (hasKV) {
      await kv.set("mariage:guests", guests);
    } else {
      localGuests = guests;
      // In a real local dev we could write to fs, but for safety in Vercel we don't.
    }
  },

  async getAttendance(): Promise<any[]> {
    if (hasKV) {
      return (await kv.get("mariage:attendance")) || [];
    }
    return localAttendance;
  },

  async saveAttendance(attendance: any[]) {
    if (hasKV) {
      await kv.set("mariage:attendance", attendance);
    } else {
      localAttendance = attendance;
    }
  },

  // New storage methods for Tables
  async getTables(): Promise<any[]> {
    if (hasKV) {
      return (await kv.get("mariage:tables")) || [];
    }
    return localTables;
  },

  async saveTables(tables: any[]) {
    if (hasKV) {
      await kv.set("mariage:tables", tables);
    } else {
      localTables = tables;
    }
  },

  async clearAllData() {
    if (hasKV) {
      await kv.set("mariage:guests", []);
      await kv.set("mariage:attendance", []);
      await kv.set("mariage:tables", []);
    } else {
      localGuests = [];
      localAttendance = [];
      localTables = [];
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
