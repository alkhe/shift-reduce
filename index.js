require('colors')
/*
($) Z = S
(0) S = S + P
(1)   | P
(2) P = P * n
(3)   | n
*/

const SHIFT = 0
const REDUCE = 1
const ACCEPT = 2
const ERROR = 3

const s = q => ({ type: SHIFT, state: q })
const r = r => ({ type: REDUCE, rule: r })
const a = { type: ACCEPT }
const e = { type: ERROR }

const alphabet = {
	PLUS: 0,
	STAR: 1,
	NUM: 2,
	EOF: 3,
	SUM: 4,
	PRODUCT: 5
}

const symbol = (type, data) => ({ type, data })

const rules = [
	{ size: 3, lhs: 'SUM' },
	{ size: 1, lhs: 'SUM' },
	{ size: 3, lhs: 'PRODUCT' },
	{ size: 1, lhs: 'PRODUCT' }
]

// table : [[Action]]
const table = [
	//+  |  *  |  n  |  $  |  S  |  P  |
	[e   , e   , s(7), e   , s(1), s(4)], // 0
	[s(2), e   , e   , a   , e   , e   ], // 1
	[e   , e   , s(7), e   , e   , s(3)], // 2
	[r(0), s(5), r(0), r(0), r(0), r(0)], // 3
	[r(1), s(5), r(1), r(1), r(1), r(1)], // 4
	[e   , e   , s(6), e   , e   , e   ], // 5
	[r(2), r(2), r(2), r(2), r(2), r(2)], // 6
	[r(3), r(3), r(3), r(3), r(3), r(3)]  // 7
]

// input : [Symbol]
const input = [
	['NUM', 1],
	['PLUS', '+'],
	['NUM', 2],
	['STAR', '*'],
	['NUM', 3],
	['PLUS', '+'],
	['NUM', 4],
	['EOF', '$']
].map(tuple => symbol(...tuple))

const log = console.log.bind(console)
const debug = x => console.dir(x, { depth: null })
const isObject = x => x.constructor === Object
const isArray = x => x.constructor === Array
const serialize_symbol = s => {
	if (isObject(s)) {
		const { data } = s
		const children = isArray(data) ? data.map(serialize_symbol).join(' ') : serialize_symbol(data)
		return out = '(' + s.type.blue.bold + ' ' + children + ')'
	} else if (isArray(s)) {
		return s.map(serialize_symbol).join('\n')
	} else {
		return String(s).red.bold
	}
}
const serialize_action = a => {
	switch (a.type) {
		case SHIFT:
			return `SHIFT ${ a.state }`.green.bold
		case REDUCE:
			return `REDUCE ${ a.rule }`.yellow.bold
		case ACCEPT:
			return 'ACCEPT'.cyan.bold
		case ERROR:
			return 'ERROR'.red.bold
	}
}
const dump = (n, x) => (log(n), debug(x))
const top = xs => xs[xs.length - 1]
const times = (n, f) => Array(n).fill(undefined).map(f)

const parse = (rules, table, input) => {
	const states = [0]
	const symbols = []
	
	let i = 0
	let candidate = input[0]

	while (i < input.length) {
		log('SYMBOLS'.white)
		if (symbols.length > 0) log(symbols.map(serialize_symbol).join('\n'))
		log('STATES'.white, states.join(' '))

		const state = top(states)
		const row = table[state]
		const col = alphabet[candidate.type]
		const action = row[col]

		log('CANDIDATE'.white, serialize_symbol(candidate))
		log('COORDINATES'.white, state, col)
		log(serialize_action(action))

		switch (action.type) {
			case SHIFT: {
				states.push(action.state)
				symbols.push(candidate)

				i++
				candidate = input[i]

				break
			}
			case REDUCE: {
				const r = action.rule
				const { size, lhs } = rules[r]

				times(size, () => states.pop())

				i--
				candidate = {
					type: lhs,
					data: times(size, () => symbols.pop()).reverse()
				}

				break
			}
			case ACCEPT:
				return top(symbols)
			case ERROR:
				throw new Error('failed parse')
			default:
				throw new Error('unrecognized action')
		}

		log()
		log()
	}
}

console.log(serialize_symbol(parse(rules, table, input)))
