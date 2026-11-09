/**
 * The decision: a truth table over Jev's judgments. No model calls here.
 */
import { THRESHOLDS } from "./thresholds.ts";

const { YES, NO } = THRESHOLDS;

export type Segment = "discard" | "not_a_prospect" | "review" | "hot" | "warm" | "nurture";

export interface Signals {
  isSpamOrOffTopic: number;
  wantsToStudyInRussia: number;
  readyToApply: number;
  asksToBeContacted: number;
  asksAboutScholarship: number;
  statesStudyLevel: number;
  studyLevel: string;
  urgency: number; // 0..3
}

export interface Decision {
  segment: Segment;
  reason: string;
  tags: { studyLevel?: string; scholarship: boolean };
}

const isYes = (p: number) => p >= YES;
const isNo = (p: number) => p <= NO;

export function decideSegment(s: Signals): Decision {
  const tags = {
    studyLevel: isYes(s.statesStudyLevel) ? s.studyLevel : undefined,
    scholarship: isYes(s.asksAboutScholarship),
  };
  const out = (segment: Segment, reason: string): Decision => ({ segment, reason, tags });

  // Filters first. A signal in the unsettled band goes to a person.
  if (isYes(s.isSpamOrOffTopic)) return out("discard", "spam or off topic");
  if (!isNo(s.isSpamOrOffTopic)) return out("review", "spam question unsettled");
  if (isNo(s.wantsToStudyInRussia)) return out("not_a_prospect", "does not want to study in Russia");
  if (!isYes(s.wantsToStudyInRussia)) return out("review", "study-in-Russia intent unsettled");

  // A real prospect. Hot needs a clear yes; an unsettled signal is never hot, only warm.
  const wantsContact = isYes(s.asksToBeContacted);
  const ready = isYes(s.readyToApply);
  const unsure = !isNo(s.asksToBeContacted) || !isNo(s.readyToApply);

  if (wantsContact) return out("hot", "asks to be contacted");
  if (ready && s.urgency >= 2) return out("hot", "ready to apply and plans the next intake");
  if (ready || s.urgency >= 2) return out("warm", "ready to apply or plans the next intake");
  if (unsure) return out("warm", "intent signals unsettled");
  return out("nurture", "interested, no near-term action");
}
