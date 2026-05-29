import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, increment, setDoc } from "firebase/firestore";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    
    // 일별 통계(페이지 뷰) 업데이트
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const statsRef = doc(db, "users", uid, "daily_stats", today);
    
    await setDoc(statsRef, {
      pv: increment(1)
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating page view:", error);
    return NextResponse.json({ error: "Failed to update page view" }, { status: 500 });
  }
}
