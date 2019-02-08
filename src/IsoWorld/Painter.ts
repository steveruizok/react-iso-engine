import { Camera } from './Camera'
import { toPathData } from './utils'
import { IsoBlock } from './index'

export class Painter {
	camera: Camera

	constructor(camera: Camera) {
		this.camera = camera
	}

	getEdge(block: IsoBlock): string {
		const v = this.camera.getScreenVerts(block)
		const { north, east, south, west, above, below } = block.adjacent

		let l = ''
		let r = ''

		if (!north && !above) r += toPathData([v.backUp, v.rightUp], false)
		if (!north && !east) r += toPathData([v.rightUp, v.rightDown], false)
		if (!east && !below) r += toPathData([v.rightDown, v.frontDown], false)

		if (!west && !above) l += toPathData([v.backUp, v.leftUp], false)
		if (!west && !south) l += toPathData([v.leftUp, v.leftDown], false)
		if (!south && !below) l += toPathData([v.leftDown, v.frontDown], false)

		return l + r
	}

	getSilhouette(block: IsoBlock): string {
		const v = this.camera.getScreenVerts(block)
		return toPathData([
			v.frontDown,
			v.leftDown,
			v.leftUp,
			v.backUp,
			v.rightUp,
			v.rightDown,
		])
	}

	getFaces(block: IsoBlock): string[] {
		const v = this.camera.getScreenVerts(block)

		return [
			[v.frontUp, v.leftUp, v.backUp, v.rightUp],
			[v.frontDown, v.leftDown, v.leftUp, v.frontUp],
			[v.frontDown, v.rightDown, v.rightUp, v.frontUp],
		].map((face) => toPathData(face))
	}

	getOutline(block: IsoBlock): string {
		const v = this.camera.getScreenVerts(block)

		return (
			toPathData([
				v.frontDown,
				v.leftDown,
				v.leftUp,
				v.backUp,
				v.rightUp,
				v.rightDown,
			]) +
			toPathData([v.frontUp, v.frontDown]) +
			toPathData([v.frontUp, v.leftUp]) +
			toPathData([v.frontUp, v.rightUp])
		)
	}
}
