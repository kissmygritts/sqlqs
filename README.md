A very simple and rudimentary query string to SQL predicate parser.

Heavily influenced by the query string methods from the PostgREST API server, this module will create SQL WHERE clause predicates from the query string. With PostgREST the query string handles almost all of the database filtering and logic. For instance, to filter the database the query string may look like the following, `?x=eq.10`. Where x is the column to filter, `eq` is the operator to use, and `10` is the criteria to filter by. I call these a predicate object. I found this query string structure very flexible and decided to try and recreate it with Node.

## Use

``` javascript
const sqlqs = require('sqlqs')

let qs = {
  class: 'in.Mammal,Bird',
  genus: 'eq.Neotoma',
  id: 'gt.1000'
}

let predicates = sqlqs.parse(qs)
// returns
[
  {
    column: 'class',
    operator: 'IN',
    criteria: ['Mammal', 'Bird']
  },
  {
    column: 'genus',
    operator: '=',
    criteria: 'Neotoma'
  },
  {
    column: 'id',
    operator: '>',
    criteria: '1000'
  }
]

// pass this object to the predicate function
let where = sqlqs.predicate(predicates)
// returns
'class IN (\'Mammal\',\'Bird\') AND genus = \'Neotoma\' AND id > 1000'
```

## Caveats

This will be helpful for writing an API using database tools like pg-promise, pg, etc. This will not be useful for an ORM.

A query string like this `?species=eq.arctos&species=eq.americanus` is attempting to return all records where species is arctos or americanus. However it creats this query `SELECT * FROM animals where species = 'arctos' AND species = 'americanus'`. While this is a valid SQL string, it will not return any records. The query string should be `?species=in.arctos,americanus` which will create this SQL query `SELECT * FROM animals WHERE species IN ('arctos','americanus')`.

sqlqs assumes that numbers provided in the query string map to fields with number datatypes in the database. I can for see this being an issue if numbers with leading zeros are being stored in a database as a text datatype.