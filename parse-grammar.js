const NONTERMINAL = 'NONTERMINAL'
const TERMINAL = 'TERMINAL'

const NONTERMINAL_ID = 0
const TERMINAL_ID = 1

const type_to_typeid = {
	NONTERMINAL: NONTERMINAL_ID,
	TERMINAL: TERMINAL_ID
}

const ACCEPT_RULE = 'Accept'
const EOF_RULE = 'eof'

// takes first rule and adds a new rule with the first rule in a singleton as its only production
const augment_groups = groups => [{
	type: NONTERMINAL,
	name: ACCEPT_RULE,
	productions: [[groups[0].name]]
}, {
	type: TERMINAL,
	name: EOF_RULE
}].concat(groups)

const parse_groups = groups => {
	const lhs_to_index = new Map

	groups.forEach((g, i) => lhs_to_index.set(g.name, i))

	const logical_groups = groups.map(g => {
		switch (type_to_typeid[g.type]) {
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

module.exports = groups => parse_groups(augment_groups(groups))
