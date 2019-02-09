import React, { Component } from 'react'

interface TipProps {
	label: string
	path: string
	fill?: string
}

const KeyTip: React.FunctionComponent<TipProps> = ({
	label,
	path,
	fill = '#89dcff',
}) => {
	return (
		<div style={{ color: fill }}>
			<b>{label}</b>
			<svg
				style={{
					width: 24,
					height: 24,
					position: 'relative',
					top: 8,
				}}
				viewBox="0 0 24 24"
			>
				<path fill={fill} d={path} />
			</svg>
		</div>
	)
}

export default KeyTip
