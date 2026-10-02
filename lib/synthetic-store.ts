type Vote = { pollId: string; userId: string; option: string; createdAt: string };
type Event = { eventName: string; sessionId: string; contentId?: string; dedupeKey: string; occurredAt: string };

const votes = new Map<string, Vote>();
const events = new Map<string, Event>();

export function submitSyntheticVote(pollId: string, option: string, userId = "synthetic-user") {
  const key = `${pollId}:${userId}`;
  const existing = votes.get(key);
  if (existing) return { inserted: false, vote: existing, count: countVotes(pollId) };
  const vote = { pollId, userId, option, createdAt: new Date().toISOString() };
  votes.set(key, vote);
  return { inserted: true, vote, count: countVotes(pollId) };
}

export function countVotes(pollId: string) {
  return [...votes.values()].filter((vote) => vote.pollId === pollId).length;
}

export function recordSyntheticEvent(event: Event) {
  if (events.has(event.dedupeKey)) return { inserted: false };
  events.set(event.dedupeKey, event);
  return { inserted: true };
}

export function resetSyntheticStore() {
  votes.clear();
  events.clear();
}
