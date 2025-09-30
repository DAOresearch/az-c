import { TextAttributes } from "@opentui/core";

export type BannerProps = {
	message: string;
};

export const Banner = ({ message }: BannerProps) => (
	<box alignItems="center" flexGrow={1} justifyContent="center">
		<box alignItems="flex-end" justifyContent="center">
			<ascii-font font="tiny" text="OpenTUI" />
			<text attributes={TextAttributes.DIM}>{message}</text>
		</box>
	</box>
);
