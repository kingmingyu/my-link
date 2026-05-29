import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, setDoc } from "firebase/firestore";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ uid: string; linkId: string }> }
) {
  try {
    const { uid, linkId } = await params;
    
    // 1. 링크 클릭 수 업데이트
    const linkRef = doc(db, "users", uid, "links", linkId);
    await updateDoc(linkRef, {
      clickCount: increment(1)
    });

    // 2. 일별 통계(클릭 수) 업데이트
    const today = new Date().toISOString().split("T")[0];
    const statsRef = doc(db, "users", uid, "daily_stats", today);
    await setDoc(statsRef, {
      clicks: increment(1)
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating click count:", error);
    return NextResponse.json({ error: "Failed to update click count" }, { status: 500 });
  }
}
