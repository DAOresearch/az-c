#!/usr/bin/env bun
/**
 * Claude Code Hook: Auto-lint files after Write/Edit operations
 *
 * This hook runs Biome linting on files after they are written or edited.
 * It applies safe fixes automatically and reports any remaining issues to Claude.
 */

/** biome-ignore-all lint/style/useNamingConvention: needed for claude */
/** biome-ignore-all lint/correctness/noUndeclaredVariables: needed for claude */

import { resolve } from "node:path";

// Biome JSON reporter schema types
type BiomeMessageElement = {
	elements: string[];
	content: string;
};

type BiomeDiagnostic = {
	category: string;
	severity: "error" | "warning" | "info";
	description: string;
	message: BiomeMessageElement[];
	location: {
		path: {
			file: string;
		};
		span: [number, number] | null;
		sourceCode: string;
	};
	tags: string[];
};

type BiomeJsonOutput = {
	summary: {
		errors: number;
		warnings: number;
		changed: number;
		unchanged: number;
	};
	diagnostics: BiomeDiagnostic[];
	command: string;
};

type HookInput = {
	session_id: string;
	transcript_path: string;
	cwd: string;
	hook_event_name: string;
	tool_name: string;
	tool_input: {
		file_path?: string;
		file_text?: string;
		content?: string;
		edits?: Array<{
			file_path: string;
			[key: string]: unknown;
		}>;
	};
	tool_response?: {
		filePath?: string;
		success?: boolean;
	};
};

type HookOutput = {
	decision?: "block";
	reason?: string;
	suppressOutput?: boolean;
	systemMessage?: string;
	hookSpecificOutput?: {
		hookEventName: string;
		additionalContext?: string;
	};
};

// Read input from stdin
let input: HookInput;
try {
	const stdinData = await Bun.stdin.text();
	input = JSON.parse(stdinData);
} catch (error) {
	console.error(`Error: Invalid JSON input: ${error}`);
	process.exit(1);
}

// Extract file path(s) from the tool input/response
function getFilePaths(): string[] {
	const paths: string[] = [];

	// For Write tool
	if (input.tool_input.file_path) {
		paths.push(input.tool_input.file_path);
	}

	// For Edit/MultiEdit tools
	if (input.tool_input.edits && Array.isArray(input.tool_input.edits)) {
		for (const edit of input.tool_input.edits) {
			if (edit.file_path) {
				paths.push(edit.file_path);
			}
		}
	}

	// From tool response (fallback)
	if (input.tool_response?.filePath) {
		paths.push(input.tool_response.filePath);
	}

	return [...new Set(paths)]; // Remove duplicates
}

// Check if file should be linted (TypeScript/JavaScript files)
function shouldLintFile(filePath: string): boolean {
	const lintableExtensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
	return lintableExtensions.some((ext) => filePath.endsWith(ext));
}

// Format diagnostic message from Biome's message array
function formatDiagnosticMessage(message: BiomeMessageElement[]): string {
	return message.map((part) => part.content).join("");
}

// Calculate line and column from span and sourceCode
function getLineAndColumn(
	span: [number, number],
	sourceCode: string
): { line: number; column: number } {
	const [start] = span;
	const sourceUpToSpan = sourceCode.substring(0, start);
	const line = (sourceUpToSpan.match(/\n/g) || []).length + 1;
	const lastNewline = sourceUpToSpan.lastIndexOf("\n");
	const column = start - lastNewline;
	return { line, column };
}

// Run Biome lint on the file using JSON reporter
async function lintFile(filePath: string): Promise<{
	success: boolean;
	biomeOutput?: BiomeJsonOutput;
	issues: string[];
}> {
	const absolutePath = resolve(input.cwd, filePath);

	try {
		// Run biome check with --write to apply safe fixes and --reporter=json
		const proc = Bun.spawn(
			[
				"bun",
				"x",
				"biome",
				"check",
				"--write",
				"--reporter=json",
				absolutePath,
			],
			{
				cwd: input.cwd,
				stdout: "pipe",
				stderr: "pipe",
			}
		);

		const stdout = await new Response(proc.stdout).text();
		await proc.exited;

		// Parse JSON output
		let biomeOutput: BiomeJsonOutput | undefined;
		try {
			biomeOutput = JSON.parse(stdout);
		} catch {
			// If JSON parsing fails, return simple result
			return {
				success: proc.exitCode === 0,
				issues: ["Failed to parse Biome JSON output"],
			};
		}

		if (biomeOutput === undefined) {
			return {
				success: proc.exitCode === 0,
				biomeOutput,
				issues: [],
			};
		}
		// Extract issues from diagnostics
		const issues: string[] = [];
		if (biomeOutput.diagnostics && biomeOutput.diagnostics.length > 0) {
			for (const diagnostic of biomeOutput.diagnostics) {
				const message = formatDiagnosticMessage(diagnostic.message);
				let location = "";

				if (diagnostic.location.span) {
					const { line, column } = getLineAndColumn(
						diagnostic.location.span,
						diagnostic.location.sourceCode
					);
					location = ` [${line}:${column}]`;
				}

				issues.push(
					`${diagnostic.severity}: ${diagnostic.category}${location} - ${message}`
				);
			}
		}

		return {
			success: proc.exitCode === 0,
			biomeOutput,
			issues,
		};
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);

		return {
			success: false,
			issues: [`Error running Biome: ${errorMessage}`],
		};
	}
}

// Main execution
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: needed for claude
async function main() {
	const filePaths = getFilePaths();

	if (filePaths.length === 0) {
		// No files to lint
		process.exit(0);
	}

	const lintableFiles = filePaths.filter(shouldLintFile);

	if (lintableFiles.length === 0) {
		// No lintable files
		process.exit(0);
	}

	const results: Array<{
		file: string;
		result: Awaited<ReturnType<typeof lintFile>>;
	}> = [];

	// Lint each file
	for (const filePath of lintableFiles) {
		const result = await lintFile(filePath);
		results.push({ file: filePath, result });
	}

	// Check if any files have issues
	const filesWithIssues = results.filter(
		(r) => !r.result.success || r.result.issues.length > 0
	);

	if (filesWithIssues.length === 0) {
		// All files passed linting
		const output: HookOutput = {
			suppressOutput: true,
			hookSpecificOutput: {
				hookEventName: "PostToolUse",
				additionalContext: `✓ Linted ${lintableFiles.length} file(s) successfully. All safe fixes applied.`,
			},
		};
		console.log(JSON.stringify(output));
		process.exit(0);
	}

	// Some files have issues - report to Claude with structured data
	let issueReport = "Linting completed with issues:\n\n";

	for (const { file, result } of filesWithIssues) {
		issueReport += `**${file}**\n`;

		if (result.biomeOutput?.summary) {
			const summary = result.biomeOutput.summary;
			if (summary.errors > 0) {
				issueReport += `  - ${summary.errors} error(s)\n`;
			}
			if (summary.warnings > 0) {
				issueReport += `  - ${summary.warnings} warning(s)\n`;
			}
		}

		if (result.issues.length > 0) {
			issueReport += "\n";
			for (const issue of result.issues) {
				issueReport += `  ${issue}\n`;
			}
		}
		issueReport += "\n";
	}

	issueReport += "Please review and fix the remaining linting issues.";

	const output: HookOutput = {
		decision: "block",
		reason: issueReport,
		hookSpecificOutput: {
			hookEventName: "PostToolUse",
			additionalContext: issueReport,
		},
	};

	console.log(JSON.stringify(output));
	process.exit(0);
}

main();
