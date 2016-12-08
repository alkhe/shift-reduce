require('colors')
const { readFileSync } = require('fs')

const read_groups = require('./read-grammar')
const parse_groups = require('./parse-grammar')
const compute_edges = require('./compute-edges')

const log = console.log.bind(console)
const dir = x => console.dir(x, { depth: null })

const source = readFileSync('./math.grammar', 'utf8')

log('SOURCE'.cyan)
log(source)

const groups = read_groups(source)

log('GROUPS'.cyan)
dir(groups)

const [lhs_to_index, rules] = parse_groups(groups)

log('LOGICAL'.cyan)
dir(rules)

const edges = compute_edges(lhs_to_index, rules)

log('EDGES'.cyan)
dir(edges)
