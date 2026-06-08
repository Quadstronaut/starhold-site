import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://starhold.fyi',
	integrations: [
		starlight({
			title: 'STARHOLD ⬡ KNOWLEDGE',
			customCss: ['./src/styles/blueprint.css'],
			components: {
				Sidebar: './src/components/Sidebar.astro',
			},
			sidebar: [
				{ label: 'Start Here', link: '/' },
				{ label: 'Custom Discord Bots', items: [{ autogenerate: { directory: 'bots' } }] },
				{ label: 'Shushgame', items: [{ autogenerate: { directory: 'shushgame' } }] },
				{ label: 'QNix Platform', items: [{ autogenerate: { directory: 'qnix' } }] },
				{ label: 'Open Source', items: [{ autogenerate: { directory: 'open-source' } }] },
				{ label: 'Mission Log', items: [{ autogenerate: { directory: 'log' } }] }
			]
		})
	]
});
