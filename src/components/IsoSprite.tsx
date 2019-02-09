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

class IsoSprite extends Component<BlockProps> {
	render() {
		const { block, point, onMouseEnter, onClick } = this.props

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
				<image
					x={point.x - 20}
					y={point.y - 40}
					width={42}
					height={42}
					xlinkHref={CubeSprite}
					opacity={1}
				/>
			</g>
		)
	}
}

export default observer(IsoSprite)
