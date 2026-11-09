import { test } from "node:test";
import assert from "node:assert/strict";
import { decideSegment, type Signals } from "./decide-segment.ts";

const base: Signals = {
  isSpamOrOffTopic: 0.02, wantsToStudyInRussia: 0.95, readyToApply: 0.1,
  asksToBeContacted: 0.05, asksAboutScholarship: 0.1, statesStudyLevel: 0.9,
  studyLevel: "master", urgency: 0.5,
};
const seg = (o: Partial<Signals>) => decideSegment({ ...base, ...o }).segment;

test("filters", () => {
  assert.equal(seg({ isSpamOrOffTopic: 0.9 }), "discard");
  assert.equal(seg({ isSpamOrOffTopic: 0.5 }), "review");
  assert.equal(seg({ wantsToStudyInRussia: 0.1 }), "not_a_prospect");
  assert.equal(seg({ wantsToStudyInRussia: 0.5 }), "review");
});

test("hot, warm, nurture", () => {
  assert.equal(seg({ asksToBeContacted: 0.9 }), "hot");
  assert.equal(seg({ readyToApply: 0.9, urgency: 2.4 }), "hot");
  assert.equal(seg({ readyToApply: 0.9, urgency: 1 }), "warm");
  assert.equal(seg({ urgency: 2.2 }), "warm");
  assert.equal(seg({}), "nurture");
});

test("an unsettled intent signal is warm, never hot", () => {
  assert.equal(seg({ asksToBeContacted: 0.5 }), "warm");
  assert.equal(seg({ readyToApply: 0.5, urgency: 3 }), "warm");
});

test("tags", () => {
  const d = decideSegment({ ...base, asksAboutScholarship: 0.9, statesStudyLevel: 0.2 });
  assert.equal(d.tags.scholarship, true);
  assert.equal(d.tags.studyLevel, undefined);
});
