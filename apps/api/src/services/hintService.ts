import { labsService } from "./labsService";
import { labSessionsService } from "./labSessionsService";

class HintService {
  async getHint(sessionId: string) {
    const session = await labSessionsService.getSession(sessionId);

    if (!session) {
      return {
        ok: false,
        statusCode: 404,
        message: "Session not found.",
      };
    }

    if (session.status === "completed") {
      return {
        ok: false,
        statusCode: 400,
        message: "Lab is already completed.",
      };
    }

    const lab = labsService.getLabById(session.labId);

    if (!lab) {
      return {
        ok: false,
        statusCode: 404,
        message: "Lab definition not found.",
      };
    }

    const hints = lab.hints || [];
    const maxHints = lab.scoring?.maxHints || hints.length;

    if (session.hintsUsed >= maxHints || session.hintsUsed >= hints.length) {
      return {
        ok: false,
        statusCode: 400,
        message: "No more hints available.",
      };
    }

    const hint = hints[session.hintsUsed];

    session.hintsUsed += 1;
    session.score = Math.max(
      0,
      session.score - (lab.scoring?.hintPenalty || 0)
    );

    const updatedSession = await labSessionsService.updateSession(session);

    return {
      ok: true,
      statusCode: 200,
      hintLevel: hint.level,
      text: hint.text,
      score: updatedSession.score,
      hintsUsed: updatedSession.hintsUsed,
      remainingHints: Math.max(0, maxHints - updatedSession.hintsUsed),
    };
  }
}

export const hintService = new HintService();