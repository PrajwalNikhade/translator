import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/mongo";
import Translation from "@/app/models/Translation";
import { hfJSON, hfBinary, hfJSONWithFallback, hfBinaryWithFallback, DEFAULT_MODELS } from "@/app/lib/Hugging_Face";
import { detectISO1, safeLang } from "@/app/lib/lang";
import pdfParse from "pdf-parse";

export const maxDuration = 300; // Longer timeout for processing larger files

// Helper function to chunk text for processing large content
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
        const formData = await req.formData();
        const contentType = formData.get("contentType") as string || "text";
        const targetLang = formData.get("targetLang") as string || "hi";
        const sourceLang = formData.get("sourceLang") as string || "auto";
        
        // Get model IDs if provided, otherwise use defaults
        const modelIdsStr = formData.get("modelIds") as string || "";
        const modelIds = modelIdsStr ? modelIdsStr.split(",") : [];
        
        let modelsToUse: string[] = [];
        let extractedText = "";
        let sourceLanguage = sourceLang;
        
        // Process based on content type
        switch (contentType) {
            case "text": {
                extractedText = formData.get("text") as string || "";
                if (!extractedText) {
                    return NextResponse.json({ error: "Text is required" }, { status: 400 });
                }
                
                modelsToUse = modelIds.length > 0 ? modelIds : DEFAULT_MODELS.TRANSLATION;
                break;
            }
            
            case "voice": {
                const audioFile = formData.get("audio") as File | null;
                if (!audioFile) {
                    return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
                }
                
                // First convert speech to text
                const audioBuf = await audioFile.arrayBuffer();
                const contentType = audioFile.type || "audio/mpeg";
                
                const sttModels = modelIds.length > 0 ? modelIds : DEFAULT_MODELS.SPEECH_TO_TEXT;
                const { result: audioResult, modelUsed: sttModelUsed } = await hfBinaryWithFallback(sttModels, audioBuf, contentType);
                
                const txt = Buffer.from(audioResult).toString("utf-8");
                let result: any;
                try { result = JSON.parse(txt); } catch { result = { text: txt }; }
                
                extractedText = result.text || txt;
                if (!extractedText.trim()) {
                    return NextResponse.json({ error: "No speech detected" }, { status: 400 });
                }
                
                modelsToUse = DEFAULT_MODELS.TRANSLATION;
                break;
            }
            
            case "pdf": {
                const pdfFile = formData.get("pdf") as File | null;
                if (!pdfFile) {
                    return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
                }
                
                const pdfBuf = Buffer.from(await pdfFile.arrayBuffer());
                const parsed = await pdfParse(pdfBuf);
                extractedText = (parsed.text || "").trim();
                
                if (!extractedText) {
                    return NextResponse.json({ error: "No text found in PDF" }, { status: 422 });
                }
                
                modelsToUse = modelIds.length > 0 ? modelIds : DEFAULT_MODELS.TRANSLATION;
                break;
            }
            
            default:
                return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
        }
        
        // Auto-detect source language if needed
        if (sourceLanguage === "auto") {
            sourceLanguage = detectISO1(extractedText) || "en";
        }
        
        const src = safeLang(sourceLanguage, "en");
        const tgt = safeLang(targetLang, "hi");
        
        const started = Date.now();
        let translatedText = "";
        let modelUsed = "";
        
        // Handle large text by chunking if needed
        if (extractedText.length > Number(process.env.MAX_CHARS_PER_REQ || 5000)) {
            const chunks = chunkText(extractedText);
            const translatedChunks: string[] = [];
            
            for (const chunk of chunks) {
                const { result: data, modelUsed: model } = await hfJSONWithFallback(modelsToUse, {
                    inputs: chunk,
                    parameters: { src_lang: src, tgt_lang: tgt },
                    options: { wait_for_model: true }
                });
                
                let chunkResult = "";
                if (Array.isArray(data)) {
                    chunkResult = data[0]?.translation_text || data[0]?.generated_text || "";
                } else {
                    chunkResult = data?.translation_text || data?.generated_text || "";
                }
                
                translatedChunks.push(chunkResult);
                modelUsed = model; // Use the last successful model
            }
            
            translatedText = translatedChunks.join("\n\n");
        } else {
            // Translate the text directly
            const { result: data, modelUsed: model } = await hfJSONWithFallback(modelsToUse, {
                inputs: extractedText,
                parameters: { src_lang: src, tgt_lang: tgt },
                options: { wait_for_model: true }
            });
            
            if (Array.isArray(data)) {
                translatedText = data[0]?.translation_text || data[0]?.generated_text || "";
            } else {
                translatedText = data?.translation_text || data?.generated_text || "";
            }
            
            modelUsed = model;
        }
        
        if (!translatedText) {
            throw new Error("No translation result received");
        }
        
        const latency = Date.now() - started;
        
        // Save translation to database
        try {
            await dbConnect();
            await Translation.create({
                source_language: src,
                target_language: tgt,
                source_text: extractedText.substring(0, 1000), // Save only first 1000 chars for large texts
                result: translatedText.substring(0, 1000), // Save only first 1000 chars for large texts
                model: modelUsed,
                latency
            });
        } catch (dbError) {
            console.error("Database save error (non-fatal):", dbError);
            // Continue even if DB save fails
        }
        
        // For voice translations, optionally convert back to speech
        if (contentType === "voice" && formData.get("returnAudio") === "true") {
            try {
                const ttsModels = DEFAULT_MODELS.TEXT_TO_SPEECH;
                const { result: audioBuffer, modelUsed: ttsModelUsed } = await hfBinaryWithFallback(
                    ttsModels,
                    new TextEncoder().encode(translatedText).buffer
                );
                
                return new NextResponse(Buffer.from(audioBuffer), {
                    headers: {
                        "Content-Type": "audio/wav",
                        "X-Source-Language": src,
                        "X-Target-Language": tgt,
                        "X-Translation-Model": modelUsed,
                        "X-TTS-Model": ttsModelUsed,
                        "X-Latency": latency.toString()
                    }
                });
            } catch (ttsError) {
                console.error("TTS error:", ttsError);
                // Fall back to returning text if TTS fails
            }
        }
        
        // For PDF, return as downloadable text file
        if (contentType === "pdf") {
            return new NextResponse(translatedText, {
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "Content-Disposition": `attachment; filename="translated_${tgt}.txt"`
                }
            });
        }
        
        // Default response for text and fallback for other types
        return NextResponse.json({
            translatedText,
            sourceLanguage: src,
            targetLanguage: tgt,
            modelUsed,
            contentType,
            latency,
            success: true
        });
        
    } catch (e: any) {
        console.error("Unified translation API error:", e);
        return NextResponse.json({
            error: e.message || "Translation failed",
            success: false
        }, { status: 500 });
    }
}