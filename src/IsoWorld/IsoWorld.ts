import { range, pull } from './utils'
import { maxBy, sortBy } from 'lodash'
import anime from 'animejs'
import { decorate, action, observable } from 'mobx'

import {
	Block,
	Point,
	IsoPoint,
	Point3,
	Painter,
	IsoBlock,
	Camera,
	Origin,
} from './index'

interface IsoParams {
	width: number
	height: number
	blocks?: Block[]
	scale?: number
	origin?: Origin
}

const defaults = {
	origin: (width: number, height: number) => ({
		x: width / 2,
		y: height / 2,
	}),
	scale: 32,
	blocks: [],
}

export class IsoWorld {
	blocks: Block[]
	sorted: Block[] = []
	camera: Camera
	painter: Painter
	hovered?: Block
	selected?: Block
	cursor?: Block

	constructor(params: IsoParams = {} as IsoParams) {
		const {
			height,
			width,
			origin = defaults.origin,
			scale = defaults.scale,
			blocks = defaults.blocks,
		} = params
		this.camera = new Camera(origin(height, width), scale)
		this.painter = new Painter(this.camera)
		this.blocks = blocks
		this.sort()
		this.render()
	}

	sort() {
		this.sorted = this.getSorted()
	}

	/**
	 * Get the depth-sorted state of the current blocks
	 * @return The sorted blocks array
	 */
	getSorted(): IsoBlock[] {
		return this.sortBlocks(this.blocks)
	}

	/**
	 * Set (or clear) the isoWorld's hovered block
	 * @param block - The block (or lack of block) to hover
	 */
	setHovered = (block?: Block) => {
		this.hovered = block
	}

	/**
	 * Animate a block's size or position
	 * @param block - The block to animate
	 * @param property - The property to animate
	 * @param value - A 3D point to animate to
	 * @param duration - The animation's duration
	 */
	animateBlock = (
		block: IsoBlock,
		property: 'size' | 'position',
		value: Point3,
		duration = 360
	) => {
		if (block.busy) return
		block.busy = true

		anime({
			targets: block[property],
			easing: 'easeOutQuad',
			duration,
			update: () => {
				this.renderBlock(block)
				this.sort()
			},
			complete: () => {
				block.busy = false
			},
			...value,
		})
	}

	moveBlock = (
		block: IsoBlock,
		direction: 'north' | 'east' | 'south' | 'west'
	) => {
		const { x, y, z } = block.position
		let next: Point3

		switch (direction) {
			case 'north':
				next = { x: x + 1, y, z }
				break
			case 'east':
				next = { x, y: y - 1, z }
				break
			case 'south':
				next = { x: x - 1, y, z }
				break
			case 'west':
				next = { x, y: y + 1, z }
				break
			default:
				next = { x, y, z }
		}

		const nextBlocks = this.getBlocks(next)
		const maxZ = maxBy(nextBlocks, (b) => b.position.z)
		if (!maxZ) return
		next.z = maxZ.position.z + maxZ.size.z

		block.position = next
		this.render()
		// this.animateBlock(block, 'position', next)
	}

	/**
	 * Render a block's faces, edges, and other points
	 * @param block - The block to render
	 */
	renderBlock: (block: IsoBlock) => IsoBlock = (block) => {
		Object.assign(block, {
			edge: this.painter.getEdge(block),
			faces: this.painter.getFaces(block),
			silhouette: this.painter.getSilhouette(block),
			outline: this.painter.getOutline(block),
		})

		return block
	}

	/**
	 * Sort and render all blocks
	 */
	render: () => IsoBlock[] = () => {
		this.sort()
		return this.sorted.map(this.renderBlock)
	}

	/**
	 * Add a block to this IsoWorld
	 * @param blocks - The block or blocks to add
	 * @return The new blocks array
	 */
	addBlocks(blocks: IsoBlock | IsoBlock[]): IsoBlock[] {
		Array.isArray(blocks)
			? (this.blocks = this.blocks.concat(blocks))
			: (this.blocks = [...this.blocks, blocks])

		this.render()
		return this.blocks
	}

	/**
	 * Remove a block from this IsoWorld
	 * @param block - The block to remove
	 * @return The new blocks array
	 */
	removeBlock(blocks: IsoBlock | IsoBlock[]): IsoBlock[] {
		if (Array.isArray(blocks)) {
			for (let block of blocks) {
				pull(this.blocks, block)
			}
		} else {
			pull(this.blocks, blocks)
		}

		return this.blocks
	}

	/**
	 *  Sort blocks in the order that they should be drawn for the given camera.
	 * @param blocks - The blocks to sort
	 */
	sortBlocks(blocks: Block[]): Block[] {
		var i: number,
			j: number,
			numBlocks = blocks.length

		// Initialize the list of blocks that each block is behind.
		for (i = 0; i < numBlocks; i++) {
			blocks[i].blocksBehind = []
			blocks[i].blocksInFront = []
		}

		// For each pair of blocks, determine which is in front and behind.
		var a: Block, b: Block, frontBlock: Block | null
		for (i = 0; i < numBlocks; i++) {
			a = blocks[i]

			for (j = i + 1; j < numBlocks; j++) {
				b = blocks[j]
				frontBlock = this.camera.getFrontBlock(a, b)
				if (frontBlock) {
					if (a === frontBlock) {
						a.blocksBehind.push(b)
						b.blocksInFront.push(a)
					} else {
						b.blocksBehind.push(a)
						a.blocksInFront.push(b)
					}
				}
			}
		}

		// Get list of blocks we can safely draw right now.
		// These are the blocks with nothing behind them.
		var blocksToDraw: Block[] = []
		for (i = 0; i < numBlocks; i++) {
			if (blocks[i].blocksBehind.length === 0) {
				blocksToDraw.push(blocks[i])
			}
		}

		// While there are still blocks we can draw...
		var blocksDrawn: Block[] = []
		while (blocksToDraw.length > 0) {
			// Draw block by removing one from "to draw" and adding
			// it to the end of our "drawn" list.
			var block = blocksToDraw.pop()
			if (!block) return blocksDrawn
			blocksDrawn.push(block)

			// Tell blocks in front of the one we just drew
			// that they can stop waiting on it.
			for (j = 0; j < block.blocksInFront.length; j++) {
				let front = block.blocksInFront[j]

				// Add this front block to our "to draw" list if there's
				// nothing else behind it waiting to be drawn.
				pull(front.blocksBehind, block)
				if (front.blocksBehind.length === 0) {
					blocksToDraw.push(front)
				}
			}
		}

		// Determine whether block is an outside edge
		blocksDrawn.forEach((block) => {
			block.adjacent = this.getAdjacentBlocks(block)
		})

		return blocksDrawn
	}

	// hitTest = (point: Point) => {
	// 	const ccw = (A: number[], B: number[], C: number[]) =>
	// 		(C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0])

	// 	const intersect = (A: number[], B: number[], C: number[], D: number[]) =>
	// 		ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D)

	// 	const hitTestBlock = (point: Point, block: Block) => {
	// 		const vs = Object.values(this.camera.getScreenVerts(block))
	// 		const points = vs.map((p) => [p.x, p.y])

	// 		let inside = false
	// 		let i = 0
	// 		let j = vs.length - 1

	// 		while (i < points.length) {
	// 			if (intersect([0, point.y], [point.x, point.y], points[i], points[j])) {
	// 				inside = !inside
	// 			}
	// 			j = i++
	// 		}
	// 		return inside
	// 	}

	// 	return this.blocks.find((block) => hitTestBlock(point, block))
	// }

	getBlockAtIso = (point: Point3) => {
		let { x, y, z } = point
		x = Math.floor(x)
		y = Math.floor(y)
		z = Math.floor(z)

		return this.blocks.find((block) => {
			const { x: px, y: py, z: pz } = block.position

			return x === px && y === py && z === pz
		})
	}

	getBlocks = (point: Point3) => {
		let { x, y, z } = point
		x = Math.floor(x)
		y = Math.floor(y)
		z = Math.floor(z)

		return sortBy(
			this.blocks.filter((block) => {
				const { x: px, y: py } = block.position

				return x === px && y === py
			}),
			'position.z'
		)
	}

	/**
	 * Set the isoworld's cursor
	 * @param point - The 3D space point of the cursor
	 */
	setCursor = (point: Point3 | null, shape = { x: 1, y: 1, z: 1 }) => {
		if (!point) {
			this.cursor = undefined
			return
		}

		this.cursor = new Block(point, shape)
		this.renderBlock(this.cursor)
	}

	getAdjacentBlocks(block: IsoBlock) {
		const { x, y, z } = block.position

		return {
			north: this.getBlockAtIso({ x: x + 1, y, z }),
			west: this.getBlockAtIso({ x, y: y + 1, z }),
			above: this.getBlockAtIso({ x, y, z: z + 1 }),
			south: this.getBlockAtIso({ x: x - 1, y, z }),
			east: this.getBlockAtIso({ x, y: y - 1, z }),
			below: this.getBlockAtIso({ x, y, z: z - 1 }),
		}
	}
}
