// Define default models for different translation types
export const DEFAULT_MODELS = {
  TRANSLATION: [
    "facebook/m2m100_418M",
    "facebook/nllb-200-distilled-600M",
    "Helsinki-NLP/opus-mt-en-ROMANCE"
  ],
  SPEECH_TO_TEXT: [
    "openai/whisper-base",
    "openai/whisper-small",
    "facebook/wav2vec2-base-960h"
  ],
  TEXT_TO_SPEECH: [
    "espnet/kan-bayashi-ljspeech_tacotron2",
    "facebook/fastspeech2-en-ljspeech",
    "microsoft/speecht5_tts"
  ]
};

// Enhanced JSON API with fallback mechanism
export async function hfJSONWithFallback(models: string[], body: any) {
  let lastError: Error | null = null;
  
  // Try each model in sequence until one succeeds
  for (const modelId of models) {
    try {
      const result = await hfJSON(modelId, body);
      return { result, modelUsed: modelId };
    } catch (error) {
      console.warn(`Model ${modelId} failed:`, error);
      lastError = error as Error;
      // Continue to next model
    }
  }
  
  // If all models failed, throw the last error
  throw lastError || new Error("All translation models failed");
}

// Enhanced Binary API with fallback mechanism
export async function hfBinaryWithFallback(models: string[], binary: ArrayBuffer, contentType?: string) {
  let lastError: Error | null = null;
  
  // Try each model in sequence until one succeeds
  for (const modelId of models) {
    try {
      const result = await hfBinary(modelId, binary, contentType);
      return { result, modelUsed: modelId };
    } catch (error) {
      console.warn(`Model ${modelId} failed:`, error);
      lastError = error as Error;
      // Continue to next model
    }
  }
  
  // If all models failed, throw the last error
  throw lastError || new Error("All binary processing models failed");
}

// Original single model functions (kept for backward compatibility)
export async function hfJSON(modelId: string, body: any) {
    const r = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        // NOTE: For larger inputs, consider increasing Next's route size limits (config below).
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}

export async function hfBinary(modelId: string, binary: ArrayBuffer, contentType?: string) {
    const r = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            ...(contentType ? { "Content-Type": contentType } : {}),
        },
        body: Buffer.from(binary),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.arrayBuffer();
}
