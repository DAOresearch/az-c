```typescript
import { bold, fg, italic, TextAttributes, t } from "@opentui/core";
import { render, useKeyboard, useRenderer } from "@opentui/react";
import { useCallback, useState } from "react";

export const App = () => {
	const renderer = useRenderer();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [focused, setFocused] = useState<"username" | "password">("username");
	const [status, setStatus] = useState<"idle" | "invalid" | "success">("idle");

	useKeyboard((key) => {
		if (key.name === "tab") {
			setFocused((prevFocused) =>
				prevFocused === "username" ? "password" : "username"
			);
		}

		if (key.ctrl && key.name === "k") {
			renderer?.toggleDebugOverlay();
			renderer?.console.toggle();
		}
	});

	const handleUsernameChange = useCallback((value: string) => {
		setUsername(value);
	}, []);

	const handlePasswordChange = useCallback((value: string) => {
		setPassword(value);
	}, []);

	const handleSubmit = useCallback(() => {
		if (username === "admin" && password === "secret") {
			setStatus("success");
		} else {
			setStatus("invalid");
		}
	}, [username, password]);

	return (
		<box style={{ padding: 2, flexDirection: "column" }}>
			<text
				content="OpenTUI with React!"
				style={{
					fg: "#FFFF00",
					attributes: TextAttributes.BOLD | TextAttributes.ITALIC,
				}}
			/>
			<text content={t`${bold(italic(fg("cyan")("Styled Text!")))}`} />

			<box
				style={{ border: true, width: 40, height: 3, marginTop: 1 }}
				title="Username"
			>
				<input
					focused={focused === "username"}
					onInput={handleUsernameChange}
					onSubmit={handleSubmit}
					placeholder="Enter your username..."
					style={{ focusedBackgroundColor: "#000000" }}
				/>
			</box>

			<box
				style={{
					border: true,
					width: 40,
					height: 3,
					marginTop: 1,
					marginBottom: 1,
				}}
				title="Password"
			>
				<input
					focused={focused === "password"}
					onInput={handlePasswordChange}
					onSubmit={handleSubmit}
					placeholder="Enter your password..."
					style={{ focusedBackgroundColor: "#000000" }}
				/>
			</box>

			<text
				content={status.toUpperCase()}
				style={{
					fg:
						status === "idle"
							? "#AAAAAA"
							: status === "success"
								? "green"
								: "red",
				}}
			/>
		</box>
	);
};

render(<App />);

```
