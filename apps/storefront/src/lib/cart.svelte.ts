// App-wide cart singleton. `.svelte.ts` so $state works; persists per-save
// to localStorage. On the server (SSR) it's always empty — cart UI is
// client-rendered state, never part of the server payload.
import { browser } from '$app/environment';
import { addBot, removeBot, serializeCart, deserializeCart } from './cart';
import type { BotOrder } from './build-sheet';

const KEY = 'starhold-cart-v1';

class Cart {
	items = $state<BotOrder[]>(browser ? deserializeCart(localStorage.getItem(KEY)) : []);

	get count() {
		return this.items.length;
	}

	add(order: BotOrder) {
		this.items = addBot(this.items, order);
		this.#save();
	}

	remove(index: number) {
		this.items = removeBot(this.items, index);
		this.#save();
	}

	clear() {
		this.items = [];
		this.#save();
	}

	#save() {
		if (browser) localStorage.setItem(KEY, serializeCart(this.items));
	}
}

export const cart = new Cart();
