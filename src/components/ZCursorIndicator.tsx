import React, { Component } from 'react'
import IsoWorld, { Block, Point3 } from '../IsoWorld'
import { observer } from 'mobx-react'

interface BlockProps {
	iso: IsoWorld
	zCursor: number
}

class ZCursorIndicator extends Component<BlockProps> {
	render() {
		const { iso, zCursor } = this.props
		const { scale, origin } = iso.camera
		const { x, y } = origin

		return (
			<g
				transform={`translate(${x}, ${y - zCursor * scale})`}
				pointerEvents={'none'}
			>
				<path
					d={`M -8,8 L 8,8 0,0`}
					stroke="none"
					fill="rgba(109, 223, 255, .5)"
				/>
				<text
					x={0}
					y={24}
					textAnchor={'middle'}
					fontSize={12}
					fontWeight="bold"
					fill="rgba(109, 223, 255, .5)"
				>
					{zCursor}
				</text>
			</g>
		)
	}
}

export default observer(ZCursorIndicator)
