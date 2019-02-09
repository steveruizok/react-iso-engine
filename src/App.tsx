import React, { Component } from 'react'
import './App.css'

import { observer } from 'mobx-react'
import { decorate, observe, observable, action } from 'mobx'

import IsoWorld, { Block, IsoPoint, Point } from './IsoWorld'
import { range, groupBy, rotate } from './IsoWorld/utils'

import KeyTip from './components/KeyTip'
import SVGBlock from './components/SVGBlock'
import IsoSprite from './components/IsoSprite'
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
		// const { iso } = this.props

		// this.setState({
		// 	blocks: iso.render(),
		// })

		// observe(iso, (change) => {
		// 	console.log(change)
		// 	if (change.name === 'blocks') {
		// 		console.log('updated')
		// 		this.setState({
		// 			blocks: iso.render(),
		// 		})
		// 	}
		// })

		window.addEventListener('keypress', (event) => {
			const { zCursor } = this.state
			const keyHandlers: { [key: string]: any } = {
				q: () => this.setState({ zCursor: zCursor - 1 }),
				e: () => this.setState({ zCursor: zCursor + 1 }),
				w: () => iso.selected && iso.moveBlock(iso.selected, 'north'),
				s: () => iso.selected && iso.moveBlock(iso.selected, 'south'),
				a: () => iso.selected && iso.moveBlock(iso.selected, 'west'),
				d: () => iso.selected && iso.moveBlock(iso.selected, 'east'),
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
		const { sorted } = iso
		const { zCursor, showCursor } = this.state

		let blocksToShow = { focus: [], lower: [], higher: [] } as {
			[key: string]: Block[]
		}

		if (showCursor) {
			sorted.reduce((acc, cur) => {
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
			blocksToShow.focus = sorted
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
						background: '#222',
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
					<div
						style={{
							position: 'absolute',
							bottom: 16,
							left: 16,
							display: 'flex',
							color: '#88ddff',
							fontSize: 20,
							userSelect: 'none',
						}}
					>
						<div>
							<KeyTip
								label="E"
								path="M14,20H10V11L6.5,14.5L4.08,12.08L12,4.16L19.92,12.08L17.5,14.5L14,11V20Z"
							/>
							<KeyTip
								label="Q"
								path="M10,4H14V13L17.5,9.5L19.92,11.92L12,19.84L4.08,11.92L6.5,9.5L10,13V4Z"
							/>
						</div>
						<div>
							<KeyTip
								fill="#ffdd87"
								label="A"
								path="M9.12,11.94V16.89H5.69V5.69H16.89V9.12H11.94L18.31,15.5L15.5,18.31L9.12,11.94Z"
							/>
							<KeyTip
								fill="#ffdd87"
								label="S"
								path="M15.5,5.69L18.31,8.5L11.94,14.89H16.89V18.31H5.69V7.11H9.12V12.06L15.5,5.69Z"
							/>
						</div>
						<div>
							<KeyTip
								fill="#ffdd87"
								label="W"
								path="M8.5,18.31L5.69,15.5L12.06,9.12H7.11V5.69H18.31V16.89H14.89V11.94L8.5,18.31Z"
							/>
							<KeyTip
								fill="#ffdd87"
								label="D"
								path="M14.89,12.06V7.11H18.31V18.31H7.11V14.89H12.06L5.69,8.5L8.5,5.69L14.89,12.06Z"
							/>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

// export default App
export default observer(App)
