import React, { Component } from 'react'
import { Block, Point3, Point } from '../IsoWorld'
import { observer } from 'mobx-react'
import CubeSprite from './sprites/cube.png'

interface BlockProps {
	block: Block
	point: Point
	onMouseEnter?: (block: Block) => void
	onClick?: (block: Block) => void
}
let i = 0

const colors = {
	grey: ['#CCC', '#AAA', '#888', '#777', '#444', '#222'],
	yellow: ['#FFA', '#FD8', '#FA7', '#F74', '#F32'],
}

class SVGBlock extends Component<BlockProps> {
	render() {
		const { block, point, onMouseEnter, onClick } = this.props
		const { x, y, z } = block.position

		const { color, faces, edge, silhouette } = block

		const key = `${x}_${y}_${z}`

		const selectedColor = colors[color as 'grey' | 'yellow']

		// if (key === '0_0_0') {
		// 	console.log('rendered block')
		// }

		return (
			<g
				onMouseEnter={
					onMouseEnter
						? (ev) => {
								onMouseEnter(block)
						  }
						: undefined
				}
				onClick={onClick ? () => onClick(block) : undefined}
			>
				{faces.map((face, faceIndex) => {
					let fill = selectedColor[1 + faceIndex]

					return (
						<path
							key={`block_${key}_face_${faceIndex}`}
							d={face}
							stroke="none"
							fill={fill}
							strokeWidth="1"
						/>
					)
				})}
				{edge && (
					<path
						d={edge}
						stroke={selectedColor[4]}
						fill="none"
						strokeWidth={0.5}
					/>
				)}
				{/* <image
					x={point.x - 20}
					y={point.y - 40}
					width={42}
					height={42}
					xlinkHref={CubeSprite}
					opacity={1}
				/> */}
			</g>
		)
	}
}

export default SVGBlock
