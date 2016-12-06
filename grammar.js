require('colors')
const { readFileSync } = require('fs')

const log = console.log.bind(console)
const source = readFileSync('./math.grammar', 'utf8')
	
const source_to_lines = s => s.trim().split(/\n+/)

const EMPTY = 'EMPTY'
const NONTERMINAL = 'NONTERMINAL'
const TERMINAL = 'TERMINAL'

const empty_group = {
	type: EMPTY
}

const parse_production = line => line.trim().split(/\s+/)

const reduce_line_group = (groups, group, line) => {
	const first_char = line[0]
	const is_production = first_char === '\t'

	switch (group.type) {
		case EMPTY: {
			if (is_production) throw new Error('stray production')

			if (first_char === first_char.toLowerCase()) {
				const [name, match] = line.split(/\s+/)
				groups.push({
					type: TERMINAL,
					name,
					match
				})
			} else {
				return {
					type: NONTERMINAL,
					name: line,
					productions: []
				}
			}
			break
		}
		case NONTERMINAL:
			if (is_production) {
				group.productions.push(parse_production(line))
			} else {
				groups.push(group)
				return reduce_line_group(groups, empty_group, line)
			}
			break
		default:
			throw new Error('inconsistent state')
	}

	return group
}

const lines_to_groups = lines => {
	const groups = []

	let group = { type: EMPTY }

	for (let i = 0; i < lines.length; i++) {
		group = reduce_line_group(groups, group, lines[i])
	}

	return groups
}

const groups = lines_to_groups(source_to_lines(source))

const augmented_groups = [{ type: NONTERMINAL, name: '_string', productions: [[groups[0].name]] }].concat(groups)

const parse_groups = groups => {
	const lhs_to_index = new Map([['_string', 0], ['eof', 1]])

	for (let i = 1; i < groups.length; i++) {
		const group = groups[i]
		lhs_to_index.set(group.name, i + 1)
	}
	
	const logical_groups = groups.map(g => {
		const out = {
			type: g.type,
			name: lhs_to_index.get(g.name)
		}

		if (g.type === NONTERMINAL) {
			out.productions = g.productions.map(production => production.map(symbol => lhs_to_index.get(symbol)))
		} else if (g.type === TERMINAL) {
			out.match = new RegExp(g.match)
		}

		return out
	})

	return [lhs_to_index, logical_groups]
}

const dir = x => console.dir(x, { depth: null })

const [, logical_groups] = parse_groups(augmented_groups)

const max_length = xss => {
	let max = xss[0].length

	for (let i = 1; i < xss.length; i++) {
		const len = xss[i].length

		if (len > max) {
			max = len
		}
	}
	
	return max
}

dir(logical_groups)

const get_group = (groups, id) => groups.find(g => g.name === id)

const make_fresh_progressions = (group, rule) => group.productions.map((_, i) => ({
	rule,
	production: i,
	symbol: 0
}))

// Progression : (RuleIndex, ProductionIndex, SymbolIndex)
// Production : (RuleIndex, ProductionIndex)
const logical_groups_to_automaton = groups => {
	let progressions = get_group(groups, 0).productions.map((_, i) => ({
		rule: 0,
		production: i,
		symbol: 0
	}))

	let next_progressions = progressions
	const symbols = new Set

	while (next_progressions.length > 0) {
		let additional_progressions = []

		for (const { rule, production, symbol } of next_progressions) {
			log('RULE'.yellow, rule, 'PRODUCTION'.yellow, production, 'SYMBOL'.yellow, symbol)
			const p = get_group(groups, rule).productions[production]

			if (symbol !== p.length) {
				const next_symbol = p[symbol]
				const next_group = get_group(groups, next_symbol)

				if (!symbols.has(next_symbol)) {
					symbols.add(next_symbol)

					if (next_group.type === NONTERMINAL) {
						additional_progressions = additional_progressions.concat(make_fresh_progressions(next_group, next_symbol))
					}
				}
			}
		}

		next_progressions = additional_progressions
		progressions = progressions.concat(next_progressions)
		log('NEXT PROGS'.green, next_progressions)
	}

	log('ALL PROGS'.green, progressions)
	log('ALL SYMBOLS'.green, symbols)

	return progressions
}

logical_groups_to_automaton(logical_groups)
// dir(logical_groups_to_automaton(logical_groups))
