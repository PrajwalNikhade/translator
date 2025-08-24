import { NextRequest, NextResponse } from "next/server";
import { hfBinary, hfBinaryWithFallback, DEFAULT_MODELS } from "@/app/lib/Hugging_Face";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const form = await req.formData();
        const file = form.get("audio") as File | null;
        if (!file) return NextResponse.json({ error: "audio file missing" }, { status: 400 });

        const buf = await file.arrayBuffer();
        const contentType = file.type || "audio/mpeg";
        
        // Get model IDs if provided, otherwise use defaults
        const modelIdsStr = form.get("modelIds") as string || "";
        const modelIds = modelIdsStr ? modelIdsStr.split(",") : DEFAULT_MODELS.SPEECH_TO_TEXT;

        // Use fallback mechanism to try multiple models
        const { result: out, modelUsed } = await hfBinaryWithFallback(modelIds, buf, contentType);

        // Whisper returns JSON (string) or text; try JSON first:
        const txt = Buffer.from(out).toString("utf-8");
        let result: any;
        try { result = JSON.parse(txt); } catch { result = { text: txt }; }

        return NextResponse.json({ 
            text: result.text || txt,
            modelUsed
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}