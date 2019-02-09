import { Point3, IsoBounds, Verts } from './index'

interface SpriteProps {
	position: Point3
	size: Point3
	spriteSheet: SpriteSheet
}

interface SpriteAnimation {
	start: number
	end: number
}

interface SpriteSheet {
	src: string
	spriteHeight: number
	spriteWidth: number
	animations: { [key: string]: SpriteAnimation }
}

export class Position {
	position: Point3
	size: Point3
	spriteSheet: SpriteSheet

	constructor(props = {} as SpriteProps) {
		const { position, spriteSheet, size } = props
		this.position = position
		this.size = size
		this.spriteSheet = spriteSheet
	}
}
