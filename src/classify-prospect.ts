import { TypeSafeClient } from "@typesafe-ai/sdk";
import { decideSegment, type Decision } from "./decide-segment.ts";
import { prospectQuestions } from "./prospect-questions.ts";

export interface Prospect {
  message: string;
  /** Page the form was submitted from, e.g. "bourses". Omit if unknown. */
  sourcePage?: string;
  country?: string;
}

// Reads TYPESAFE_API_KEY from the environment; keep this module server-side.
const client = new TypeSafeClient();

/** One request, all questions. A failed call throws; it is never treated as an answer. */
export async function classifyProspect(prospect: Prospect): Promise<Decision> {
  const state = {
    prospect: {
      message: prospect.message,
      ...(prospect.sourcePage && { source_page: prospect.sourcePage }),
      ...(prospect.country && { country: prospect.country }),
    },
  };

  const { answers } = await client.systemOne({ state, questions: prospectQuestions });

  return decideSegment({
    isSpamOrOffTopic: answers.isSpamOrOffTopic.noul,
    wantsToStudyInRussia: answers.wantsToStudyInRussia.noul,
    readyToApply: answers.readyToApply.noul,
    asksToBeContacted: answers.asksToBeContacted.noul,
    asksAboutScholarship: answers.asksAboutScholarship.noul,
    statesStudyLevel: answers.statesStudyLevel.noul,
    studyLevel: answers.studyLevel.choice,
    urgency: answers.urgency.score,
  });
}
