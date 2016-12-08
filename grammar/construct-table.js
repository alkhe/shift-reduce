const { EOF_RULE, END_NODE } = require('./constants')
const { parse_progressions, parse_edge, parse_end_node } = require('./util')

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
		if (node[0] !== END_NODE && !snode_to_node.has(node)) {
			snode_to_node.set(node, index)
			index++
		}
	}

	const edges = []

	for (const { from, to } of string_edges) {
		add_node(from)
		add_node(to)

		const edge = {
			from: snode_to_node.get(from)
		}

		if (to[0] === END_NODE) {
			const [rule, production] = parse_end_node(to)
			edge.end = true
			edge.rule = rule
			edge.production = production
		} else {
			const { rule, production, symbol } = parse_progressions(to)[0]

			edge.to = snode_to_node.get(to)
			edge.end = false
			edge.symbol = rules[rule].productions[production][symbol - 1]
		}

		edges.push(edge)
	}

	return [index, edges]
}

const dir = x => console.dir(x, { breakLength: 40, depth: null, colors: true })

const edges_to_table = (lhs_to_index, rules, states, edges) => {
	// make states * (rules.length - 1) matrix
	// for every state, consider every possible symbol
	// Accept is a special rule, don't count as a symbol
	const table = Array(states).fill(0)
		.map(() => Array(rules.length - 1).fill('E   '))

	for (const edge of edges) {
		const row = table[edge.from]

		if (edge.end) {
			const { rule, production } = edge
			const reduction = `r${ rule }.${ production }`

			for (let i = 0; i < row.length; i++) {
				if (row[i] === 'E   ') {
					row[i] = reduction
				}
			}

			if (rule === 0 && production === 0) {
				row[lhs_to_index.get(EOF_RULE) - 1] = 'A   '
			}
		} else {
			row[edge.symbol - 1] = `s${ edge.to }  `
		}
	}

	return table
}

module.exports = (lhs_to_index, rules, edge_set) => {
	const string_edges = edge_set_to_string_edges(edge_set)
	const [states, edges] = parse_string_edges(lhs_to_index, rules, string_edges)
	return edges_to_table(lhs_to_index, rules, states, edges)
}
