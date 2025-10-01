import { defineConfig } from "vitepress";

export default defineConfig({
	title: "az-c Documentation",
	description: "Hackable Claude Code Client - TUI for Claude Code",
	base: "/az-c/",

	themeConfig: {
		logo: "/logo.svg",
		nav: [
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
					text: "Application Guide",
					items: [
						{ text: "What is az-c?", link: "/application/" },
						{ text: "Architecture", link: "/application/architecture" },
						{
							text: "Customization",
							link: "/application/customization",
						},
						{
							text: "Component Development",
							link: "/application/components",
						},
						{
							text: "Design System",
							link: "/application/design-system",
						},
					],
				},
			],

			"/testing/": [
				{
					text: "Testing Infrastructure",
					items: [
						{ text: "Overview", link: "/testing/" },
						{ text: "Custom Vitest Setup", link: "/testing/vitest-setup" },
						{ text: "Writing Tests", link: "/testing/writing-tests" },
						{
							text: "Screenshot Testing",
							link: "/testing/screenshot-testing",
						},
						{ text: "AI Evaluation", link: "/testing/ai-evaluation" },
					],
				},
			],

			"/harness/": [
				{
					text: "Claude Code Harness",
					items: [
						{ text: "Overview", link: "/harness/" },
						{ text: "Usage & Examples", link: "/harness/usage" },
						{
							text: "Programmatic Interactions",
							link: "/harness/programmatic",
						},
					],
				},
			],

			"/commands/": [
				{
					text: "Slash Commands",
					items: [
						{ text: "Overview", link: "/commands/" },
						{ text: "/tdd-component", link: "/commands/tdd-component" },
						{ text: "/prd", link: "/commands/prd" },
						{ text: "/review-pr", link: "/commands/review-pr" },
						{ text: "/label-issue", link: "/commands/label-issue" },
					],
				},
			],

			"/workflows/": [
				{
					text: "Workflows & Automation",
					items: [
						{ text: "Overview", link: "/workflows/" },
						{ text: "PRD Workflow", link: "/workflows/prd-workflow" },
						{ text: "GitHub Actions", link: "/workflows/github-actions" },
					],
				},
			],

			"/api/": [
				{
					text: "API Reference",
					items: [
						{ text: "Overview", link: "/api/" },
						{ text: "Hooks", link: "/api/hooks" },
						{ text: "Services", link: "/api/services" },
						{ text: "Types", link: "/api/types" },
					],
				},
			],

			"/contributing/": [
				{
					text: "Contributing",
					items: [
						{ text: "Overview", link: "/contributing/" },
						{ text: "Code Style", link: "/contributing/code-style" },
						{ text: "PR Process", link: "/contributing/pr-process" },
						{
							text: "Testing Requirements",
							link: "/contributing/testing-requirements",
						},
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

		footer: {
			message: "Built with VitePress",
			copyright: "MIT Licensed",
		},
	},

	markdown: {
		theme: {
			light: "github-light",
			dark: "github-dark",
		},
		lineNumbers: true,
	},

	ignoreDeadLinks: true,
});
