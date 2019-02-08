import React, { Component } from 'react'
import IsoWorld, { Block, Point3 } from '../IsoWorld'
import { observer } from 'mobx-react'

interface BlockProps {
	iso: IsoWorld
}

class HoveredIndicator extends Component<BlockProps> {
	render() {
		const { cursor } = this.props.iso

		if (!cursor) return <g />

		const { silhouette } = cursor

		return (
			<g pointerEvents={'none'}>
				<path d={silhouette} stroke="none" fill="rgba(109, 223, 255, .5)" />
			</g>
		)
	}
}

export default observer(HoveredIndicator)
