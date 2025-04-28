import type { Signal } from "@/features/connection/types/types";
import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";

type Response = {
  sdp: RTCSessionDescriptionInit;
  sessionId: string;
  type: string;
  candidate: RTCIceCandidateInit;
};

const sessionsDir = "/tmp/sessions";

if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { sessionId, type, sdp, candidate } = data as Response;

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Session ID is required" }), {
        status: 400,
      });
    }

    const sessionFilePath = path.join(sessionsDir, `${sessionId}.txt`);

    let currentSession: Signal = { candidates: [] };
    if (fs.existsSync(sessionFilePath)) {
      const fileData = fs.readFileSync(sessionFilePath, "utf-8");
      currentSession = JSON.parse(fileData);
    }

    if (sdp && sdp.type === "offer") currentSession.offer = sdp;
    if (sdp && sdp.type === "answer") currentSession.answer = sdp;
    if (candidate) currentSession.candidates.push(candidate);

    if (type === "source") {
      return new Response(JSON.stringify(currentSession));
    }
    fs.writeFileSync(sessionFilePath, JSON.stringify(currentSession));

    return new Response(
      JSON.stringify({ message: "Signaling data received", type })
    );
  } catch (e) {
    console.log(e);

    return new Response(
      JSON.stringify({
        error: "Internal server error processing signaling data",
      }),
      { status: 500 }
    );
  }
};
