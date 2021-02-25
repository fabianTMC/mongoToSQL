# MongoToSQL - Convert MongoDB aggregation pipelines to their SQL equivalent


## Notes
* Some pipelines throw errors so it would be safer to wrap all library function call in a try..catch block.
* When a `$match` stage is immediately followed by a `$project` stage, an optimization will kick in where the headless output of the `$project` will be appended with the headless output of the `$match` to avoid an unnecessary subquery. 

## Supported pipelines
----
* $group
* [$project](docs/project.md)
* $match
* $lookup
* $join

## Supported $group operators
----
* $count
    * NOTE: $count currently does not support nested operators or multiple expressions through an array.

## $lookup
----
$lookup as per the [MongoDB documentation](https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/) performs a left outer join. This behaviour has been mirrored here. To change the type of join, please specify the `joinType` key in the $lookup object.

The difference with the `as` key is that it takes an object that will map from the result to the table that is being joined with.

For example:
```javascript
    $lookup({
        from: "states",
        localField: "state_id",
        foreignField: "id",
        as: {
            stateName: "name",
            stateId: "id"
        }
    })
```
will return

```sql
    SELECT t2.name as stateName, t2.id as stateId FROM (SELECT * FROM currentTable) t1 LEFT JOIN (SELECT * FROM states) t2 ON t1.state_id = t2.id
```

## $match usage
```javascript
$match(matchObject, tableName, options)
```

* options (optional): A hashmap of options 
    * headless: Should the `SELECT * FROM tableName` be included. Defaults to `true`.

Example usage
```javascript
$match({
    status: "D",
    qty: 2
}, 
"inventory", 
{
    headless: true
});
```
will return

```sql
WHERE status = 'D' AND qty = 2
```

Without the headless option specified, it will return
```sql
SELECT * FROM inventory WHERE status = 'D' AND qty = 2
```


## $match notes
* This library currently only supports comparisons with numbers. Strings and arrays are not compared and will cause an error when used with $eq despite (MongoDB's support for the same)[https://docs.mongodb.com/manual/reference/operator/query/eq/#match-an-array-value].

* $ne will only match values and not strings at the moment.

* Only arrays can be passed as the value to the $in operator.

* Date/time math sample
```js
{
    value: "2021-02-24 12:00:00", // MUST BE IN DATETIME OR DATE FORMAT. TIME ALONE WILL NOT WORK
    type: "DATE || DATETIME || TIME",
    operation: "subtract",
    units: [
        {
            number: 7,
            type: "days"
        },
        {
            number: 6,
            type: "hours"
        }
    ]
}
```


# Example Usage
-------
For a complete understanding and set of examples for how to use this library, please refer to the **tests** folder.

Using $count:
```
let collectionName = "loginstore";

mongoToSQL.convert(collectionName, [
    {"$group": {
        count: {
            "$count": 1
        },
        age: "$age"
    }}
]);
```
