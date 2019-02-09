import { decorate, observable, action, computed } from 'mobx'

import IsoWorld, { Block } from '../IsoWorld'
import { range } from '../IsoWorld/utils'

decorate(IsoWorld, {
	// blocks: observable,
	sorted: observable,
	addBlocks: action,
	hovered: observable,
	cursor: observable,
	setHovered: action,
	moveBlock: action,
	selected: observable,
	sort: action,
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

blocks.push(new Block({ x: 5, y: 5, z: 1 }, { x: 1, y: 1, z: 1 }))

const player = new Block(
	{ x: 0.25, y: 0.25, z: 1 },
	{ x: 0.5, y: 0.5, z: 1.6 },
	{ color: 'yellow' }
)

blocks.push(player)

const iso = new IsoWorld({
	height: 600,
	width: 400,
	scale: 20,
	origin: (h, w) => ({ x: w / 2, y: h * 0.75 }),
	blocks: blocks,
})

iso.selected = player

export default iso
export { Block, IsoWorld }
