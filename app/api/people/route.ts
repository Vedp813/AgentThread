import { NextResponse } from "next/server";
import { getAllPeople } from "@/lib/data";

export async function GET() {
  const people = await getAllPeople();
  return NextResponse.json({ people });
}
