import React, { Component } from 'react'
import './App.css'

import { observer } from 'mobx-react'
import { decorate, observe, observable, action } from 'mobx'

import IsoWorld, { Block, IsoPoint, Point } from './IsoWorld'
import { range, groupBy, rotate } from './IsoWorld/utils'

import SVGBlock from './components/SVGBlock'
import HoveredIndicator from './components/HoveredIndicator'
import ZCursorIndicator from './components/ZCursorIndicator'

import iso from './state'

let i = 0

interface Props {
	iso: IsoWorld
}

class App extends Component<Props> {
	container: React.RefObject<HTMLDivElement> = React.createRef()
	mousePoint: Point = { x: 0, y: 0 }

	static defaultProps = {
		iso,
	}

	state = {
		showCursor: false,
		zCursor: 0,
		blocks: [] as Block[],
	}

	pointToIso(point: Point, floor = true) {
		const container = this.container.current
		const { iso } = this.props

		if (!container) return

		const point3 = {
			x: point.x - container.offsetLeft,
			y: point.y - container.offsetTop,
			z: this.state.zCursor,
		}

		return iso.camera.screenToIso(point3, floor)
	}

	componentWillMount() {
		const { iso } = this.props
		this.setState({
			blocks: iso.render(),
		})

		observe(iso, (change) => {
			if (change.name === 'blocks') {
				this.setState({
					blocks: iso.render(),
				})
			}
		})

		window.addEventListener('keypress', (event) => {
			const { zCursor } = this.state
			const keyHandlers: { [key: string]: any } = {
				q: () => this.setState({ zCursor: zCursor - 1 }),
				e: () => this.setState({ zCursor: zCursor + 1 }),
			}

			try {
				keyHandlers[event.key]()
				this.setCursor(this.mousePoint, false)
			} catch (e) {}
		})
	}

	componentDidMount() {}

	handleClick = (event: React.MouseEvent<any, MouseEvent>) => {
		const isoPoint = this.pointToIso(this.mousePoint)
		if (!isoPoint) return

		this.createBlock(isoPoint)
	}

	handleMouseMove = (event: React.MouseEvent<any, MouseEvent>) => {
		this.mousePoint = { x: event.pageX, y: event.pageY }
		this.setCursor(this.mousePoint, event.buttons === 1)
	}

	setCursor = (point: Point, click: boolean) => {
		const { showCursor, zCursor } = this.state
		if (!showCursor) return

		const isoPoint = this.pointToIso(point)
		if (!isoPoint) return

		if (click) this.createBlock(isoPoint)

		iso.setCursor({ x: isoPoint.x, y: isoPoint.y, z: zCursor })
	}

	createBlock(point: IsoPoint) {
		const { x, y } = point
		const { zCursor: z } = this.state

		iso.addBlocks(new Block({ x, y, z }, { x: 1, y: 1, z: 1 }))
	}

	render() {
		const { iso } = this.props
		const { blocks, zCursor, showCursor } = this.state

		let blocksToShow = { focus: [], lower: [], higher: [] } as {
			[key: string]: Block[]
		}

		if (showCursor) {
			blocks.reduce((acc, cur) => {
				if (cur.position.z < zCursor) {
					acc.lower.push(cur)
				} else if (cur.position.z > zCursor) {
					acc.higher.push(cur)
				} else {
					acc.focus.push(cur)
				}
				return acc
			}, blocksToShow)
		} else {
			blocksToShow.focus = blocks
		}

		return (
			<div className="App">
				<div
					ref={this.container}
					style={{
						margin: '0 auto',
						height: 600,
						width: 400,
						position: 'relative',
						cursor: 'none',
					}}
					onMouseEnter={() => this.setState({ showCursor: true })}
					onMouseLeave={() =>
						this.setState({ showCursor: false }, () => iso.setCursor(null))
					}
				>
					<svg
						viewBox="0,0,400,600"
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							border: '1px solid #000',
							height: 600,
							width: 400,
						}}
						onMouseMove={this.handleMouseMove}
						onClick={this.handleClick}
					>
						<g key={`blocks_z_layer_lower`} opacity={0.45}>
							{blocksToShow.lower.map((block, index) => {
								return (
									<SVGBlock
										key={`block_${index}`}
										block={block}
										point={iso.camera.spaceToScreen(block.position)}
									/>
								)
							})}
						</g>
						<g key={`blocks_z_layer_focused`} opacity={1}>
							{blocksToShow.focus.map((block, index) => {
								return (
									<SVGBlock
										key={`block_${index}`}
										block={block}
										point={iso.camera.spaceToScreen(block.position)}
									/>
								)
							})}
						</g>
						<g key={`blocks_z_layer_higher`} opacity={0.45}>
							{blocksToShow.higher.map((block, index) => {
								return (
									<SVGBlock
										key={`block_${index}`}
										block={block}
										point={iso.camera.spaceToScreen(block.position)}
									/>
								)
							})}
						</g>
						))}
						{showCursor && (
							<>
								<HoveredIndicator iso={iso} />
								<ZCursorIndicator iso={iso} zCursor={zCursor} />
							</>
						)}
					</svg>
				</div>
			</div>
		)
	}
}

export default App
// export default observer(App)
