import { Point3, AdjacentBlocks } from './index'
import { decorate, action, observable } from 'mobx'

// Block

export class Block {
	faces = [] as string[]
	silhouette = ''
	outline = ''
	edge = ''
	adjacent: AdjacentBlocks = {
		north: undefined,
		east: undefined,
		south: undefined,
		west: undefined,
		above: undefined,
		below: undefined,
	}

	position: Point3
	size: Point3
	blocksBehind: Block[] = []
	blocksInFront: Block[] = []

	constructor(position: Point3, size: Point3) {
		this.position = position
		this.size = size
	}

	moveTo = (position: Point3) => {
		this.position = position
	}

	resizeTo = (size: Point3) => {
		this.size = size
	}
}
