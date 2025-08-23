import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/mongo"
import Translation from "@/app/models/Translation";
import { hfjson } from "@/app/lib/Hugging_Face";
import { detectISO1, safeLang } from "@/app/lib/lang";
import { z } from "zod";

export const maxDuration = 60;

const schema = z.object({
  text: z.string().min(1),
  srcLang: z.string().optional(),
  tgtLang: z.string().min(2).max(5),
  modelId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { text, srcLang, tgtLang, modelId } = schema.parse(payload);
    const MAX = Number(process.env.MAX_CHARS_PER_REQ);
    if (text.length > MAX) {
      return NextResponse.json({ error: `Text too long (>${MAX})` }, { status: 413 });
    }
    const detected = srcLang || detectISO1(text);
    const src = safeLang(detected, "en");
    const tgt = safeLang(tgtLang, "hi");
    const started = Date.now();
    const data = await hfjson(modelId, {
      inputs: text,
      parameters: { srcLang: src, tgtLang: tgt }
    })

    let result = "";
    if (Array.isArray(data)) {
      result = data[0]?.translation_text || data[0]?.generated_text || "";
    }
    else {
      result = data?.translation_text || data?.generated_text || "";
    }

    const latency = Date.now() - started;
    await dbConnect()
    await Translation.create({ srcLang: src, tgtLang: tgt, source: text, result, latency });
    return NextResponse.json({srcLang:src,tgtLang:tgt,result,latency})
  

  }
  catch(e:any){
    return NextResponse.json({error:e.message},{status:500})
  }
}