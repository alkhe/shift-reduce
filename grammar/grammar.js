require('colors')
const { readFileSync } = require('fs')

const read_groups = require('./read-grammar')
const parse_groups = require('./parse-grammar')
const compute_edges = require('./compute-edges')
const construct_table = require('./construct-table')
const { NONTERMINAL_ID } = require('./constants')

const log = console.log.bind(console)
const dir = x => console.dir(x, { breakLength: 40, depth: null, colors: true })
const right_pad = (s, c, n) => s + c.repeat(n - s.length)

const serialize_lhs_to_index = lhs_to_index => {
	const serial = []

	for (const [lhs] of lhs_to_index) {
		serial.push(right_pad(lhs.substr(0, 4), ' ', 4))
	}

	return serial.slice(1).join(' ')
}

const serialize_table = table => table.map(row => row.join(' ')).join('\n')

const serialize_rules = rules => {
	const out = []

	rules.forEach((rule, i) => {
		if (rule.type === NONTERMINAL_ID) {
			rule.productions.forEach((p, j) => {
				out.push(`${ i }.${ j } ${ p.length }`)
			})
		}
	})

	return out.join('\n')
}

const source = readFileSync('./math.grammar', 'utf8')

// log('SOURCE'.cyan)
// log(source)

const groups = read_groups(source)

// log('GROUPS'.cyan)
// dir(groups)

const [lhs_to_index, rules] = parse_groups(groups)

// log('LOGICAL'.cyan)
// dir(lhs_to_index)
// dir(rules)

const edge_set = compute_edges(lhs_to_index, rules)

// log('EDGE SET'.cyan)
// dir(edge_set)

const table = construct_table(lhs_to_index, rules, edge_set)

log('TABLE'.cyan)
log(serialize_lhs_to_index(lhs_to_index))
log(serialize_table(table))
log(serialize_rules(rules))
