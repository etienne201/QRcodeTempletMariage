import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "lib", "guests.json");

function getGuests() {
  if (!fs.existsSync(DATA_PATH)) return [];
  const data = fs.readFileSync(DATA_PATH, "utf8");
  return JSON.parse(data);
}

function saveGuests(guests: any[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(guests, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  const guests = getGuests();
  
  if (id) {
    const guest = guests.find((g: any) => g.id.toString() === id);
    return guest 
      ? NextResponse.json(guest) 
      : NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }
  
  return NextResponse.json(guests);
}

export async function POST(request: Request) {
  try {
    const newGuest = await request.json();
    const guests = getGuests();
    
    const index = guests.findIndex((g: any) => g.id === newGuest.id);
    if (index > -1) {
      guests[index] = newGuest;
    } else {
      guests.push(newGuest);
    }
    
    saveGuests(guests);
    return NextResponse.json({ success: true, data: newGuest });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save guest" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  
  let guests = getGuests();
  guests = guests.filter((g: any) => g.id.toString() !== id);
  saveGuests(guests);
  
  return NextResponse.json({ success: true });
}
