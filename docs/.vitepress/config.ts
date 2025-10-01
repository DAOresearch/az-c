import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "az-c Documentation",
	description: "Hackable Claude Code Client - TUI for Claude Code",
	base: "/az-c/",

	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Guide", link: "/guide/" },
			{ text: "Application", link: "/application/" },
			{ text: "Testing", link: "/testing/" },
			{ text: "Harness", link: "/harness/" },
			{ text: "Commands", link: "/commands/" },
		],

		sidebar: {
			"/guide/": [
				{
					text: "Getting Started",
					items: [
						{ text: "Overview", link: "/guide/" },
						{ text: "Installation", link: "/guide/getting-started" },
						{ text: "Configuration", link: "/guide/configuration" },
					],
				},
			],
			"/application/": [
				{
					text: "Application",
					items: [
						{ text: "What is az-c?", link: "/application/" },
						{ text: "Design System", link: "/application/design-system" },
					],
				},
			],
			"/testing/": [
				{
					text: "Testing Infrastructure",
					items: [
						{ text: "Overview", link: "/testing/" },
						{ text: "Writing Tests", link: "/testing/writing-tests" },
					],
				},
			],
			"/harness/": [
				{
					text: "Claude Code Harness",
					items: [{ text: "Overview", link: "/harness/" }],
				},
			],
			"/commands/": [
				{
					text: "Commands",
					items: [{ text: "Overview", link: "/commands/" }],
				},
			],
			"/contributing/": [
				{
					text: "Contributing",
					items: [
						{ text: "Overview", link: "/contributing/" },
						{ text: "Code Style", link: "/contributing/code-style" },
					],
				},
			],
		},

		socialLinks: [
			{ icon: "github", link: "https://github.com/DAOresearch/az-c" },
		],

		search: {
			provider: "local",
		},
	},
});
