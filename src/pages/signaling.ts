import type { Signal } from "@/features/connection/types/types";
import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";

const sessionsDir = "/tmp/sessions";

if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { sessionId, type, sdp, candidate } = data;

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Session ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sessionFilePath = path.join(sessionsDir, `${sessionId}.txt`);

    let currentSession: Signal = { createdAt: Date.now(), candidates: [] };
    if (fs.existsSync(sessionFilePath)) {
      const fileData = fs.readFileSync(sessionFilePath, "utf-8");
      currentSession = JSON.parse(fileData);
    }

    if (type === "offer") {
      currentSession.offer = sdp;
    } else if (type === "answer") {
      currentSession.answer = sdp;
    } else if (type === "candidate" && candidate) {
      currentSession.candidates.push(candidate);
      currentSession.offer = sdp;
    } else if (type === "source") {
      return new Response(JSON.stringify(currentSession));
    } else {
      return new Response(JSON.stringify({ error: "Invalid message type" }), {
        status: 400,
      });
    }

    fs.writeFileSync(sessionFilePath, JSON.stringify(currentSession));

    return new Response(
      JSON.stringify({ message: "Signaling data received", type })
    );
  } catch (_e) {
    return new Response(
      JSON.stringify({
        error: "Internal server error processing signaling data",
      }),
      { status: 500 }
    );
  }
};
