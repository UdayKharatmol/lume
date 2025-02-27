import type {RoundedRectangle, RoundedRectangleAttributes} from './RoundedRectangle'
import type {ReactElementAttributes} from '@lume/element/src/react'
import type {
	PhongMaterialBehavior,
	PhongMaterialBehaviorAttributes,
} from '../behaviors/mesh-behaviors/materials/PhongMaterialBehavior'

// React users can import this to have appropriate types for the element in their JSX markup.
declare global {
	namespace JSX {
		interface IntrinsicElements {
			'lume-rounded-rectangle': ReactElementAttributes<RoundedRectangle, RoundedRectangleAttributes> &
				ReactElementAttributes<PhongMaterialBehavior, PhongMaterialBehaviorAttributes>
		}
	}
}
