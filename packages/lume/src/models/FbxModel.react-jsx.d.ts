import type {FbxModel, FbxModelAttributes} from './FbxModel'
import type {ReactElementAttributes} from '@lume/element'

// React users can import this to have appropriate types for the element in their JSX markup.
declare global {
	namespace JSX {
		interface IntrinsicElements {
			'lume-fbx-model': ReactElementAttributes<FbxModel, FbxModelAttributes>
		}
	}
}
