import { NextRequest, NextResponse } from "next/server";
import { hfBinary } from "@/app/lib/Hugging_Face";

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