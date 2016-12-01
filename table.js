const { readFileSync } = require('fs')

const SHIFT = 0
const REDUCE = 1
const ACCEPT = 2
const ERROR = 3

const lines = readFileSync('./math.table', 'utf8').trim().split(/\n/).slice(1)
const commands = lines.map(line => line.split(/\s+/))
const command_to_item = c => {
	if (c[0] === 's') return { type: SHIFT, state: Number(c[1]) }
	if (c[0] === 'r') return { type: REDUCE, rule: Number(c[1]) }
	if (c === 'e') return { type: ERROR }
	if (c === 'a') return { type: ACCEPT }
}
const matrix = commands.map(line => line.map(command_to_item))

module.exports = matrix

