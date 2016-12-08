require('colors')
const { readFileSync } = require('fs')

const log = console.log.bind(console)
const dir = x => console.dir(x, { depth: null })

const source = readFileSync('./math.grammar', 'utf8')

const read_groups = require('./read-grammar')
const parse_groups = require('./parse-grammar')

const NONTERMINAL_ID = 0
const TERMINAL_ID = 1

const groups = read_groups(source)

log('GROUPS'.cyan)
dir(groups)

const [, logical_groups] = parse_groups(groups)

log('LOGICAL'.cyan)
dir(logical_groups)

const make_fresh_progressions = (group, rule) => group.productions.map((_, i) => ({
	rule,
	production: i,
	symbol: 0
}))

const increment_progression = ({ rule, production, symbol }) => ({ rule, production, symbol: symbol + 1 })

const initialize_paths = symbols => {
	const path = new Map
	for (const s of symbols) {
		path.set(s, [])
	}
	return path
}

const separate_progressions = (groups, progressions) => {
	const finished = []
	const unfinished = []

	for (const prog of progressions) {
		const { rule, production, symbol } = prog
		const p = groups[rule].productions[production]
		; (symbol === p.length ? finished : unfinished).push(prog)
	}

	return [finished, unfinished]
}

const serialize_progression = ({ rule, production, symbol }) => `${ rule }.${ production },${ symbol }`
const serialize_progressions = progressions => progressions.map(serialize_progression).join('|')
const make_edge = (left, right) => `${ left }>${ right }`

// Progression : (RuleIndex, ProductionIndex, SymbolIndex)
// Production : (RuleIndex, ProductionIndex)
const progressions_to_edges = (groups, progs) => {
	const serial = serialize_progressions(progs)

	log('BASEPROG'.yellow, progs)

	let next_progs = progs
	const symbols = new Set

	while (next_progs.length > 0) {
		let additional_progs = []

		for (const { rule, production, symbol } of next_progs) {
			const p = groups[rule].productions[production]

			if (symbol !== p.length) {
				const next_symbol = p[symbol]
				const next_group = groups[next_symbol]

				if (!symbols.has(next_symbol)) {
					symbols.add(next_symbol)

					if (next_group.type === NONTERMINAL_ID) {
						additional_progs = additional_progs.concat(make_fresh_progressions(next_group, next_symbol))
					}
				}
			}
		}

		progs = progs.concat(additional_progs)
		next_progs = additional_progs
	}

	const paths = initialize_paths(symbols)

	for (const prog of progs) {
		const { rule, production, symbol } = prog
		const s = groups[rule].productions[production][symbol]

		paths.get(s).push(increment_progression(prog))
	}

	log('PATHS'.cyan, paths)
	let edges = []

	for (const [symbol, next_progs] of paths) {
		const [next_serial, next_edges] = progressions_to_edges(groups, next_progs)
		edges = edges.concat(make_edge(serial, next_serial)).concat(next_edges)
	}

	log('SERIAL'.green, serial)

	return [serial, edges]
}

const edges = progressions_to_edges(
	logical_groups,
	logical_groups[0].productions.map((_, i) => ({
		rule: 0,
		production: i,
		symbol: 0
	}))
)

log('EDGES'.green, edges)
