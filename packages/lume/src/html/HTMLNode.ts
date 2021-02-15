// import styles from './HTMLNode.style'
import DeclarativeBase, {initDeclarativeBase} from './DeclarativeBase'

initDeclarativeBase()

export default class HTMLNode extends DeclarativeBase {
	// TODO Delete this property when ShadowDOM support is finished, which will
	// in turn cause all nodes to have a shadow root, and everything should
	// continue to work (as a proof of concept that ShadowDOM support is
	// complete).
	// prettier-ignore
	get root() { return this }
	set root(_v) {}
	// TODO ^ Replace with a hasShadow option from @lume/element or similar.

	static css = /*css*/ `
		:host {
			/*
			 * All items of the scene graph are hidden until they are mounted in
			 * a scene (this changes to display:block). This gets toggled
			 * between "none" and "block" by ImperativeBase depending on if CSS
			 * rendering is enabled.
			 */
			display: none;

			box-sizing: border-box;
			position: absolute;
			top: 0;
			left: 0;

			/*
			 * Defaults to [0.5,0.5,0.5] (the Z axis doesn't apply for DOM
			 * elements, but does for 3D objects in WebGL that have any size
			 * along Z.)
			 */
			transform-origin: 50% 50% 0; /* default */

			transform-style: preserve-3d;
		}
	`
}

export {HTMLNode}
