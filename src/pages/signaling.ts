import type { APIRoute } from "astro";

// Use a Map to store signaling data with session expiration
const signalingData = new Map<
  string,
  {
    createdAt: number;
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    candidates: RTCIceCandidateInit[];
  }
>();

// Clean up old sessions periodically
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
  5 * 60 * 1000
); // Check every 5 minutes

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

    // Initialize session data if it doesn't exist
    if (!signalingData.has(sessionId)) {
      signalingData.set(sessionId, {
        createdAt: Date.now(),
        candidates: [],
      });
    }

    const sessionData = signalingData.get(sessionId)!;

    // Handle different types of messages
    switch (type) {
      case "offer":
        sessionData.offer = sdp;
        console.log(`Stored offer for session ${sessionId}`);
        break;

      case "answer":
        sessionData.answer = sdp;
        console.log(`Stored answer for session ${sessionId}`);
        break;

      case "candidate":
        if (candidate) {
          sessionData.candidates.push(candidate);
          console.log(
            `Added ICE candidate for session ${sessionId}, total: ${sessionData.candidates.length}`
          );
        }
        break;

      default:
        return new Response(JSON.stringify({ error: "Invalid message type" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }

    console.log(sessionData, "SESSION Data");

    // Update session data
    signalingData.set(sessionId, sessionData);

    // Return success
    return new Response(
      JSON.stringify({
        message: "Signaling data received",
        type: type,
      }),
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

    // Return the session data
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
