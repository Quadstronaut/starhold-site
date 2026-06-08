// Pure cart logic — no Svelte, no browser APIs, fully unit-testable.
import type { BotOrder } from './build-sheet';

export function addBot(items: BotOrder[], order: BotOrder): BotOrder[] {
	return [...items, order];
}

export function removeBot(items: BotOrder[], index: number): BotOrder[] {
	return items.filter((_, i) => i !== index);
}

export function serializeCart(items: BotOrder[]): string {
	return JSON.stringify(items);
}

export function deserializeCart(raw: string | null): BotOrder[] {
	if (!raw) return [];
	try {
		const parsed: unknown = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		// validate shape — localStorage survives deploys, old/corrupt data must not crash checkout
		return parsed.filter(
			(p): p is BotOrder =>
				!!p && typeof p.server === 'string' && Array.isArray(p.features) &&
				p.features.length > 0 &&
				p.features.every((f: unknown) => typeof f === 'string')
		);
	} catch {
		return [];
	}
}
