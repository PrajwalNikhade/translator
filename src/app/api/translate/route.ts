import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, source, target } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text to translate is required' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=${source}|${target}&de=a.gemini.user@gmail.com`
    );

    if (!response.ok) {
      throw new Error('Translation service unavailable');
    }

    const data = await response.json();

    if (data.responseStatus === 200) {
      return NextResponse.json({ translatedText: data.responseData.translatedText });
    } else {
      throw new Error(data.responseDetails || 'Translation failed');
    }
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json({ error: 'Translation failed. Please try again later.' }, { status: 500 });
  }
}
