import { Block } from './Block'
import { Camera } from './Camera'
import { IsoWorld } from './IsoWorld'
import { Painter } from './Painter'

export type Origin = (width: number, height: number) => Point

export type SeparationAxis = 'x' | 'y' | 'z'
export type IsoSeparationAxis = 'x' | 'y' | 'h'

export interface Point {
	x: number
	y: number
}

export interface Point3 {
	x: number
	y: number
	z: number
}

export interface IsoPoint {
	x: number
	y: number
	h: number
	v: number
}

export interface Bounds {
	minX: number
	maxX: number
	minY: number
	maxY: number
	minZ: number
	maxZ: number
}

export interface IsoBounds {
	minX: number
	maxX: number
	minY: number
	maxY: number
	minH: number
	maxH: number
}

export interface Verts {
	rightDown: Point3
	leftDown: Point3
	backDown: Point3
	frontDown: Point3
	rightUp: Point3
	leftUp: Point3
	backUp: Point3
	frontUp: Point3
}

export type IsoVerts = {
	rightDown: IsoPoint
	leftDown: IsoPoint
	backDown: IsoPoint
	frontDown: IsoPoint
	rightUp: IsoPoint
	leftUp: IsoPoint
	backUp: IsoPoint
	frontUp: IsoPoint
}

export type ScreenVerts = {
	rightDown: Point
	leftDown: Point
	backDown: Point
	frontDown: Point
	rightUp: Point
	leftUp: Point
	backUp: Point
	frontUp: Point
}

export type Vertice = keyof Verts

export type IsoBlock = Block

export interface AdjacentBlocks {
	north?: Block
	east?: Block
	south?: Block
	west?: Block
	above?: Block
	below?: Block
}

export { Block, Painter, Camera }

export default IsoWorld
