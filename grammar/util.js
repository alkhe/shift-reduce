const { END_NODE, PROGRESSION_SCOPE, PROGRESSIONS_DELIMITER, EDGE_ARROW } = require('./constants')

const parse_num = x => Number(x)

const serialize_progression = ({ rule, production, symbol }) => `${ rule }${ PROGRESSION_SCOPE }${ production }${ PROGRESSION_SCOPE }${ symbol }`

const serialize_progressions = progs => progs
	.map(serialize_progression)
	.join(PROGRESSIONS_DELIMITER)

const serialize_edge = (l, r) => `${ l }${ EDGE_ARROW }${ r }`

const serialize_end_node = (rule, production) => `${ END_NODE }${ rule }${ PROGRESSION_SCOPE }${ production }`

const parse_progression = s => {
	const [rule, production, symbol] = s.split(PROGRESSION_SCOPE).map(parse_num)
	return { rule, production, symbol }
}

const parse_progressions = s => s
	.split(PROGRESSIONS_DELIMITER)
	.map(parse_progression)

const parse_edge = s => {
	const [from, to] = s.split(EDGE_ARROW)
	return { from, to }
}

const parse_end_node = s => s.substr(1).split(PROGRESSION_SCOPE).map(parse_num)

module.exports = {
	serialize_progression,
	serialize_progressions,
	serialize_edge,
	serialize_end_node,
	parse_progression,
	parse_progressions,
	parse_edge,
	parse_end_node
}
