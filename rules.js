const { readFileSync } = require('fs')

const lines = readFileSync('./math.rules', 'utf8').trim().split(/\n/)
const rules = lines
	.map(line => line.split(/\s+/))
	.map(([lhs, size]) => ({ lhs, size: Number(size) }))

module.exports = rules
console.log(rules)
