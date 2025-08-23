import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { hfJSON } from "@/app/lib/Hugging_Face";
import { detectISO1, safeLang } from "@/app/lib/lang";


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