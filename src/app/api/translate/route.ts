import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/mongo";
import Translation from "@/app/models/Translation";
import { hfJSON, hfJSONWithFallback, DEFAULT_MODELS } from "@/app/lib/Hugging_Face";
import { detectISO1, safeLang } from "@/app/lib/lang";
import { z } from "zod";

export const maxDuration = 60;

// More flexible schema to handle different possible field names
const schema = z.object({
  text: z.string().min(1),
  // Handle multiple possible field names for source language
  source: z.string().optional(),
  sourceLanguage: z.string().optional(), 
  srcLang: z.string().optional(),
  // Handle multiple possible field names for target language  
  target: z.string().optional(),
  targetLanguage: z.string().optional(),
  tgtLang: z.string().optional(),
  // Model ID or IDs
  modelId: z.string().optional(),
  modelIds: z.array(z.string()).optional(),
  // Content type (text, voice, pdf)
  contentType: z.enum(["text", "voice", "pdf"]).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log("Received payload:", JSON.stringify(payload, null, 2)); // Debug log
    
    const parsed = schema.parse(payload);
    const { text, modelId, modelIds, contentType = "text" } = parsed;
    
    // Extract source and target from any of the possible field names
    const sourceInput = parsed.source || parsed.sourceLanguage || parsed.srcLang;
    const targetInput = parsed.target || parsed.targetLanguage || parsed.tgtLang || "hi"; // Default to Hindi
    
    const MAX = Number(process.env.MAX_CHARS_PER_REQ || 5000);
    if (text.length > MAX) {
      return NextResponse.json({ error: `Text too long (>${MAX})` }, { status: 413 });
    }
    
    // Handle auto-detection for source language
    const detected = (sourceInput && sourceInput !== 'auto') ? sourceInput : detectISO1(text);
    const src = safeLang(detected, "en");
    const tgt = safeLang(targetInput, "hi");
    
    console.log(`Translating from ${src} to ${tgt}`); // Debug log
    
    const started = Date.now();
    
    // Determine which models to use
    let modelsToUse: string[] = [];
    
    if (modelIds && modelIds.length > 0) {
      // Use provided model IDs in order
      modelsToUse = modelIds;
    } else if (modelId) {
      // Use single model ID with default fallbacks
      modelsToUse = [modelId, ...DEFAULT_MODELS.TRANSLATION.filter(m => m !== modelId)];
    } else {
      // Use default translation models
      modelsToUse = DEFAULT_MODELS.TRANSLATION;
    }
    
    try {
      // Use the fallback mechanism to try multiple models
      const { result: data, modelUsed } = await hfJSONWithFallback(modelsToUse, {
        inputs: text,
        parameters: { src_lang: src, tgt_lang: tgt }
      });

      let result = "";
      if (Array.isArray(data)) {
        result = data[0]?.translation_text || data[0]?.generated_text || "";
      } else {
        result = data?.translation_text || data?.generated_text || "";
      }

      if (!result) {
        throw new Error("No translation result received from Hugging Face");
      }

      const latency = Date.now() - started;
      
      // Connect to database and save translation
      try {
        await dbConnect();
        await Translation.create({ 
          source_language: src,
          target_language: tgt,
          source_text: text,
          result, 
          model: modelUsed,
          latency 
        });
      } catch (dbError) {
        console.error("Database save error (non-fatal):", dbError);
        // Continue even if DB save fails
      }
      
      // Return response matching what frontend expects
      return NextResponse.json({
        translatedText: result,
        sourceLanguage: src,
        targetLanguage: tgt,
        modelUsed,
        latency,
        success: true
      });

    } catch (hfError) {
      console.error("Translation service error:", hfError);
      throw new Error(`Translation service error: ${hfError.message}`);
    }

  } catch(e: any) {
    console.error("Translation API error:", e);
    
    if (e.name === 'ZodError') {
      return NextResponse.json({ 
        error: "Invalid request format", 
        details: e.errors,
        received: await req.clone().json().catch(() => ({}))
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: e.message || "Translation failed",
      success: false 
    }, { status: 500 });
  }
}