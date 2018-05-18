const {
  safeText,
  wrapText,
  formatValue,
  formatArray,
  hasOperator,
  hasMany,
  getCriteria,
  getOperator,
  parse,
  sqlize,
  where
} = require('../index')

describe('utils', () => {
  test('safeText: replaces single quotes wtesth double single quote', () => {
    expect(safeText(`can't`)).toBe(`can''t`)
  })

  test('wrapText: wraps text string in quotes', () => {
    expect(wrapText('one')).toBe(`'one'`)
  })

  describe('formatValue', () => {
    test('format SQL ready text values', () => {
      expect(formatValue('one')).toBe(`'one'`)
    })

    test('format SQL ready number values', () => {
      expect(formatValue('100')).toBe(100)
    })
  })

  describe('hasOperator', () => {
    test('return true for "eq.one"', () => {
      expect(hasOperator('eq.one')).toBe(true)
    })

    test('return false for "one"', () => {
      expect(hasOperator('one')).toBe(false)
    })

    test('return true for "in.1,2,3,4"', () => {
      expect(hasOperator('in.1,2,3,4')).toBe(true)
    })

    test('return false for "1,2,3,4"', () => {
      expect(hasOperator('1,2,3,4')).toBe(false)
    })
  })

  describe('hasMany', () => {
    test('returns true for "1,2,3"', () => {
      expect(hasMany('1,2,3')).toBe(true)
    })

    test('returns false for "1"', () => {
      expect(hasMany('1')).toBe(false)
    })
  })

  describe('formatArray', () => {
    test('format SQL ready array of strings', () => {
      expect(formatArray(['one', 'two'])).toBe(`('one','two')`)
    })

    test('format SQL ready array of numbers', () => {
      expect(formatArray(['1', '2'])).toBe('(1,2)')
    })

    test('format SQL ready string if values is not an array', () => {
      expect(formatArray('one')).toBe(`'one'`)
    })

    test('format SQL ready number if value is not an array', () => {
      expect(formatArray('1')).toBe(1)
    })

    test(`format undefined to ''`, () => {
      expect(formatArray(undefined)).toBe('')
    })
  })

  describe('getCriteria', () => {
    test('returns "one" when given "eq.one"', () => {
      expect(getCriteria('eq.one')).toBe('one')
    })

    test('returns "one" when given "one"', () => {
      expect(getCriteria('one')).toBe('one')
    })

    test('returns array when given "in.one,two"', () => {
      expect(getCriteria('in.one,two')).toEqual(['one', 'two'])
    })

    test('returns array when given "one,two"', () => {
      expect(getCriteria('one,two')).toEqual(['one', 'two'])
    })
  })

  describe('getOperator', () => {
    test('returns "=" when given "eq.one"', () => {
      expect(getOperator('eq.one')).toBe('=')
    })

    test('returns "IN" when given "in.one,two"', () => {
      expect(getOperator('in.one,two')).toBe('IN')
    })

    test('returns "=" when given "one"', () => {
      expect(getOperator('one')).toBe('=')
    })

    test('returns "IN" when given "one,two"', () => {
      expect(getOperator('one,two')).toBe('IN')
    })
  })
})

describe('parse', () => {
  describe('handles strings', () => {
    test('properly handle string for eq', () => {
      let predicates = parse({ x: 'eq.one' })
      expect(predicates[0]).toEqual({ column: 'x', operator: '=', criteria: 'one' })
    })

    test('properly handle string for neq', () => {
      let predicates = parse({ x: 'neq.one' })
      expect(predicates[0]).toEqual({ column: 'x', operator: '!=', criteria: 'one' })
    })
  })

  describe('handles numbers', () => {
    test('properly handle integers for gt', () => {
      let predicates = parse({ x: 'gt.8' })
      expect(predicates[0]).toEqual({ column: 'x', operator: '>', criteria: '8' })
    })

    test('properly handle integers for gte', () => {
      let predicates = parse({ x: 'gte.8' })
      expect(predicates[0]).toEqual({ column: 'x', operator: '>=', criteria: '8' })
    })

    test('properly handle integers for lt', () => {
      let predicates = parse({ x: 'lt.8' })
      expect(predicates[0]).toEqual({ column: 'x', operator: '<', criteria: '8' })
    })

    test('properly handle integers for lte', () => {
      let predicates = parse({ x: 'lte.8' })
      expect(predicates[0]).toEqual({ column: 'x', operator: '<=', criteria: '8' })
    })
  })

  describe('handles arrays', () => {
    test('properly handle a list of strings for in', () => {
      let predicates = parse({ x: 'in.one,two' })
      expect(predicates[0]).toEqual({ column: 'x', operator: 'IN', criteria: ['one', 'two'] })
    })

    test('properly handle a list of numbers for in', () => {
      let predicates = parse({ x: 'in.1,2' })
      expect(predicates[0]).toEqual({ column: 'x', operator: 'IN', criteria: ['1', '2'] })
    })
  })

  describe('handles objects', () => {
    test('properly handles an object with multiple keys', () => {
      let predicate = parse({ x: 'eq.1', y: 'eq.2' })
      expect(predicate).toEqual([
        { column: 'x', operator: '=', criteria: '1' },
        { column: 'y', operator: '=', criteria: '2' }
      ])
    })
  })

  describe('without operators', () => {
    test('if there is not an operator, assume equals (=)', () => {
      let predicate = parse({ x: 'one' })
      expect(predicate[0]).toEqual({ column: 'x', operator: '=', criteria: 'one' })
    })

    test('if there is an operator use operator', () => {
      let predicate = parse({ x: 'eq.one' })
      expect(predicate[0]).toEqual({ column: 'x', operator: '=', criteria: 'one' })
    })

    test('if there is not an operator and criteria is an array assume "IN"', () => {
      let predicate = parse({ x: 'one,two' })
      expect(predicate[0]).toEqual({ column: 'x', operator: 'IN', criteria: ['one', 'two'] })
    })
  })
})

describe('sqlize', () => {
  test('properly SQLize when criteria is a number', () => {
    let where = sqlize([{ column: 'x', operator: '=', criteria: '1000' }])
    expect(where).toBe('x = 1000')
  })

  test('properly SQLize when criteria is a string', () => {
    let where = sqlize([{ column: 'x', operator: '=', criteria: 'one' }])
    expect(where).toBe(`x = 'one'`)
  })

  test('properly SQLize when criteria is a string', () => {
    let where = sqlize([{ column: 'x', operator: 'IN', criteria: ['one', 'two'] }])
    expect(where).toBe(`x IN ('one','two')`)
  })

  test('properly SQLize when criteria is a string', () => {
    let where = sqlize([
      { column: 'x', operator: '=', criteria: 'blue' },
      { column: 'y', operator: '=', criteria: 'yellow' }
    ])
    expect(where).toBe(`x = 'blue' AND y = 'yellow'`)
  })
})

describe('where', () => {
  test('return a formatted where clause', () => {
    expect(where({ x: 'eq.blue', y: 'eq.yellow' })).toBe(`x = 'blue' AND y = 'yellow'`)
  })
})
