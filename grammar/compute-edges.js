const { NONTERMINAL_ID, ACCEPT_RULE, END_NODE } = require('./constants')
const { serialize_progression, serialize_progressions, serialize_edge, serialize_end_node } = require('./util')

// Progression : (RuleIndex, ProductionIndex, SymbolIndex)

const fresh_progressions = (rules, rule) => rules[rule].productions.map((_, i) => ({
	rule,
	production: i,
	symbol: 0
}))

const increment_progression = ({ rule, production, symbol }) => ({ rule, production, symbol: symbol + 1 })

const initialize_paths = symbols => {
	const paths = new Map

	for (const s of symbols) {
		paths.set(s, [])
	}

	return paths
}

const separate_progressions = (rules, progs) => {
	const finished = []
	const unfinished = []

	for (const prog of progs) {
		const { rule, production, symbol } = prog
		const prod = rules[rule].productions[production]
		; (symbol === prod.length ? finished : unfinished).push(prog)
	}

	return [finished, unfinished]
}

const compute_progressions = (rules, progs) => {
	let next_progs = progs
	const symbols = new Set

	while (next_progs.length > 0) {
		let add_progs = []

		for (const { rule, production, symbol } of next_progs) {
			const prod = rules[rule].productions[production]

			if (symbol !== prod.length) {
				const next_symbol = prod[symbol]

				if (!symbols.has(next_symbol)) {
					symbols.add(next_symbol)

					if (rules[next_symbol].type === NONTERMINAL_ID) {
						add_progs = add_progs.concat(fresh_progressions(rules, next_symbol))
					}
				}
			}
		}

		progs = progs.concat(add_progs)
		next_progs = add_progs
	}

	return [symbols, progs]
}

const progressions_to_edges = (edge_set, rules, serial, base_progs) => {
	const [symbols, progs] = compute_progressions(rules, base_progs)

	const [finished, unfinished] = separate_progressions(rules, progs)
	const paths = initialize_paths(symbols)

	for (const prog of unfinished) {
		const { rule, production, symbol } = prog
		const s = rules[rule].productions[production][symbol]
		paths.get(s).push(increment_progression(prog))
	}

	const finished_length = finished.length
	if (finished_length > 1) throw new Error('shift-reduce conflict')

	if (finished_length === 1) {
		const node = finished[0]
		const finished_edge = serialize_edge(serial, serialize_end_node(node.rule, node.production))
		if (!edge_set.has(finished_edge)) {
			edge_set.add(finished_edge)
		}
	}

	for (const [symbol, next_progs] of paths) {
		const next_serial = serialize_progressions(next_progs)
		const next_edge = serialize_edge(serial, next_serial)

		if (!edge_set.has(next_edge)) {
			edge_set.add(next_edge)
			progressions_to_edges(edge_set, rules, next_serial, next_progs)
		}
	}
}

const compute_edges = (lhs_to_index, rules) => {
	const root_rule = lhs_to_index.get(ACCEPT_RULE)
	const root_progs = fresh_progressions(rules, root_rule)
	const root_serial = serialize_progressions(root_progs)
	const edge_set = new Set

	progressions_to_edges(edge_set, rules, root_serial, root_progs)

	return edge_set
}

module.exports = compute_edges
