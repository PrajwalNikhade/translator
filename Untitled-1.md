Sweet — here’s a **clean, step-by-step build plan** for a Next.js (App Router) API that uses **Hugging Face’s `facebook/m2m100_418M`**, with **MongoDB**, **auto language detection**, plus **voice (STT/TTS)** and **PDF translation**. I’ve included production-ready code snippets you can paste in.

---

# 0) What you’ll build (API-first)

* `/api/translate` — text → translated text (M2M100)
* `/api/lang-detect` — auto language detect (JS)
* `/api/stt` — audio → text (Whisper)
* `/api/tts` — text → audio (TTS model)
* `/api/pdf/translate` — PDF → translated .txt
* MongoDB for logs/history/glossary
* Minimal caching & rate limits (optional but noted)

---

# 1) Bootstrap the app

```bash
npx create-next-app@latest ai-translator --ts --eslint
cd ai-translator
npm i mongoose zod node-cache busboy
npm i franc langs            # language detection (ISO-639-3 -> ISO-639-1)
npm i pdf-parse              # pdf text extraction in Node
# (Optional UI libs: tailwind, shadcn, react-query, etc.)
```

Add **env** in `.env.local`:

```ini
MONGODB_URI="your-mongodb-atlas-uri"
HF_TOKEN="hf_xxx"                     # Hugging Face access token
MAX_CHARS_PER_REQ="5000"              # limit uploads/chunks
```

---

# 2) MongoDB wiring (Mongoose)

## `lib/mongo.ts`

```ts
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI!;
let cached = (global as any)._mongoose;

export async function dbConnect() {
  if (cached) return cached;
  cached = await mongoose.connect(uri);
  (global as any)._mongoose = cached;
  return cached;
}
```

## Models

### `models/Translation.ts`

```ts
import mongoose, { Schema } from "mongoose";

const TranslationSchema = new Schema({
  srcLang: String,
  tgtLang: String,
  source: String,
  result: String,
  model: { type: String, default: "facebook/m2m100_418M" },
  latencyMs: Number,
}, { timestamps: true });

export default mongoose.models.Translation ||
  mongoose.model("Translation", TranslationSchema);
```

### (Optional) `models/Glossary.ts`

```ts
import mongoose, { Schema } from "mongoose";
const GlossarySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  name: String,
  pairs: [{ source: String, target: String, note: String }],
  srcLang: String, tgtLang: String
}, { timestamps: true });

export default mongoose.models.Glossary ||
  mongoose.model("Glossary", GlossarySchema);
```

---

# 3) Shared helpers

## 3.1 Hugging Face fetch helper — `lib/hf.ts`

```ts
export async function hfJSON(modelId: string, body: any) {
  const r = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    // NOTE: For larger inputs, consider increasing Next's route size limits (config below).
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function hfBinary(modelId: string, binary: ArrayBuffer, contentType?: string) {
  const r = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      ...(contentType ? { "Content-Type": contentType } : {}),
    },
    body: Buffer.from(binary),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.arrayBuffer();
}
```

## 3.2 Language detection — `lib/lang.ts`

```ts
import { franc } from "franc";
import langs from "langs";

// Convert ISO-639-3 -> ISO-639-1 if possible (m2m100 uses 2-letter codes)
export function detectISO1(text: string): string | null {
  const iso3 = franc(text || "", { minLength: 10 });   // returns 'und' if unknown
  if (!iso3 || iso3 === "und") return null;
  const match = langs.where("3", iso3);
  return match?.["1"] || null; // e.g., 'eng'->'en', 'hin'->'hi'
}

// Minimal whitelist for M2M100 common langs (extend as needed)
export const SUPPORTED = new Set([
  "en","hi","bn","ta","te","mr","gu","kn","ml","pa","ur",
  "fr","de","es","it","pt","ru","zh","ja","ko","ar","tr","vi","id","th"
]);

export function safeLang(code: string | null, fallback = "en") {
  if (code && SUPPORTED.has(code)) return code;
  return fallback;
}
```

---

# 4) Text translation API (M2M100)

**Endpoint**: `POST /api/translate`
**Body**: `{ text: string, srcLang?: string, tgtLang: string }`

## `app/api/translate/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Translation from "@/models/Translation";
import { hfJSON } from "@/lib/hf";
import { detectISO1, safeLang } from "@/lib/lang";
import { z } from "zod";

export const maxDuration = 60; // Vercel Edge/Node runtime limit tuning

const schema = z.object({
  text: z.string().min(1),
  srcLang: z.string().optional(),
  tgtLang: z.string().min(2).max(5),
  modelId: z.string().optional(), // allow override if needed
});

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { text, srcLang, tgtLang, modelId } = schema.parse(payload);

    const MAX = Number(process.env.MAX_CHARS_PER_REQ || 5000);
    if (text.length > MAX) {
      return NextResponse.json({ error: `Text too long (>${MAX})` }, { status: 413 });
    }

    const detected = srcLang || detectISO1(text);
    const src = safeLang(detected, "en");
    const tgt = safeLang(tgtLang, "hi");  // require a supported target

    const started = Date.now();
    // M2M100: you can pass src_lang/tgt_lang
    const data = await hfJSON(modelId || "facebook/m2m100_418M", {
      inputs: text,
      parameters: { src_lang: src, tgt_lang: tgt },
      options: { wait_for_model: true }
    });

    // Inference API can return array or object; normalize:
    let result = "";
    if (Array.isArray(data)) {
      result = data[0]?.translation_text || data[0]?.generated_text || "";
    } else {
      result = data?.translation_text || data?.generated_text || "";
    }
    const latencyMs = Date.now() - started;

    await dbConnect();
    await Translation.create({ srcLang: src, tgtLang: tgt, source: text, result, latencyMs });

    return NextResponse.json({ srcLang: src, tgtLang: tgt, result, latencyMs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
```

> **Notes**
>
> * M2M100 uses 2-letter codes (ISO-639-1) like `en`, `hi`, `bn`, `ta`, etc.
> * For languages you care about, make sure they’re listed in `SUPPORTED`.

---

# 5) Language detection API

**Endpoint**: `POST /api/lang-detect`
**Body**: `{ text: string }`

## `app/api/lang-detect/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { detectISO1, safeLang } from "@/lib/lang";
import { z } from "zod";

export async function POST(req: NextRequest) {
  const { text } = z.object({ text: z.string().min(1) }).parse(await req.json());
  const detected = detectISO1(text);
  return NextResponse.json({ iso1: safeLang(detected, "en"), raw: detected });
}
```

---

# 6) Speech-to-Text (voice input)

We’ll use **Whisper** via Hugging Face (`openai/whisper-base`).
Accepts `multipart/form-data` with an audio file (`audio` field).

**Endpoint**: `POST /api/stt`
**FormData**: `audio: File` (wav/mp3/m4a/webm)

## `app/api/stt/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { hfBinary } from "@/lib/hf";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("audio") as File | null;
    if (!file) return NextResponse.json({ error: "audio file missing" }, { status: 400 });

    const buf = await file.arrayBuffer();
    const contentType = file.type || "audio/mpeg";

    // Whisper base (choose small/medium-large for better accuracy if budget allows)
    const out = await hfBinary("openai/whisper-base", buf, contentType);

    // Whisper returns JSON (string) or text; try JSON first:
    const txt = Buffer.from(out).toString("utf-8");
    let result: any;
    try { result = JSON.parse(txt); } catch { result = { text: txt }; }

    return NextResponse.json({ text: result.text || txt });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
```

> Client-side, use `MediaRecorder` to capture audio and send via `FormData`.

---

# 7) Text-to-Speech (speak the translation)

Start with a simple English model, then add MMS-TTS for Indian languages.

**Endpoint**: `POST /api/tts`
**Body**: `{ text: string, lang?: string, modelId?: string }`
**Returns**: audio bytes (stream), set `Content-Type: audio/wav` (or model-specific)

## `app/api/tts/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { hfJSON, hfBinary } from "@/lib/hf";
import { z } from "zod";

// Demo defaults (EN). For Hindi etc., consider MMS-TTS models like facebook/mms-tts-hin
const DEFAULT_TTS = "espnet/kan-bayashi-ljspeech_tacotron2";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { text, modelId } = z.object({
      text: z.string().min(1),
      modelId: z.string().optional(),
    }).parse(await req.json());

    const audio = await hfBinary(modelId || DEFAULT_TTS, new TextEncoder().encode(text).buffer);
    // Some TTS endpoints accept JSON; others accept raw text. If needed, switch to hfJSON body
    // per the model’s docs. Many return audio/wav data.

    return new NextResponse(Buffer.from(audio), {
      headers: { "Content-Type": "audio/wav" }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
```

> Different TTS models accept different input formats. If your chosen TTS expects JSON, replace `hfBinary(...)` with `hfJSON(model, { inputs: text })` and then decode `arrayBuffer()` accordingly. For multilingual TTS (Hindi, Bengali, etc.), look at **MMS-TTS** variants (e.g., `facebook/mms-tts-hin`) and gate by `lang`.

---

# 8) PDF translation

**Flow**

1. Upload PDF (`multipart/form-data`).
2. Extract text (with `pdf-parse`).
3. Chunk text (e.g., \~2000–4000 chars).
4. Translate each chunk (`/models/facebook/m2m100_418M`).
5. Concatenate and return as a downloadable `.txt`.

**Endpoint**: `POST /api/pdf/translate`
**FormData**: `pdf: File`, `tgtLang: string`, `srcLang?: string`

## `app/api/pdf/translate/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { hfJSON } from "@/lib/hf";
import { detectISO1, safeLang } from "@/lib/lang";

export const maxDuration = 300; // PDFs can be big

function chunkText(text: string, max = Number(process.env.MAX_CHARS_PER_REQ || 5000)) {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + max));
    i += max;
  }
  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("pdf") as File | null;
    const tgtLang = (form.get("tgtLang") as string | null) || "hi";
    const srcLang = (form.get("srcLang") as string | null) || undefined;

    if (!file) return NextResponse.json({ error: "pdf missing" }, { status: 400 });

    const pdfBuf = Buffer.from(await file.arrayBuffer());
    const parsed = await pdfParse(pdfBuf);
    const rawText = (parsed.text || "").trim();
    if (!rawText) return NextResponse.json({ error: "No text found in PDF" }, { status: 422 });

    const src = safeLang(srcLang || detectISO1(rawText), "en");
    const tgt = safeLang(tgtLang, "hi");

    const parts = chunkText(rawText);
    const translated: string[] = [];

    for (const p of parts) {
      const data = await hfJSON("facebook/m2m100_418M", {
        inputs: p,
        parameters: { src_lang: src, tgt_lang: tgt },
        options: { wait_for_model: true }
      });
      let out = "";
      if (Array.isArray(data)) out = data[0]?.translation_text || data[0]?.generated_text || "";
      else out = data?.translation_text || data?.generated_text || "";
      translated.push(out);
    }

    const full = translated.join("\n\n");
    return new NextResponse(full, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="translated_${tgt}.txt"`
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
```

---

# 9) Route config (optional but useful)

To let large bodies pass (audio/PDF), add a route-level config where needed:

```ts
// At top of a route file (Next.js App Router)
export const config = {
  api: {
    bodyParser: false,        // for form-data (busboy/manual) if needed
    responseLimit: "16mb",
  },
};
```

> For JSON routes with large input, use `export const maxDuration` and split chunks. For `multipart/form-data`, Next doesn’t use the JSON parser anyway.

---

# 10) Client tips (quick examples)

**Text translate**

```ts
await fetch("/api/translate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text, tgtLang: "hi" }) // src auto-detected
}).then(r=>r.json());
```

**Voice → text (STT)**

```ts
const fd = new FormData();
fd.append("audio", fileOrBlob, "clip.webm");
const r = await fetch("/api/stt", { method: "POST", body: fd });
const { text } = await r.json();
```

**Text → voice (TTS)**

```ts
const r = await fetch("/api/tts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Hello world" })
});
const blob = await r.blob();
const url = URL.createObjectURL(blob);
new Audio(url).play();
```

**PDF translate**

```ts
const fd = new FormData();
fd.append("pdf", file, file.name);
fd.append("tgtLang", "hi");
const r = await fetch("/api/pdf/translate", { method: "POST", body: fd });
const blob = await r.blob(); // translated_xx.txt
```

---

# 11) Quality, speed, and costs (add when ready)

* **Caching**: cache by hash of `(modelId, src, tgt, text)` using `node-cache` or Redis; return instantly on repeats.
* **Rate limit**: `@upstash/ratelimit` or store counts per IP/user in Mongo to prevent abuse.
* **Chunking**: PDFs and long text — 3–5k chars per chunk is safe; parallelize with `Promise.allSettled` (mind API limits).
* **Glossary**: replace protected terms with placeholders before translation and restore afterwards.
* **Observability**: log `latencyMs`, failures, top languages, daily volume.

---

# 12) Minimal UI (optional starter)

* Text area, language selectors (`src` autodetected after paste), “Swap”, “Copy”, “Clear”.
* File input for PDF.
* Record button for audio (MediaRecorder), preview, send to `/api/stt`, then translate result, then `/api/tts` to speak.

---

# 13) Common gotchas

* **Language codes**: M2M100 expects **ISO-639-1** (e.g., `en`, `hi`, `bn`). Your detector (`franc`) returns 639-3; convert via `langs`.
* **Model warmup**: first call can be slow; set `options.wait_for_model = true`.
* **TTS model I/O**: some TTS models want JSON (`{inputs: "text"}`); others take raw bytes. Check each model card and adjust `hfBinary` vs `hfJSON`.
* **PDFs without text**: scanned PDFs need OCR first (e.g., Tesseract) — otherwise `pdf-parse` returns empty text.

---

If you want, say the word and I’ll adapt this to **English ⇄ Indian languages** defaults, add a simple **recording UI**, and a **glossary pre/post-processor** so you can enforce terminology.
