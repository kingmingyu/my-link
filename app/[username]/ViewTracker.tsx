"use client";

import { useEffect, useRef } from "react";

export default function ViewTracker({ uid }: { uid: string }) {
  const isTracked = useRef(false);

  useEffect(() => {
    if (isTracked.current) return;
    
    // 페이지 뷰 기록 API 호출
    fetch(`/api/view/${uid}`, { method: "POST" }).catch(console.error);
    isTracked.current = true;
  }, [uid]);

  return null;
}
