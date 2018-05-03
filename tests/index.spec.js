const {
  safeText,
  wrapText,
  formatValue,
  formatArray,
  parse
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
  })
})

describe('parse', () => {
  test('properly handle string for eq', () => {
    let predicates = parse({ x: 'eq.one' })
    expect(predicates[0]).toEqual({ column: 'x', operator: '=', criteria: 'one' })
  })

  test('properly handle string for neq', () => {
    let predicates = parse({ x: 'neq.one' })
    expect(predicates[0]).toEqual({ column: 'x', operator: '!=', criteria: 'one' })
  })

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

  test('properly handle a list of strings for in', () => {
    let predicates = parse({ x: 'in.one,two' })
    expect(predicates[0]).toEqual({ column: 'x', operator: 'IN', criteria: ['one', 'two'] })
  })

  test('properly handle a list of numbers for in', () => {
    let predicates = parse({ x: 'in.1,2' })
    expect(predicates[0]).toEqual({ column: 'x', operator: 'IN', criteria: ['1', '2'] })
  })

  test('properly handles an object with multiple keys', () => {
    let predicate = parse({ x: 'eq.1', y: 'eq.2' })
    expect(predicate).toEqual([
      { column: 'x', operator: '=', criteria: '1' },
      { column: 'y', operator: '=', criteria: '2' }
    ])
  })
})
