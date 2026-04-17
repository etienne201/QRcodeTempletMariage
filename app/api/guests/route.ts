import { NextResponse } from "next/server";
import { Storage } from "@/lib/storage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  const guests = await Storage.getGuests();
  
  if (id) {
    const guest = guests.find((g: any) => g.id.toString() === id);
    if (guest) {
      const attendanceStatus = await Storage.isGuestPresent(id);
      return NextResponse.json({ ...guest, attendanceStatus });
    }
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }
  
  return NextResponse.json(guests);
}

export async function POST(request: Request) {
  try {
    const newGuest = await request.json();
    const guests = await Storage.getGuests();
    
    const index = guests.findIndex((g: any) => g.id.toString() === newGuest.id.toString());
    let updatedGuests = [...guests];

    if (index > -1) {
      updatedGuests[index] = newGuest;
    } else {
      updatedGuests.push(newGuest);
    }
    
    await Storage.saveGuests(updatedGuests);
    
    return NextResponse.json({ 
      success: true, 
      data: newGuest,
      persisted: process.env.NODE_ENV === "development"
    });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to process guest" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  
  // Use the new atomic cascading delete
  await Storage.deleteGuest(id);
  
  return NextResponse.json({ success: true });
}
