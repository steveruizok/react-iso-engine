import { Point } from './index'
import { chunk } from 'lodash'

// Helpers

export function range(num: number) {
	return [...Array(num)].map((_, i) => i)
}

export function pull(array: any[], element: any) {
	array.splice(array.indexOf(element), 1)
}

export function toPoint(point: Point) {
	return `${point.x},${point.y} `
}

export function toPathData(points: Point[], close = true) {
	return `M ${toPoint(points[0])} L ${points.slice(1).map((p) => toPoint(p))} ${
		close ? 'Z' : ''
	}`
}

export function groupBy(xs: any[], key: string) {
	return xs.reduce(function(rv, x) {
		;(rv[x[key]] = rv[x[key]] || []).push(x)
		return rv
	}, {})
}

export function rotate<T>(array: T[], length: number) {
	const matrix = chunk(array, length)
	const n = length
	const x = Math.floor(n / 2)
	const y = n - 1

	for (let i = 0; i < x; i++) {
		for (let j = i; j < y - i; j++) {
			let k = matrix[i][j]
			matrix[i][j] = matrix[y - j][i]
			matrix[y - j][i] = matrix[y - i][y - j]
			matrix[y - i][y - j] = matrix[j][y - i]
			matrix[j][y - i] = k
		}
	}

	return matrix.flat()
}
