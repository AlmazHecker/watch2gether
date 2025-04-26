import type { Signal } from "@/features/connection/types/types";
import type { APIRoute } from "astro";

const signalingData = new Map<string, Signal>();

// Clean up типа
const EXPIRATION_TIME = 30 * 60 * 1000; // 30 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [sessionId, data] of signalingData.entries()) {
      if (now - data.createdAt > EXPIRATION_TIME) {
        signalingData.delete(sessionId);
        console.log(`Session ${sessionId} expired and removed`);
      }
    }
  },
  5 * 60 * 1000 // 5 minutes check
);

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

    // Always clone current data safely
    const currentSession = signalingData.get(sessionId) || {
      createdAt: Date.now(),
      candidates: [],
    };

    if (type === "offer") {
      currentSession.offer = sdp;
      console.log(`Stored offer for session ${sessionId}`);
    } else if (type === "answer") {
      currentSession.answer = sdp;
      console.log(`Stored answer for session ${sessionId}`);
    } else if (type === "candidate" && candidate) {
      currentSession.candidates.push(candidate);
      console.log(
        `Added ICE candidate for session ${sessionId}, total: ${currentSession.candidates.length}`
      );
    } else {
      return new Response(JSON.stringify({ error: "Invalid message type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    signalingData.set(sessionId, currentSession);

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

    const data = signalingData.get(sessionId);
    console.log(data, "Requested session data");

    if (!data) {
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
