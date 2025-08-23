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
