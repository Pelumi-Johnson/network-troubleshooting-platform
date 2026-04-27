import { labSessionsService } from "./labSessionsService";
import { labsService } from "./labsService";

function getHintPenalty(lab: any) {
  return lab.scoring?.hintPenalty ?? 10;
}

function getMaxHints(lab: any) {
  return lab.scoring?.maxHints ?? 3;
}

class HintService {
  async getHint(sessionId: string) {
    const session = await labSessionsService.getSession(sessionId);

    if (!session) {
      return {
        ok: false,
        message: "Session not found",
      };
    }

    const lab = labsService.getLabById(session.labId);

    if (!lab) {
      return {
        ok: false,
        message: "Lab definition not found",
      };
    }

    if (session.status === "completed") {
      return {
        ok: false,
        message: "This lab is already completed.",
      };
    }

    if (session.status === "abandoned") {
      return {
        ok: false,
        message: "This session was abandoned. Start a new session.",
      };
    }

    const maxHints = getMaxHints(lab);

    if (session.hintsUsed >= maxHints) {
      return {
        ok: false,
        message: "No more hints available for this lab.",
      };
    }

    const nextHintIndex = session.hintsUsed;
    const hint = lab.hints?.[nextHintIndex];

    if (!hint) {
      return {
        ok: false,
        message: "No hint available.",
      };
    }

    const penalty = getHintPenalty(lab);

    session.hintsUsed += 1;
    session.score = Math.max(0, session.score - penalty);

    await labSessionsService.updateSession(session);

    return {
      ok: true,
      text: hint.text,
      hintsUsed: session.hintsUsed,
      score: session.score,
      penalty,
    };
  }
}

export const hintService = new HintService();