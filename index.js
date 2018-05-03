const safeText = text => text.replace(/'/g, "''")

const wrapText = text => `'` + text + `'`

const formatValue = value => {
  return isNaN(value) ? wrapText(safeText(value)) : Number(value)
}

// this function is doing more than one thing, think about simplifying it
const formatArray = values => {
  if (values instanceof Array) {
    return '(' + values.map(formatValue).join() + ')'
  }
  return values === undefined ? '' : formatValue(values)
}

const operators = {
  eq: '=',
  gte: '>=',
  gt: '>',
  lte: '<=',
  lt: '<',
  neq: '!=',
  in: 'IN'
}

const parse = query => {
  return Object.keys(query).map(m => {
    let criteria = query[m].split('.')[1].split(',')
    return {
      column: m,
      operator: operators[query[m].split('.')[0]],
      criteria: criteria.length > 1 ? criteria : criteria[0]
    }
  })
}

module.exports = {
  safeText,
  wrapText,
  formatValue,
  formatArray,
  parse
}
