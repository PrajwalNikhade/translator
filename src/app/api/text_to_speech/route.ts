import { NextRequest, NextResponse } from "next/server";
import { hfJSON, hfBinary } from "@/app/lib/Hugging_Face";
import { z } from "zod";

const DEFAULT_Text_to_Speech = "espnet/kan-bayashi-ljspeech_tacotron2";
export const maxDuration = 60;
export async function POST(req: NextRequest) {
    try {
        const { text, modelID } = z.object({
            text: z.string().min(1),
            modelID: z.string().default(DEFAULT_Text_to_Speech),

        }).parse(await req.json());

        const audio = await hfBinary(modelID || DEFAULT_Text_to_Speech, new TextEncoder().encode(text).buffer)
        return new NextResponse(Buffer.from(audio), {
            headers: {
                "Content-Type": "audio/wav",
            },
        })
    }
    catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })

    }
}