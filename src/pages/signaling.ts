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

    console.log(`Received ${type} for session ${sessionId}`);

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

    fs.writeFileSync(sessionFilePath, JSON.stringify(currentSession));
    console.log(
      `Saved signaling data for session ${sessionId} to ${sessionFilePath}`
    );

    return new Response(
      JSON.stringify({ message: "Signaling data received", type }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error processing signaling request:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error processing signaling data",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Session ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sessionFilePath = path.join(sessionsDir, `${sessionId}.txt`);
    if (!fs.existsSync(sessionFilePath)) {
      return new Response(
        JSON.stringify({
          message: "No data found for this session",
          sessionId,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = JSON.parse(fs.readFileSync(sessionFilePath, "utf-8"));

    console.log(
      `Returning data for session ${sessionId}: offer=${!!data.offer}, answer=${!!data.answer}, candidates=${data.candidates.length}`
    );

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error processing GET request:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error fetching signaling data",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
