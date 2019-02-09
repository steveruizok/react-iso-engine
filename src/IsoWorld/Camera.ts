import {
	IsoBlock,
	Point,
	Vertice,
	Verts,
	Point3,
	Bounds,
	ScreenVerts,
	IsoPoint,
	IsoBounds,
	IsoVerts,
	SeparationAxis,
	IsoSeparationAxis,
} from './index'

/**
* @description A camera for handling interactions of 3D space (x, y, z), isometric 2D space, and the 2D space of the screen.
* @remarks We have three separate coordinate systems used for different things:

1. Space (3D)

We apply the usual 3D coordinates to define the boxes using x,y,z.

2. Isometric (2D)

When the 3D space is flattened into an isometric view, we use oblique x and y
axes separated by 120 degrees.

All this does is treat all 3d coordinates as if they are at z=0.

For example, if use have a box at (0,0,0) and we raised it to (0,0,1), it would
look to be in the exact same position as a box at (1,1,0), so the 2d isometric
coordinates are (1,1).  This is a side effect of the isometric perspective.  So
the isometric 2D coordinates gets the "apparent" coordinates for all boxes if
they were at z=0.

This is accomplished by adding z to x and y.  That is all.

(Isometric coordinates are useful for determining when boxes overlap on the
screen.)

3. Screen (2D)

Before drawing, we convert the isometric coordinates to the usual x,y screen
coordinates.

This is done by multiplying each isometric 2D coordinate by its respective
oblique axis vector and taking the sum.

We then multiply this position by "scale" value to implement zoom in/out
features for the camera.

Then we add to an "origin" to implement panning features for the camera.
* @class Camera
*/
export class Camera {
	origin: Point
	scale: number

	/**
	 * Creates an instance of Camera.
	 * @param origin - the pixel location of the isometric origin
	 * @param scale - number of pixels per isometric unit
	 */
	constructor(origin: Point, scale: number) {
		this.origin = origin
		this.scale = scale
	}

	/**
	 * Convert the given 3D space coordinates to 2D isometric coordinates.
	 * @param point - The 3D point
	 * @returns - The isometric point
	 */
	spaceToIso(point: Point3) {
		let { x, y, z } = point

		x += z
		y += z

		return {
			x: x,
			y: y,
			h: ((x - y) * Math.sqrt(3)) / 2, // Math.cos(Math.PI/6)
			v: (x + y) / 2, // Math.sin(Math.PI/6)
		} as IsoPoint
	}

	/**
	 * Convert the given 2D isometric coordinates to 2D screen coordinates.
	 * @param point - The isometric point
	 * @returns - The 2D point
	 */
	isoToScreen(isoPoint: IsoPoint) {
		const { h, v } = isoPoint
		return {
			x: h * this.scale + this.origin.x,
			y: -v * this.scale + this.origin.y,
		}
	}

	/**
	 * Convert the given 3D space coordinates to 2D screen coordinates.
	 * @param  point
	 * @returns - The 2D point
	 */
	spaceToScreen(point: Point3): Point {
		return this.isoToScreen(this.spaceToIso(point))
	}

	/**
	 * Convert the given 2D screen coordinate to 2D isometric coordinate
	 * @param point - The 2D point
	 */
	screenToIso(point: Point3, floor = false): IsoPoint {
		point.x -= this.origin.x + point.z
		point.y -= this.origin.y + point.z

		const tHeight = this.scale
		const tWidth = this.scale * 1.732

		let y = (-point.x / (tWidth / 2) - point.y / (tHeight / 2)) / 2
		let x = (-point.y / (tHeight / 2) + point.x / (tWidth / 2)) / 2

		if (floor) {
			x = Math.floor(x)
			y = Math.floor(y)
		}

		return {
			x,
			y,
			h: -((x - y) * Math.sqrt(3)) / 2, // Math.cos(Math.PI/6)
			v: (x + y) / 2, // Math.sin(Math.PI/6)
		}
	}

	/**
	 * For the given block, get the min and max values on each 2D axis.
	 * @param block - The block to get bounds for
	 */
	getBounds(block: IsoBlock): Bounds {
		let { x, y, z } = block.position

		const { x: sx, y: sy, z: sz } = block.size
		return {
			minX: x,
			maxX: x + sx,
			minY: y,
			maxY: y + sy,
			minZ: z,
			maxZ: z + sz,
		}
	}

	/**
	 *  For the given block, get the min and max values on each isometric axis.
	 * @param block - The block to get isometric bounds for
	 */
	getIsoBounds(block: IsoBlock): IsoBounds {
		const { frontDown, backUp, leftDown, rightDown } = this.getIsoVerts(block)

		return {
			minX: frontDown.x,
			maxX: backUp.x,
			minY: frontDown.y,
			maxY: backUp.y,
			minH: leftDown.h,
			maxH: rightDown.h,
		}
	}

	/**
	 * Get a block's vertices with helpful aliases. Each vertex is named from its apparent position
	 * @param block - The block to measure
	 * @returns The vertices as a 3D point
	 */
	getIsoNamedSpaceVerts(block: IsoBlock): Verts {
		let { x, y, z } = block.position
		const { x: sx, y: sy, z: sz } = block.size

		return {
			rightDown: { x: x + sx, y: y, z: z },
			leftDown: { x: x, y: y + sy, z: z },
			backDown: { x: x + sx, y: y + sy, z: z },
			frontDown: { x: x, y: y, z: z },
			rightUp: { x: x + sx, y: y, z: z + sz },
			leftUp: { x: x, y: y + sy, z: z + sz },
			backUp: { x: x + sx, y: y + sy, z: z + sz },
			frontUp: { x: x, y: y, z: z + sz },
		}
	}

	/**
	 * Get the given block's vertices in flattened 2D isometric coordinates.
	 * @param block - The block to measure
	 * @returns The isometric vertices as isometric points
	 */
	getIsoVerts(block: IsoBlock): IsoVerts {
		const verts = this.getIsoNamedSpaceVerts(block)
		return Object.keys(verts).reduce(
			(acc: IsoVerts, cur: string) => {
				acc[cur as Vertice] = this.spaceToIso(verts[cur as Vertice])
				return acc
			},
			{} as IsoVerts
		)
	}

	/**
	 * Get a block's vertices with helpful aliases. * Each vertex is named from its apparent position in an isometric view.
	 * @param block - The block to measure
	 * @returns The screen vertices as 2D points
	 */
	getScreenVerts(block: IsoBlock): ScreenVerts {
		const verts = this.getIsoNamedSpaceVerts(block)
		return Object.keys(verts).reduce(
			(acc: ScreenVerts, cur: string) => {
				acc[cur as Vertice] = this.spaceToScreen(verts[cur as Vertice])
				return acc
			},
			{} as ScreenVerts
		)
	}

	/**
	 * 	Determine if the given ranges a and b are disjoint (i.e. do not overlap). For determining drawing order, this camera considers two ranges to be disjoint even if they share an endpoint. Thus, we use less-or-equal (<=) instead of strictly less (<).
	 * @param amin - The minimum of range a
	 * @param amax - The maximum of range a
	 * @param bmin - The minimum of range b
	 * @param bmax - The maximum of range b
	 * @returns True if the ranges are disjoint, or false if they overlap
	 */
	areRangesDisjoint(
		amin: number,
		amax: number,
		bmin: number,
		bmax: number
	): boolean {
		return amax <= bmin || bmax <= amin
	}

	/**
	 *If no isometric separation axis is found, then the two blocks do not overlap on the screen.
	 * @param block_a - The first block to compare
	 * @param block_b - The second block to compare
	 * @returns True if the two blocks overlap on screen, or false if they do not
	 */
	doBlocksOverlap(block_a: IsoBlock, block_b: IsoBlock): boolean {
		return this.getIsoSepAxis(block_a, block_b) !== null
	}

	/**
	 *If no 3D separation axis is found, then the two blocks intersect in 3D space.
	 * @param block_a - The first block to compare
	 * @param block_b - The second block to compare
	 * @returns True if the two blocks intersect in 3D space, or false if they do not
	 */
	doBlocksIntersect(block_a: IsoBlock, block_b: IsoBlock): boolean {
		return this.getSpaceSepAxis(block_a, block_b) === null
	}

	/**
	 * 	Convert 3D space coordinates to flattened 2D isometric coordinates. x and y coordinates are oblique axes separated by 120 degrees. h,v are the horizontal and vertical distances from the origin.
	 * @param block_a
	 * @param block_b
	 * @returns The axis of separation on the screen, if any
	 */
	getSpaceSepAxis(block_a: IsoBlock, block_b: IsoBlock): SeparationAxis | null {
		var a = this.getBounds(block_a)
		var b = this.getBounds(block_b)

		if (this.areRangesDisjoint(a.minX, a.maxX, b.minX, b.maxX)) {
			return 'x'
		} else if (this.areRangesDisjoint(a.minY, a.maxY, b.minY, b.maxY)) {
			return 'y'
		} else if (this.areRangesDisjoint(a.minZ, a.maxZ, b.minZ, b.maxZ)) {
			return 'z'
		} else {
			return null
		}
	}

	/**
	 * Try to find an axis in 2D isometric that separates the two given blocks. This helps identify if the the two blocks are overlap on the screen.
	 * @param block_a - The first block to compare
	 * @param block_b - The second block to compare
	 * @returns The axis of separation in isometric space, if any
	 */
	getIsoSepAxis(
		block_a: IsoBlock,
		block_b: IsoBlock
	): IsoSeparationAxis | null {
		var a = this.getIsoBounds(block_a)
		var b = this.getIsoBounds(block_b)

		if (this.areRangesDisjoint(a.minX, a.maxX, b.minX, b.maxX)) {
			return 'x'
		} else if (this.areRangesDisjoint(a.minY, a.maxY, b.minY, b.maxY)) {
			return 'y'
		} else if (this.areRangesDisjoint(a.minH, a.maxH, b.minH, b.maxH)) {
			return 'h'
		} else {
			return null
		}
	}

	/**
	 * In an isometric perspective of the two given blocks, determine if they will overlap each other on the screen. If they do, then return
	 * @param block_a - The first block to compare
	 * @param block_b - The second block to compare
	 * @returns The block in front
	 */
	getFrontBlock(block_a: IsoBlock, block_b: IsoBlock): IsoBlock | null {
		// If no isometric separation axis is found, then the two blocks do not overlap on the screen. This means there is no "front" block to identify.
		if (!this.getSpaceSepAxis(block_a, block_b)) return null

		// Find a 3D separation axis, and use it to determine which block is in front of the other.
		const [a, b] = [this.getBounds(block_a), this.getBounds(block_b)]

		switch (this.getSpaceSepAxis(block_a, block_b)) {
			case 'x':
				return a.minX < b.minX ? block_a : block_b
			case 'y':
				return a.minY < b.minY ? block_a : block_b
			case 'z':
				return a.minZ < b.minZ ? block_b : block_a
			default:
				throw 'Blocks must be non-intersecting!'
		}
	}
}
