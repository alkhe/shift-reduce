const NONTERMINAL_TAG = 'NONTERMINAL'
const TERMINAL_TAG = 'TERMINAL'

const NONTERMINAL_ID = 0
const TERMINAL_ID = 1

const TAG_TO_ID = {
	[NONTERMINAL_TAG]: NONTERMINAL_ID,
	[TERMINAL_TAG]: TERMINAL_ID
}

const ACCEPT_RULE = 'Accept'
const EOF_RULE = 'eof'

// ProgressionSerial : Rule.Production.Symbol
// NodeSerial : ProgressionSerial(s) delimited by |
// EdgeSerial : NodeSerial>NodeSerial

const END_NODE = 'E'
const PROGRESSION_SCOPE = '.'
const PROGRESSIONS_DELIMITER = '|'
const EDGE_ARROW = '>'

module.exports = {
	NONTERMINAL_TAG,
	TERMINAL_TAG,
	NONTERMINAL_ID,
	TERMINAL_ID,
	TAG_TO_ID,
	ACCEPT_RULE,
	EOF_RULE,
	END_NODE,
	PROGRESSION_SCOPE,
	PROGRESSIONS_DELIMITER,
	EDGE_ARROW
}
