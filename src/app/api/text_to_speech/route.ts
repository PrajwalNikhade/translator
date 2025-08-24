import { NextRequest, NextResponse } from "next/server";
import { hfJSON, hfBinary, hfBinaryWithFallback, DEFAULT_MODELS } from "@/app/lib/Hugging_Face";
import { z } from "zod";

export const maxDuration = 60;
export async function POST(req: NextRequest) {
    try {
        const { text, modelID, modelIds } = z.object({
            text: z.string().min(1),
            modelID: z.string().optional(),
            modelIds: z.array(z.string()).optional()
        }).parse(await req.json());
        
        // Determine which models to use
        let modelsToUse: string[] = [];
        
        if (modelIds && modelIds.length > 0) {
            // Use provided model IDs in order
            modelsToUse = modelIds;
        } else if (modelID) {
            // Use single model ID with default fallbacks
            modelsToUse = [modelID, ...DEFAULT_MODELS.TEXT_TO_SPEECH.filter(m => m !== modelID)];
        } else {
            // Use default TTS models
            modelsToUse = DEFAULT_MODELS.TEXT_TO_SPEECH;
        }

        const { result: audio, modelUsed } = await hfBinaryWithFallback(
            modelsToUse, 
            new TextEncoder().encode(text).buffer
        );
        
        return new NextResponse(Buffer.from(audio), {
            headers: {
                "Content-Type": "audio/wav",
                "X-Model-Used": modelUsed
            },
        });
    }
    catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}