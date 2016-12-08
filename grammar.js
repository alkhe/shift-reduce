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

// Progression : (RuleIndex, ProductionIndex, SymbolIndex)
// Production : (RuleIndex, ProductionIndex)
const progressions_to_edges = (groups, progressions) => {

	let next_progressions = progressions
	const symbols = new Set

	while (next_progressions.length > 0) {
		let additional_progressions = []

		for (const { rule, production, symbol } of next_progressions) {
			log('RULE'.yellow, rule, production, symbol)
			const p = groups[rule].productions[production]

			if (symbol !== p.length) {
				const next_symbol = p[symbol]
				const next_group = groups[next_symbol]

				if (!symbols.has(next_symbol)) {
					symbols.add(next_symbol)

					if (next_group.type === NONTERMINAL_ID) {
						additional_progressions = additional_progressions.concat(make_fresh_progressions(next_group, next_symbol))
					}
				}
			}
		}

		next_progressions = additional_progressions
		progressions = progressions.concat(next_progressions)
	}

	const [finished, unfinished] = separate_progressions(groups, progressions)

	const paths = initialize_paths(symbols)

	for (const progression of unfinished) {
		const { rule, production, symbol } = progression
		const s = groups[rule].productions[production][symbol]

		paths.get(s).push(increment_progression(progression))
	}

	log('NEXT PATHS'.green, paths)

	for (const [symbol, progressions] of paths) {
		progressions_to_edges(groups, progressions)
	}

	return progressions
}

const edges = progressions_to_edges(
	logical_groups,
	logical_groups[0].productions.map((_, i) => ({
		rule: 0,
		production: i,
		symbol: 0
	}))
)

// dir(logical_groups_to_automaton(logical_groups))
