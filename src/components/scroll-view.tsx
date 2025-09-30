import type { FC, PropsWithChildren } from "react";

export const ScrollView = ({ children }) => (
	<scrollbox
		focused
		style={{
			rootOptions: {
				backgroundColor: "#24283b",
			},
			wrapperOptions: {
				backgroundColor: "#1f2335",
			},
			viewportOptions: {
				backgroundColor: "#1a1b26",
			},
			contentOptions: {
				backgroundColor: "#16161e",
			},
			scrollbarOptions: {
				showArrows: true,
				trackOptions: {
					foregroundColor: "#7aa2f7",
					backgroundColor: "#414868",
				},
			},
		}}
	>
		{children}
	</scrollbox>
);
