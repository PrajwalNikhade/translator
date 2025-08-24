import { franc } from "franc";

// ISO 639-3 to ISO 639-1 mapping for common languages
const iso3to1Map: { [key: string]: string } = {
  'eng': 'en',
  'spa': 'es',
  'fra': 'fr',
  'deu': 'de',
  'ita': 'it',
  'por': 'pt',
  'rus': 'ru',
  'zho': 'zh',
  'jpn': 'ja',
  'kor': 'ko',
  'ara': 'ar',
  'hin': 'hi',
  'ben': 'bn',
  'tam': 'ta',
  'tel': 'te',
  'mar': 'mr',
  'guj': 'gu',
  'kan': 'kn',
  'mal': 'ml',
  'pan': 'pa',
  'urd': 'ur',
  'tur': 'tr',
  'vie': 'vi',
  'ind': 'id',
  'tha': 'th',
  'nld': 'nl',
  'pol': 'pl',
  'ukr': 'uk',
  'ces': 'cs',
  'hun': 'hu',
  'ron': 'ro',
  'bul': 'bg',
  'hrv': 'hr',
  'srp': 'sr',
  'slk': 'sk',
  'slv': 'sl',
  'est': 'et',
  'lav': 'lv',
  'lit': 'lt',
  'fin': 'fi',
  'dan': 'da',
  'swe': 'sv',
  'nor': 'no',
  'isl': 'is'
};

// Convert ISO-639-3 -> ISO-639-1 if possible (m2m100 uses 2-letter codes)
export function detectISO1(text: string): string | null {
    const iso3 = franc(text || "", { minLength: 10 });   // returns 'und' if unknown
    if (!iso3 || iso3 === "und") return null;
    return iso3to1Map[iso3] || null;
}

// Minimal whitelist for M2M100 common langs (extend as needed)
export const SUPPORTED = new Set([
    "en", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "ur",
    "fr", "de", "es", "it", "pt", "ru", "zh", "ja", "ko", "ar", "tr", "vi", "id", "th",
    "nl", "pl", "uk", "cs", "hu", "ro", "bg", "hr", "sr", "sk", "sl", "et", "lv", "lt",
    "fi", "da", "sv", "no", "is"
]);

export function safeLang(code: string | null, fallback = "en") {
    if (code && SUPPORTED.has(code)) return code;
    return fallback;
}