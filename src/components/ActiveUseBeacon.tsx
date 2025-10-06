// src/components/ActiveUseBeacon.tsx
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ph } from "@/lib/ph";

export default function ActiveUseBeacon() {
    const path = usePathname();
    useEffect(() => {
        ph.capture("active_use", { path });
    }, [path]);
    return null;
}
