import type { Signal } from "@/features/connection/types/types";
import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";
import proper from "proper-lockfile";

const sessionsDir = "/tmp/sessions";

if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

async function readSessionData(sessionId: string): Promise<Signal> {
  const sessionFilePath = path.join(sessionsDir, `${sessionId}.txt`);

  if (!fs.existsSync(sessionFilePath)) {
    const defaultSession: Signal = { createdAt: Date.now(), candidates: [] };
    fs.writeFileSync(sessionFilePath, JSON.stringify(defaultSession));
    return defaultSession;
  }

  const release = await proper.lock(sessionFilePath, {
    retries: 5,
    stale: 10000,
  });
  try {
    const fileData = fs.readFileSync(sessionFilePath, "utf-8");
    return JSON.parse(fileData);
  } finally {
    await release();
  }
}

async function writeSessionData(
  sessionId: string,
  data: Signal
): Promise<void> {
  const sessionFilePath = path.join(sessionsDir, `${sessionId}.txt`);

  const release = await proper.lock(sessionFilePath, {
    retries: 5,
    stale: 10000,
  });
  try {
    fs.writeFileSync(sessionFilePath, JSON.stringify(data));
    console.log(
      `Saved signaling data for session ${sessionId} to ${sessionFilePath}`
    );
  } finally {
    await release();
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { sessionId, type, sdp, candidate } = data;

    console.log(`Received ${type} for session ${sessionId}`);

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Session ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (type === "source") {
      const currentSession = await readSessionData(sessionId);
      return new Response(JSON.stringify(currentSession));
    }

    const currentSession = await readSessionData(sessionId);

    if (type === "offer") {
      currentSession.offer = sdp;
      console.log(`Stored offer for session ${sessionId}`);
    } else if (type === "answer") {
      currentSession.answer = sdp;
      console.log(`Stored answer for session ${sessionId}`);
    } else if (type === "candidate" && candidate) {
      currentSession.candidates.push(candidate);
      console.log(`Added ICE candidate for session ${sessionId}`);
    } else {
      return new Response(JSON.stringify({ error: "Invalid message type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await writeSessionData(sessionId, currentSession);

    return new Response(
      JSON.stringify({ message: "Signaling data received", type }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error processing signaling request:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error processing signaling data",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
