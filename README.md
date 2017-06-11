# MongoToSQL - Convert MongoDB aggregation pipelines to their SQL equivalent
----

## Supported pipelines
----
* $group
* $project
* $match

## Supported $group operators
----
* $sum
    * NOTE: $sum currently does not support nested operators or multiple expressions through an array.

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


# Example Usage
-------
For a complete understanding and set of examples for how to use this library, please refer to the **tests** folder.

Using $sum:
```
let collectionName = "loginstore";
let collectionFields = ["verified", "user_id", "count", "age"];

mongoToSQL.convert(collectionName, collectionFields, [
    {"$group": {
        count: {
            "$sum": 1
        },
        age: "$age"
    }}
]);
```
