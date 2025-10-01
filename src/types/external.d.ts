declare module "ansi-to-svg" {
	type AnsiToSvgOptions = {
		fontFamily?: string;
		fontSize?: number;
		colors?: Record<string, string>;
		backgroundColor?: string;
	};

	type Converter = (input: string) => string;

	export default function ansiToSvg(options?: AnsiToSvgOptions): Converter;
}

declare module "react-reconciler" {
	type HostConfig = Record<string, unknown>;
	const ReactReconciler: (config: HostConfig) => unknown;
	export default ReactReconciler;
}

declare module "react-reconciler/constants" {
	export const ConcurrentRoot: number;
	export const DefaultEventPriority: number;
	export const NoEventPriority: number;
}
