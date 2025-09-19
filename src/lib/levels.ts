// src/lib/levels.ts
export type Level = "foundation" | "core" | "advanced";

export function levelForScore(score: number): Level {
    if (score <= 2.5) return "foundation";
    if (score <= 3.8) return "core";
    return "advanced";
}
