import {createEffect, onCleanup} from 'solid-js'
import {element, numberAttribute, untrack, autorun, booleanAttribute, StopFunction} from '@lume/element'
import {html} from '@lume/element/dist/html.js'
import {autoDefineElements} from '../LumeConfig.js'
import {Node, NodeAttributes} from '../core/Node.js'
import {FlingRotation, ScrollFling} from '../interaction/index.js'

import type {PerspectiveCamera} from './PerspectiveCamera.js'

export type CameraRigAttributes =
	| NodeAttributes
	| 'initialPolarAngle'
	| 'minPolarAngle'
	| 'maxPolarAngle'
	| 'initialDistance'
	| 'minDistance'
	| 'maxDistance'
	| 'active'
	| 'dollySpeed'
	| 'interactive'

// TODO allow overriding the camera props, and make the default camera overridable via <slot>

/**
 * @class CameraRig
 *
 * Element: `<lume-camera-rig>`
 *
 * The [`<lume-camera-rig>`](./CameraRig) element is much like a real-life
 * camera rig that contains a camera on it: it has controls to allow the user to
 * rotate and dolly the camera around in physical space more easily, in a
 * particular and specific. In the following example, try draging to rotate,
 * scrolling to zoom:
 *
 * <div id="cameraRigExample"></div>
 *
 * ## Slots
 *
 * - default (no name): Allows children of the camera rig to render as children
 * of the camera rig, like with elements that don't have a ShadowDOM.
 * - `camera-child`: Allows children of the camera rig to render relative to the
 * camera rig's underlying camera.
 */
@element('lume-camera-rig', autoDefineElements)
export class CameraRig extends Node {
	/**
	 * @property {true} hasShadow
	 *
	 * *override* *readonly*
	 *
	 * This is `true` because this element has a `ShadowRoot` with the mentioned
	 * [`slots`](#slots).
	 */
	override readonly hasShadow: true = true

	/**
	 * @property {number} initialPolarAngle
	 *
	 * *attribute*
	 *
	 * Default: `0`
	 *
	 * The initial vertical rotation of the camera. When the user drags up or
	 * down, the camera will move up and down as it rotates around the center.
	 * The camera is always looking at the center.
	 */
	@numberAttribute(0) initialPolarAngle = 0

	/**
	 * @property {number} minPolarAngle
	 *
	 * *attribute*
	 *
	 * Default: `-90`
	 *
	 * The lowest angle that the camera will rotate vertically.
	 */
	@numberAttribute(-90) minPolarAngle = -90

	/**
	 * @property {number} maxPolarAngle
	 *
	 * *attribute*
	 *
	 * Default: `90`
	 *
	 * The highest angle that the camera will rotate vertically.
	 *
	 * <div id="verticalRotationExample"></div>
	 *
	 * <script>
	 *   new Vue({
	 *     el: '#cameraRigExample',
	 *     template: '<live-code :template="code" mode="html>iframe" :debounce="200" />',
	 *     data: { code: cameraRigExample },
	 *   })
	 *   new Vue({
	 *     el: '#verticalRotationExample',
	 *     template: '<live-code :template="code" mode="html>iframe" :debounce="200" />',
	 *     data: { code: cameraRigVerticalRotationExample },
	 *   })
	 * </script>
	 */
	@numberAttribute(90) maxPolarAngle = 90

	/**
	 * @property {number} minHorizontalAngle
	 *
	 * *attribute*
	 *
	 * Default: `-Infinity`
	 *
	 * The smallest angle that the camera will be allowed to rotate to
	 * horizontally. The default of `-Infinity` means the camera will rotate
	 * laterally around the focus point indefinitely.
	 */
	@numberAttribute(-Infinity) minHorizontalAngle = -Infinity

	/**
	 * @property {number} maxHorizontalAngle
	 *
	 * *attribute*
	 *
	 * Default: `Infinity`
	 *
	 * The largest angle that the camera will be allowed to rotate to
	 * horizontally. The default of `Infinity` means the camera will rotate
	 * laterally around the focus point indefinitely.
	 */
	@numberAttribute(Infinity) maxHorizontalAngle = Infinity

	/**
	 * @property {number} initialDistance
	 *
	 * *attribute*
	 *
	 * Default: `1000`
	 *
	 * The initial distance that the camera will be away from the center point.
	 * When the performing a scroll gesture, the camera will zoom by moving
	 * towards or away from the center point (i.e. dollying).
	 */
	@numberAttribute(1000) initialDistance = 1000

	/**
	 * @property {number} minDistance
	 *
	 * *attribute*
	 *
	 * Default: `200`
	 *
	 * The smallest distance the camera can get to the center point when zooming
	 * by scrolling.
	 */
	@numberAttribute(200) minDistance = 200

	/**
	 * @property {number} maxDistance
	 *
	 * *attribute*
	 *
	 * Default: `2000`
	 *
	 * The largest distance the camera can get from the center point when
	 * zooming by scrolling.
	 */
	@numberAttribute(2000) maxDistance = 2000

	/**
	 * @property {boolean} active
	 *
	 * *attribute*
	 *
	 * Default: `true`
	 *
	 * When `true`, the underlying camera is set to [`active`](./PerspectiveCamera#active).
	 */
	@booleanAttribute(true) active = true

	/**
	 * @property {number} dollySpeed
	 *
	 * *attribute*
	 *
	 * Default: `1`
	 */
	@numberAttribute(1) dollySpeed = 1

	/**
	 * @property {boolean} interactive
	 *
	 * *attribute*
	 *
	 * When `false`, the user can zoom or rotate the camera, useful for static
	 * positioning of the camera programmatically.
	 */
	@booleanAttribute(true) interactive = true

	cam?: PerspectiveCamera

	rotationYTarget?: Node

	override template = () => html`
		<lume-node
			id="cameraY"
			size="1 1 1"
			ref=${(el: Node) => (this.rotationYTarget = el)}
			size-mode="proportional proportional proportional"
		>
			<lume-node
				id="cameraX"
				size="1 1 1"
				rotation=${() => untrack(() => [this.initialPolarAngle, 0, 0])}
				size-mode="proportional proportional proportional"
			>
				<slot
					name="camera"
					TODO="determine semantics for overriding the internal camera (this slot is not documented yet)"
				>
					<lume-perspective-camera
						ref=${(cam: PerspectiveCamera) => (this.cam = cam)}
						active=${() => this.active}
						position=${[0, 0, this.initialDistance]}
						align-point="0.5 0.5 0.5"
						far="10000"
					>
						<slot name="camera-child"></slot>
					</lume-perspective-camera>
				</slot>
			</lume-node>
		</lume-node>

		<slot></slot>
	`

	flingRotation?: FlingRotation
	scrollFling?: ScrollFling
	autorunStoppers?: StopFunction[]

	#startedInteraction = false

	startInteraction() {
		if (this.#startedInteraction) return
		this.#startedInteraction = true

		this.autorunStoppers = []

		this.autorunStoppers.push(
			autorun(() => {
				this.flingRotation = new FlingRotation({
					interactionInitiator: this.scene!,
					rotationYTarget: this.rotationYTarget!,
					minFlingRotationX: this.minPolarAngle,
					maxFlingRotationX: this.maxPolarAngle,
					minFlingRotationY: this.minHorizontalAngle,
					maxFlingRotationY: this.maxHorizontalAngle,
				}).start()

				createEffect(() => {
					if (this.interactive) this.flingRotation!.start()
					else this.flingRotation!.stop()
				})

				onCleanup(() => this.flingRotation?.stop())
			}),
			autorun(() => {
				this.scrollFling = new ScrollFling({
					target: this.scene!,
					y: this.initialDistance,
					minY: this.minDistance,
					maxY: this.maxDistance,
					scrollFactor: this.dollySpeed,
				}).start()

				createEffect(() => {
					this.scrollFling!.y

					untrack(() => (this.cam!.position.z = this.scrollFling!.y))
				})

				createEffect(() => {
					if (this.interactive) this.scrollFling!.start()
					else this.scrollFling!.stop()
				})

				onCleanup(() => this.scrollFling?.stop())
			}),
		)
	}

	stopInteraction() {
		if (!this.#startedInteraction) return
		this.#startedInteraction = false

		if (this.autorunStoppers) for (const stop of this.autorunStoppers) stop()
	}

	override _loadGL(): boolean {
		if (!super._loadGL()) return false
		this.startInteraction()
		return true
	}

	override _loadCSS(): boolean {
		if (!super._loadCSS()) return false
		this.startInteraction()
		return true
	}

	override _unloadGL(): boolean {
		if (!super._unloadGL()) return false
		if (!this.glLoaded && !this.cssLoaded) this.stopInteraction()
		return true
	}

	override _unloadCSS(): boolean {
		if (!super._unloadCSS()) return false
		if (!this.glLoaded && !this.cssLoaded) this.stopInteraction()
		return true
	}

	override disconnectedCallback() {
		super.disconnectedCallback()
		this.stopInteraction()
	}
}

import type {ElementAttributes} from '@lume/element'

declare module '@lume/element' {
	namespace JSX {
		interface IntrinsicElements {
			'lume-camera-rig': ElementAttributes<CameraRig, CameraRigAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'lume-camera-rig': CameraRig
	}
}
