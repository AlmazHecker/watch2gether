import type { Signal } from "@/features/connection/types/types";
import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";

const sessionsDir = "/tmp/sessions";

if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

function getFilePaths(sessionId: string) {
  return {
    offer: path.join(sessionsDir, `${sessionId}-offer.json`),
    answer: path.join(sessionsDir, `${sessionId}-answer.json`),
    candidates: path.join(sessionsDir, `${sessionId}-candidates.json`),
  };
}

function getOffer(sessionId: string) {
  const offerPath = getFilePaths(sessionId).offer;
  if (fs.existsSync(offerPath)) {
    return JSON.parse(fs.readFileSync(offerPath, "utf-8"));
  }
  return null;
}

function getAnswer(sessionId: string) {
  const answerPath = getFilePaths(sessionId).answer;
  if (fs.existsSync(answerPath)) {
    return JSON.parse(fs.readFileSync(answerPath, "utf-8"));
  }
  return null;
}

function getCandidates(sessionId: string): Signal["candidates"] {
  const candidatesPath = getFilePaths(sessionId).candidates;
  if (fs.existsSync(candidatesPath)) {
    return JSON.parse(fs.readFileSync(candidatesPath, "utf-8"));
  }
  return [];
}

function addCandidate(sessionId: string, candidate: Signal["candidates"][0]) {
  const candidatesPath = getFilePaths(sessionId).candidates;
  const candidates = getCandidates(sessionId);
  candidates.push(candidate);
  fs.writeFileSync(candidatesPath, JSON.stringify(candidates));
}

function getSessionData(sessionId: string): Signal {
  const createdAt = Date.now();

  return {
    createdAt,
    offer: getOffer(sessionId),
    answer: getAnswer(sessionId),
    candidates: getCandidates(sessionId),
  };
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

    if (type === "offer") {
      fs.writeFileSync(getFilePaths(sessionId).offer, JSON.stringify(sdp));
      console.log(`Stored offer for session ${sessionId}`);
    } else if (type === "answer") {
      fs.writeFileSync(getFilePaths(sessionId).answer, JSON.stringify(sdp));
      console.log(`Stored answer for session ${sessionId}`);
    } else if (type === "candidate" && candidate) {
      addCandidate(sessionId, candidate);
      console.log(`Added ICE candidate for session ${sessionId}`);
    } else if (type === "source") {
      const sessionData = getSessionData(sessionId);
      return new Response(JSON.stringify(sessionData), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Invalid message type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

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
