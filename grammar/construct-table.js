const { EOF_RULE, END_NODE } = require('./constants')
const { parse_progressions, parse_edge } = require('./util')

const edge_set_to_string_edges = edge_set => {
	const edges = []
	
	for (const edge of edge_set) {
		edges.push(parse_edge(edge))
	}
	
	return edges
}

const parse_string_edges = (lhs_to_index, rules, string_edges) => {
	const snode_to_node = new Map

	let index = 0

	const add_node = node => {
		if (!snode_to_node.has(node)) {
			snode_to_node.set(node, index)
			index++
		}
	}

	add_node(END_NODE)

	const edges = []

	for (const { from, to } of string_edges) {
		add_node(from)
		add_node(to)

		const edge = {
			from: snode_to_node.get(from),
			to: snode_to_node.get(to)
		}

		if (to === END_NODE) {
			edge.end = true
		} else {
			const { rule, production, symbol }  = parse_progressions(to)[0]

			edge.end = false
			edge.symbol = rules[rule].productions[production][symbol - 1]
		}

		edges.push(edge)
	}

	/*
	const edges = string_edges.map(({ from, to }) => ({
		from: parse_progressions(from),
		to: to === END_NODE ? { rule: lhs_to_index.get(EOF_RULE) } : parse_progressions(to)
	}))
	*/

	return [index, edges]
}

const dir = x => console.dir(x, { breakLength: 40, depth: null, colors: true })

const edges_to_table = (lhs_to_index, rules, states, edges) => {
	dir(edges)
	// make (states - 1) * (rules.length - 1) matrix
	// for every state, consider every possible symbol
	
	// eof is a special rule, don't count as a state
	// Accept is a special rule, don't count as a symbol
	const table = Array(states - 1).fill(0)
		.map(() => Array(rules.length - 1).fill('EE'))

	for (const edge of edges) {
		const row = table[edge.from - 1]

		if (edge.end) {
			for (let i = 0; i < row.length; i++) {
				if (row[i] === 'EE') {
					row[i] = 'r '
				}
			}
		} else {
			row[edge.symbol - 1] = `s${ edge.to }`
		}
	}

	return table
}

module.exports = (lhs_to_index, rules, edge_set) => {
	const string_edges = edge_set_to_string_edges(edge_set)
	const [states, edges] = parse_string_edges(lhs_to_index, rules, string_edges)
	return edges_to_table(lhs_to_index, rules, states, edges)
}
