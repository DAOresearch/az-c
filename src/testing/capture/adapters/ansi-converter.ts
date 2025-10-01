import ansiToSvg from "ansi-to-svg";
import sharp from "sharp";
import type { TerminalTheme } from "./types";

export class ANSIConverter {
	private readonly converter: ReturnType<typeof ansiToSvg>;

	constructor(theme: TerminalTheme) {
		this.converter = ansiToSvg({
			fontFamily: theme.fontFamily,
			fontSize: theme.fontSize,
			colors: theme.colors,
			backgroundColor: theme.backgroundColor,
		});
	}

	toSVG(ansi: string): string {
		return this.converter(ansi);
	}

	async toPNG(svg: string, output: string): Promise<void> {
		await sharp(Buffer.from(svg)).png().toFile(output);
	}
}
