const { TAG_TO_ID, NONTERMINAL_ID, TERMINAL_ID } = require('./constants')

const parse_groups = groups => {
	const lhs_to_index = new Map

	groups.forEach((g, i) => lhs_to_index.set(g.name, i))

	const logical_groups = groups.map(g => {
		switch (TAG_TO_ID[g.type]) {
			case NONTERMINAL_ID:
				return {
					type: NONTERMINAL_ID,
					productions: g.productions.map(p =>
						p.map(s => lhs_to_index.get(s))
					)
				}
			case TERMINAL_ID:
				return {
					type: TERMINAL_ID,
					match: new RegExp(g.match)
				}
		}

		throw new Error('inconsistent state')
	})

	return [lhs_to_index, logical_groups]
}

module.exports = parse_groups
