/**
 * Every question, option, criterion and threshold used to classify a prospect.
 * Edit wording here only; decisions live in decide-segment.ts.
 *
 * Questions are written in English; prospect messages may be in French.
 * Test the wording on real (consented) messages before relying on it.
 */
import { choice, noul, score } from "@typesafe-ai/sdk";

export { THRESHOLDS } from "./thresholds.ts";

export const prospectQuestions = {
  // --- Filters: is this a real prospect at all? -------------------------
  isSpamOrOffTopic: noul("Is `prospect.message` spam, an advertisement, or unrelated to studying abroad?", {
    true: "Selling something, a bot-like text, or a topic with nothing to do with studying",
    false: "A person asking about studying, admission, visas, costs or life abroad",
  }),

  wantsToStudyInRussia: noul("Does the author of `prospect.message` want to study in Russia, for themselves or for a relative?", {
    true: "Asks about universities, admission, a Russian program or moving to Russia to study",
    false: "Asks about tourism, work, immigration without studies, or studying in another country",
  }),

  // --- Intent signals ---------------------------------------------------
  readyToApply: noul("Does the author of `prospect.message` want to start an application now?", {
    true: "Asks how to apply, which documents to send, deadlines, or how to register",
    false: "Only asks general questions about Russia or about studying there",
  }),

  asksToBeContacted: noul("Does the author of `prospect.message` ask to speak with an advisor or to be called back?", {
    true: "Asks for a call, a meeting, a callback, or says to contact them",
    false: "Asks a question that a written answer would settle",
  }),

  asksAboutScholarship: noul("Does `prospect.message` ask about a scholarship or financial aid?", {
    true: "Asks about a bourse, a free place, grants, or help paying tuition",
    false: "Does not mention scholarships or financial aid",
  }),

  // --- Profile ----------------------------------------------------------
  statesStudyLevel: noul("Does `prospect.message` say which level of study the prospect wants?"),

  studyLevel: choice("Which level of study does the prospect want?", {
    preparatory_year: "Russian language or preparatory year before a degree",
    bachelor: "First university degree (licence, bachelor)",
    master: "Master's degree",
    doctorate: "Doctorate or PhD",
  }),

  urgency: score("How soon does the prospect plan to act?", [
    "Just curious, no date or plan is mentioned",
    "Considering studying in a future year, no application yet",
    "Plans to apply for the next intake",
    "Wants to start the procedure now: documents, visa, payment or registration",
  ]),
};
