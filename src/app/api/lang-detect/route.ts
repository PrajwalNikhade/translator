import { NextRequest, NextResponse } from "next/server"; import { detectISO1, safeLang } from "@/app/lib/lang";
import z from "zod";

export async function POST(req: NextRequest) {
    const { text } = z.object(
        {
            text: z.string().min(1)
        }).parse(await req.json())

    const detected = detectISO1(text);
    return NextResponse.json(
        {
            iso1: safeLang(detected, "en"),
            raw: detected

        })

}