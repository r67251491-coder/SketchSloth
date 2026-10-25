import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an elite frontend developer and UI/UX designer. Your task is to convert the provided hand-drawn wireframe into a single, fully functional Next.js React component using Tailwind CSS and lucide-react icons.

CRITICAL INSTRUCTIONS:
1. MULTI-SCREEN HANDLING: If the image contains multiple screens, a grid of sketches, or a complex layout, render a main container with a responsive CSS grid (e.g., grid-cols-1 md:grid-cols-3) and build EACH screen as an individual, mobile-proportioned card within that grid. Do not skip any sections. Parse all legible text and recreate the intended structure.
2. BRUTALIST DESIGN SYSTEM: You must strictly apply a high-contrast brutalist aesthetic. 
   - Colors: Stark white (bg-white), black text, and bold yellow accents (bg-yellow-400).
   - Borders & Corners: Thick black borders (border-4 border-black) and sharp 90-degree corners ONLY (rounded-none).
   - Shadows: Solid, hard black drop shadows on cards and buttons (shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]).
   - Typography: Use uppercase, ultra-bold fonts (font-black, tracking-tight) for all headers and buttons.
3. INTERACTIVITY: Add basic hover states to interactive elements (e.g., hover:-translate-y-1, hover:bg-yellow-300).
4. NO HALLUCINATIONS: DO NOT output bounding boxes, object coordinates, or arrays. 
5. OUTPUT FORMAT: Output ONLY valid, raw tsx code enclosed in a single markdown block. Start immediately with \`\`\`tsx and end with \`\`\`. Do not include any conversational text, explanations, or greetings before or after the code block.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, model = "llama3.2-vision" } = body;

    if (!image) {
      return NextResponse.json(
        { error: "No image payload provided" },
        { status: 400 }
      );
    }

    // Strip data URL scheme prefix if present (e.g. data:image/jpeg;base64,)
    const cleanBase64 = image.replace(/^data:image\/[a-z0-9+]+;base64,/i, "").trim();

    // Query available models from Ollama
    let targetModel = model;
    try {
      const tagsRes = await fetch("http://127.0.0.1:11434/api/tags");
      if (tagsRes.ok) {
        const data = await tagsRes.json();
        const available: string[] = (data.models || []).map((m: { name?: string; model?: string }) => m.name || m.model || "");
        if (available.length > 0 && !available.some((n) => n.includes(targetModel))) {
          // If requested model isn't installed, pick an available vision model
          const fallback =
            available.find((n) => n.includes("moondream")) ||
            available.find((n) => n.includes("llama3.2-vision")) ||
            available.find((n) => n.includes("llava")) ||
            available[0];
          if (fallback) {
            console.log(`Model '${targetModel}' not found in Ollama. Falling back to '${fallback}'.`);
            targetModel = fallback;
          }
        }
      }
    } catch {
      // Ignore tags error, proceed with original model
    }

    const payload = {
      model: targetModel,
      messages: [
        {
          role: "system",
          content:
            "You are an expert React developer. You ONLY write code. NEVER output arrays, bounding boxes, or coordinates. Output strictly valid TSX code inside a single ```tsx block.",
        },
        {
          role: "user",
          content:
            "Convert this wireframe into a responsive Tailwind CSS React component. Do not include any explanations.",
          images: [cleanBase64],
        },
      ],
      stream: true,
      options: {
        temperature: 0.0,
        top_p: 0.95,
      },
    };

    // Forward to local Ollama daemon
    let ollamaResponse: Response;
    try {
      ollamaResponse = await fetch("http://127.0.0.1:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (fetchErr: unknown) {
      console.warn("Could not connect to local Ollama on 127.0.0.1:11434:", fetchErr);
      return NextResponse.json(
        {
          error: "OLLAMA_OFFLINE",
          message:
            "Local Ollama engine is not running on http://127.0.0.1:11434. Start it via '$env:OLLAMA_ORIGINS=\"*\"; ollama serve'.",
        },
        { status: 503 }
      );
    }

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      return NextResponse.json(
        {
          error: "OLLAMA_ERROR",
          status: ollamaResponse.status,
          message: errorText || "Ollama returned an error status.",
        },
        { status: ollamaResponse.status }
      );
    }

    const responseBody = ollamaResponse.body;
    if (!responseBody) {
      return NextResponse.json(
        { error: "No response body from Ollama" },
        { status: 500 }
      );
    }

    // Create a TransformStream to parse Ollama's NDJSON chunks and yield raw text tokens
    const reader = responseBody.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    let buffer = "";

    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            if (buffer.trim()) {
              try {
                const parsed = JSON.parse(buffer.trim());
                if (parsed.message?.content) {
                  controller.enqueue(encoder.encode(parsed.message.content));
                }
              } catch {
                // Ignore incomplete trailing JSON
              }
            }
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the last incomplete fragment in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const json = JSON.parse(trimmed);
              if (json.message?.content) {
                controller.enqueue(encoder.encode(json.message.content));
              }
              if (json.done) {
                controller.close();
                return;
              }
            } catch {
              // skip unparseable fragments
            }
          }
        } catch (err) {
          controller.error(err);
        }
      },
      cancel() {
        reader.cancel();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    console.error("API /api/generate unhandled error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
