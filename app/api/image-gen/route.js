import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { prompt, model, aspectRatio } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
        }

        console.log(`[Cloud Engine] Generating Image: ${prompt} | Model: ${model}`);

        // Simulate cloud generation time
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Use Pollinations for the actual image URL (acting as our cloud generation service)
        const seed = Math.floor(Math.random() * 1e9);
        let w = 1024, h = 1024;
        if (aspectRatio === '9:16') { w = 768; h = 1344; }
        else if (aspectRatio === '16:9') { w = 1344; h = 768; }

        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ", cinematic, masterpiece, highly detailed")}?width=${w}&height=${h}&seed=${seed}&nologo=true&model=flux`;

        return NextResponse.json({
            success: true,
            imageUrl: imageUrl,
            engine: 'Cloud-Image-Core-v1'
        });

    } catch (error) {
        console.error('Image Gen API Error:', error);
        return NextResponse.json({ error: 'Image generation failed on server' }, { status: 500 });
    }
}
