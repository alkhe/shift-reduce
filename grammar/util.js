const { PROGRESSION_SCOPE, PROGRESSIONS_DELIMITER, EDGE_ARROW } = require('./constants')

const serialize_progression = ({ rule, production, symbol }) => `${ rule }${ PROGRESSION_SCOPE }${ production }${ PROGRESSION_SCOPE }${ symbol }`

const serialize_progressions = progs => progs
	.map(serialize_progression)
	.join(PROGRESSIONS_DELIMITER)

const serialize_edge = (l, r) => `${ l }${ EDGE_ARROW }${ r }`

const parse_progression = s => {
	const [rule, production, symbol] = s.split(PROGRESSION_SCOPE)
	return { rule, production, symbol }
}

const parse_progressions = s => s
	.split(PROGRESSIONS_DELIMITER)
	.map(parse_progression)

const parse_edge = s => s.split(EDGE_ARROW).map(parse_progressions)

module.exports = {
	serialize_progression,
	serialize_progressions,
	serialize_edge,
	parse_progression,
	parse_progressions,
	parse_edge
}
