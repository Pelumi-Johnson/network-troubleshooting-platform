import { labSessionsService } from "./labSessionsService";
import { labsService } from "./labsService";

class HintService {
  getNextHint(sessionId: string) {
    const session = labSessionsService.getSession(sessionId);

    if (!session) {
      return {
        ok: false,
        message: "Session not found"
      };
    }

    const lab = labsService.getLabById(session.labId);

    if (!lab) {
      return {
        ok: false,
        message: "Lab definition not found"
      };
    }

    if (session.status === "completed") {
      return {
        ok: false,
        message: "This lab is already completed."
      };
    }

    const nextHintIndex = session.hintsUsed;

    if (nextHintIndex >= lab.hints.length) {
      return {
        ok: false,
        message: "No more hints available."
      };
    }

    const hint = lab.hints[nextHintIndex];

    session.hintsUsed += 1;

    const penalty = lab.scoring.hintPenalty;
    session.score = Math.max(0, session.score - penalty);

    return {
      ok: true,
      hintLevel: hint.level,
      text: hint.text,
      score: session.score,
      hintsUsed: session.hintsUsed,
      remainingHints: lab.hints.length - session.hintsUsed
    };
  }
}

export const hintService = new HintService();