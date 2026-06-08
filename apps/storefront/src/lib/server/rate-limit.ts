// In-memory sliding-window limiter. Single container, modest traffic —
// a Map is plenty; revisit if the sidecar ever scales horizontally.
export const WINDOW_MS = 10 * 60 * 1000;
export const MAX_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

export function allow(ip: string, now = Date.now()): boolean {
	const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
	// self-pruning: drop fully-expired entries so rotating-IP traffic
	// can't grow the Map without bound
	if (recent.length === 0) hits.delete(ip);
	if (recent.length >= MAX_PER_WINDOW) {
		hits.set(ip, recent);
		return false;
	}
	recent.push(now);
	hits.set(ip, recent);
	return true;
}

// test/ops hook — current number of tracked IPs
export function trackedIps(): number {
	return hits.size;
}
