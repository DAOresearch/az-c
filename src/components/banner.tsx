import { TextAttributes } from "@opentui/core";

const Banner = () => (
	<box alignItems="center" flexGrow={1} justifyContent="center">
		<box alignItems="flex-end" justifyContent="center">
			<ascii-font font="tiny" text="OpenTUI" />
			<text attributes={TextAttributes.DIM}>What will you build?</text>
		</box>
	</box>
);

export default Banner;
