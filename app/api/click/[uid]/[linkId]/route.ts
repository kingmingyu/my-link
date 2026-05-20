import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ uid: string; linkId: string }> }
) {
  try {
    const { uid, linkId } = await params;
    const linkRef = doc(db, "users", uid, "links", linkId);
    
    await updateDoc(linkRef, {
      clickCount: increment(1)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating click count:", error);
    return NextResponse.json({ error: "Failed to update click count" }, { status: 500 });
  }
}
