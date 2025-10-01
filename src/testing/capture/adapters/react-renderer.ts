import {
	InputRenderable,
	InputRenderableEvents,
	isRenderable,
	type Renderable,
	type RootRenderable,
	SelectRenderable,
	SelectRenderableEvents,
	TabSelectRenderable,
	TabSelectRenderableEvents,
	TextNodeRenderable,
} from "@opentui/core";
import type { TestRenderer } from "@opentui/core/testing";
import { AppContext, getComponentCatalogue } from "@opentui/react";
import React, { type ReactNode } from "react";
import ReactReconciler from "react-reconciler";
import {
	ConcurrentRoot,
	DefaultEventPriority,
	NoEventPriority,
} from "react-reconciler/constants";

type KeyHandler = TestRenderer["keyInput"];

const textNodeKeys = ["span", "b", "strong", "i", "em", "u", "br"] as const;
const UNKNOWN_EVENT_TIMESTAMP = -1.1;
const noop = () => {
	// intentionally empty
};

type HostContext = {
	isInsideText: boolean;
};

type ContainerRoot = RootRenderable & {
	ctx: Renderable;
	requestRender: () => void;
	insertBefore(child: Renderable, beforeChild: Renderable): void;
	remove(id?: string): void;
	add(child: Renderable): void;
	getChildren?(): Array<Renderable & { id?: string }>;
};

function initEventListeners(
	instance: Renderable,
	eventName: string,
	listener: unknown,
	previousListener: unknown
) {
	if (previousListener && typeof previousListener === "function") {
		instance.off?.(eventName, previousListener as (...args: unknown[]) => void);
	}

	if (listener && typeof listener === "function") {
		instance.on?.(eventName, listener as (...args: unknown[]) => void);
	}
}

function setStyle(
	instance: Renderable & Record<string, unknown>,
	styles?: unknown,
	oldStyles?: unknown
) {
	if (!styles || typeof styles !== "object") {
		return;
	}

	const next = styles as Record<string, unknown>;
	const previous = (oldStyles as Record<string, unknown>) ?? {};

	for (const key of Object.keys(next)) {
		if (previous[key] !== next[key]) {
			instance[key] = next[key];
		}
	}
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: mirrors upstream host config
function setProperty(
	instance: Renderable,
	_type: string,
	propKey: string,
	propValue: unknown,
	oldPropValue?: unknown
) {
	switch (propKey) {
		case "onChange":
			if (instance instanceof InputRenderable) {
				initEventListeners(
					instance,
					InputRenderableEvents.CHANGE,
					propValue,
					oldPropValue
				);
			} else if (instance instanceof SelectRenderable) {
				initEventListeners(
					instance,
					SelectRenderableEvents.SELECTION_CHANGED,
					propValue,
					oldPropValue
				);
			} else if (instance instanceof TabSelectRenderable) {
				initEventListeners(
					instance,
					TabSelectRenderableEvents.SELECTION_CHANGED,
					propValue,
					oldPropValue
				);
			}
			break;
		case "onInput":
			if (instance instanceof InputRenderable) {
				initEventListeners(
					instance,
					InputRenderableEvents.INPUT,
					propValue,
					oldPropValue
				);
			}
			break;
		case "onSubmit":
			if (instance instanceof InputRenderable) {
				initEventListeners(
					instance,
					InputRenderableEvents.ENTER,
					propValue,
					oldPropValue
				);
			}
			break;
		case "onSelect":
			if (instance instanceof SelectRenderable) {
				initEventListeners(
					instance,
					SelectRenderableEvents.ITEM_SELECTED,
					propValue,
					oldPropValue
				);
			} else if (instance instanceof TabSelectRenderable) {
				initEventListeners(
					instance,
					TabSelectRenderableEvents.ITEM_SELECTED,
					propValue,
					oldPropValue
				);
			}
			break;
		case "focused":
			if (isRenderable(instance)) {
				if (propValue) {
					instance.focus?.();
				} else {
					instance.blur?.();
				}
			}
			break;
		case "style":
			setStyle(
				instance as Renderable & Record<string, unknown>,
				propValue,
				oldPropValue
			);
			break;
		case "children":
			break;
		default:
			(instance as Renderable & Record<string, unknown>)[propKey] = propValue;
	}
}

function setInitialProperties(
	instance: Renderable,
	type: string,
	props: Record<string, unknown>
) {
	for (const propKey of Object.keys(props)) {
		const value = props[propKey];
		if (value == null) {
			continue;
		}
		setProperty(instance, type, propKey, value);
	}
}

function updateProperties(
	instance: Renderable,
	type: string,
	oldProps: Record<string, unknown>,
	newProps: Record<string, unknown>
) {
	for (const key of Object.keys(oldProps)) {
		if (!Object.hasOwn(newProps, key)) {
			setProperty(instance, type, key, null, oldProps[key]);
		}
	}

	for (const key of Object.keys(newProps)) {
		const newValue = newProps[key];
		const oldValue = oldProps[key];
		if (newValue !== oldValue) {
			setProperty(instance, type, key, newValue, oldValue);
		}
	}
}

let currentUpdatePriority = NoEventPriority;

const idCounter = new Map<string, number>();

function getNextId(type: string): string {
	const count = idCounter.get(type) ?? 0;
	const next = count + 1;
	idCounter.set(type, next);
	return `${type}-${next}`;
}

const hostConfig = {
	supportsMutation: true,
	supportsPersistence: false,
	supportsHydration: false,
	createInstance(
		type: string,
		props: Record<string, unknown>,
		rootContainerInstance: ContainerRoot,
		hostContext: HostContext
	) {
		if (
			textNodeKeys.includes(type as (typeof textNodeKeys)[number]) &&
			!hostContext.isInsideText
		) {
			throw new Error(
				`Component of type "${type}" must be created inside of a text node`
			);
		}

		const components = getComponentCatalogue();
		const ComponentCtor = components[type as keyof typeof components];

		if (!ComponentCtor) {
			throw new Error(`Unknown component type: ${type}`);
		}

		return new ComponentCtor(rootContainerInstance.ctx, {
			id: getNextId(type),
			...props,
		});
	},
	appendChild(parent: Renderable, child: Renderable) {
		parent.add(child);
	},
	removeChild(parent: Renderable, child: Renderable & { id?: string }) {
		parent.remove(child.id);
	},
	insertBefore(parent: Renderable, child: Renderable, beforeChild: Renderable) {
		parent.insertBefore(child, beforeChild);
	},
	insertInContainerBefore(
		parent: ContainerRoot,
		child: Renderable,
		beforeChild: Renderable
	) {
		parent.insertBefore(child, beforeChild);
	},
	removeChildFromContainer(
		parent: ContainerRoot,
		child: Renderable & { id?: string }
	) {
		parent.remove(child.id);
	},
	prepareForCommit() {
		return null;
	},
	resetAfterCommit(containerInfo: ContainerRoot) {
		containerInfo.requestRender?.();
	},
	getRootHostContext(): HostContext {
		return { isInsideText: false };
	},
	getChildHostContext(
		parentHostContext: HostContext,
		type: string
	): HostContext {
		const isInsideText = ["text", ...textNodeKeys].includes(type);
		return { ...parentHostContext, isInsideText };
	},
	shouldSetTextContent() {
		return false;
	},
	createTextInstance(
		text: string,
		_rootContainerInstance: ContainerRoot,
		hostContext: HostContext
	) {
		if (!hostContext.isInsideText) {
			throw new Error("Text must be created inside of a text node");
		}
		return TextNodeRenderable.fromString(text);
	},
	scheduleTimeout: setTimeout,
	cancelTimeout: clearTimeout,
	noTimeout: -1,
	shouldAttemptEagerTransition() {
		return false;
	},
	finalizeInitialChildren(
		instance: Renderable,
		type: string,
		props: Record<string, unknown>
	) {
		setInitialProperties(instance, type, props);
		return false;
	},
	commitMount() {
		// intentionally empty
	},
	commitUpdate(
		instance: Renderable,
		type: string,
		oldProps: Record<string, unknown>,
		newProps: Record<string, unknown>
	) {
		updateProperties(instance, type, oldProps, newProps);
		instance.requestRender?.();
	},
	commitTextUpdate(
		textInstance: TextNodeRenderable,
		_oldText: string,
		newText: string
	) {
		textInstance.children = [newText];
		textInstance.requestRender?.();
	},
	appendChildToContainer(container: ContainerRoot, child: Renderable) {
		container.add(child);
	},
	appendInitialChild(parent: Renderable, child: Renderable) {
		parent.add(child);
	},
	hideInstance(instance: Renderable) {
		(instance as Renderable & { visible?: boolean }).visible = false;
		instance.requestRender();
	},
	unhideInstance(instance: Renderable) {
		(instance as Renderable & { visible?: boolean }).visible = true;
		instance.requestRender();
	},
	hideTextInstance(instance: TextNodeRenderable) {
		(instance as TextNodeRenderable & { visible?: boolean }).visible = false;
		instance.requestRender();
	},
	unhideTextInstance(instance: TextNodeRenderable, text: string) {
		(instance as TextNodeRenderable & { visible?: boolean }).visible = true;
		instance.children = [text];
		instance.requestRender();
	},
	clearContainer(container: ContainerRoot) {
		const children = container.getChildren?.() ?? [];
		for (const child of children) {
			container.remove(child.id);
		}
	},
	setCurrentUpdatePriority(newPriority: number) {
		currentUpdatePriority = newPriority;
	},
	getCurrentUpdatePriority() {
		return currentUpdatePriority;
	},
	resolveUpdatePriority() {
		if (currentUpdatePriority !== NoEventPriority) {
			return currentUpdatePriority;
		}
		return DefaultEventPriority;
	},
	maySuspendCommit() {
		return false;
	},
	NotPendingTransition: null,
	HostTransitionContext: React.createContext(null),
	resetFormInstance() {
		// intentionally empty
	},
	requestPostPaintCallback() {
		// intentionally empty
	},
	trackSchedulerEvent() {
		// intentionally empty
	},
	resolveEventType() {
		return null;
	},
	resolveEventTimeStamp() {
		return UNKNOWN_EVENT_TIMESTAMP;
	},
	preloadInstance() {
		return true;
	},
	startSuspendingCommit() {
		// intentionally empty
	},
	suspendInstance() {
		// intentionally empty
	},
	waitForCommitToBeReady() {
		return null;
	},
	detachDeletedInstance(
		instance: Renderable & {
			destroyRecursively?: () => void;
			parent?: Renderable;
		}
	) {
		if (!instance.parent) {
			instance.destroyRecursively?.();
		}
	},
	getPublicInstance(instance: Renderable) {
		return instance;
	},
	preparePortalMount() {
		// intentionally empty
	},
	isPrimaryRenderer: true,
	getInstanceFromNode() {
		return null;
	},
	beforeActiveInstanceBlur() {
		// intentionally empty
	},
	afterActiveInstanceBlur() {
		// intentionally empty
	},
	prepareScopeUpdate() {
		// intentionally empty
	},
	getInstanceFromScope() {
		return null;
	},
};

type ReconcilerType = typeof ReactReconciler;
type ReconcilerInstance = {
	createContainer: (...args: unknown[]) => unknown;
	updateContainer: (...args: unknown[]) => void;
};

const reconciler = (ReactReconciler as ReconcilerType)(
	hostConfig as never
) as ReconcilerInstance;

export class ReactRenderer {
	private readonly container: ReturnType<ReconcilerInstance["createContainer"]>;
	private readonly renderer: TestRenderer & { keyInput: KeyHandler };
	private readonly renderOnce: () => Promise<void>;

	constructor(
		renderer: TestRenderer & { keyInput: KeyHandler },
		renderOnce: () => Promise<void>
	) {
		this.renderer = renderer;
		this.renderOnce = renderOnce;
		this.container = reconciler.createContainer(
			this.renderer.root as ContainerRoot,
			ConcurrentRoot,
			null,
			false,
			null,
			"",
			noop,
			noop,
			noop,
			noop,
			null
		);
	}

	async mount(element: ReactNode): Promise<void> {
		const wrapped = React.createElement(
			AppContext.Provider,
			{
				value: { keyHandler: this.renderer.keyInput, renderer: this.renderer },
			},
			element
		);

		reconciler.updateContainer(wrapped, this.container, null, () => {
			// intentionally empty callback
		});
		await this.renderOnce();
	}

	async renderFrame(): Promise<void> {
		await this.renderOnce();
	}

	getRenderer(): TestRenderer {
		return this.renderer;
	}
}
