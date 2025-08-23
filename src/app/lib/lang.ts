import { franc } from "franc";
import Languages from "../languages/page";

// Convert ISO-639-3 -> ISO-639-1 if possible (m2m100 uses 2-letter codes)
export function detectISO1(text: string): string | null {
    const iso3 = franc(text || "", { minLength: 10 });   // returns 'und' if unknown
    if (!iso3 || iso3 === "und") return null;
    const match = Languages().filter((lang: any) => lang["3"] === iso3)[0];
    return match?.["1"] || null; // e.g., 'eng'->'en', 'hin'->'hi'
}

// Minimal whitelist for M2M100 common langs (extend as needed)
export const SUPPORTED = new Set([
    "en", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "ur",
    "fr", "de", "es", "it", "pt", "ru", "zh", "ja", "ko", "ar", "tr", "vi", "id", "th"
]);

export function safeLang(code: string | null, fallback = "en") {
    if (code && SUPPORTED.has(code)) return code;
    return fallback;
}