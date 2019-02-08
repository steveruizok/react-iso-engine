import { decorate, observable, action } from 'mobx'

import IsoWorld, { Block } from '../IsoWorld'
import { range } from '../IsoWorld/utils'

decorate(IsoWorld, {
	blocks: observable,
	addBlocks: action,
	hovered: observable,
	cursor: observable,
	setHovered: action,
})

decorate(Block, {
	position: observable,
	size: observable,
	silhouette: observable,
	faces: observable,
	moveTo: action.bound,
	resizeTo: action.bound,
})

let blocks

blocks = []

blocks = range(10)
	.map((y) =>
		range(10).map(
			(x) =>
				new Block(
					{ x, y, z: 0 },
					{ x: 1, y: 1, z: 1 } //Math.ceil(Math.random() * 5) }
				)
		)
	)
	.flat()

blocks.push(new Block({ x: 0, y: 0, z: 0 }, { x: 1, y: 2, z: 1 }))
blocks.push(new Block({ x: 0, y: 0, z: 1 }, { x: 1, y: 2, z: 1 }))

export default new IsoWorld({
	height: 600,
	width: 400,
	scale: 20,
	origin: (h, w) => ({ x: w / 2, y: h * 0.75 }),
	blocks: blocks,
})

export { Block, IsoWorld }
