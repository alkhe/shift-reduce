const { NONTERMINAL_TAG, TERMINAL_TAG, ACCEPT_RULE, EOF_RULE } = require('./constants')
const EMPTY_TAG = 'EMPTY'

const EMPTY_GROUP = { type: EMPTY_TAG }

// split string by line
const lines = s => s.split(/\n+/)

// split string by whitespace
const words = s => s.split(/\s+/)

// push 
const push_line = (groups, current_group, line) => {
	const first_char = line[0]
	const is_production = first_char === '\t'

	switch (current_group.type) {
		case EMPTY_TAG: {
			// production must be added to a nonterminal parent
			if (is_production) throw new Error('stray production')

			// line is a rule
			if (first_char === first_char.toLowerCase()) { // specifically, a terminal rule
				const [name, match] = words(line)
				groups.push({
					type: TERMINAL_TAG,
					name,
					match
				})
			} else { // specifically, a nonterminal rule
				return {
					type: NONTERMINAL_TAG,
					name: line.trimRight(),
					productions: []
				}
			}
			break
		}
		case NONTERMINAL_TAG:
			if (is_production) {
				current_group.productions.push(words(line.trim()))
			} else {
				groups.push(current_group)
				return push_line(groups, EMPTY_GROUP, line)
			}
			break
		default:
			throw new Error('inconsistent state')
	}

	return current_group
}

const source_lines_to_readable_groups = lines => {
	const groups = []

	let group = EMPTY_GROUP

	for (const line of lines) {
		group = push_line(groups, group, line)
	}

	return groups
}

// takes first rule and adds a new rule with the first rule in a singleton as its only production
const augment_groups = groups => {
	if (groups.findIndex(g => g.name === ACCEPT_RULE) === -1) {
		groups = [{
			type: NONTERMINAL_TAG,
			name: ACCEPT_RULE,
			productions: [[groups[0].name]]
		}].concat(groups)
	}

	return groups.concat({
		type: TERMINAL_TAG,
		name: EOF_RULE
	})
}

module.exports = source => augment_groups(source_lines_to_readable_groups(lines(source.trim())))
