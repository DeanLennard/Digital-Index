// src/components/landing/PageBeacon.client.tsx
"use client";
import { useEffect } from "react";
import { ph } from "@/lib/ph";

export default function PageBeacon() {
    useEffect(() => {
        ph.capture("view_digital_health_check", { path: "/digital-health-check" });
    }, []);
    return null;
}
