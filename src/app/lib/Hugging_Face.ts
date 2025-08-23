export async function hfjson(model_id: String, body: any) {
    const r = await fetch(`https://api-inference.huggingface.co/models/${model_id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer{$process.env.HF_TOKEN}`
        },
        body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();

}
