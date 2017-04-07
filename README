# MongoToSQL - Convert MongoDB aggregation pipelines to their SQL equivalent
----

## Supported pipelines
----
* $group
* $project

## Supported $group operators
----
* $sum
    * NOTE: $sum currently does not support nested operators or multiple expressions through an array.


# Example Usage
-------
For a complete understanding and set of examples for how to use this library, please refer to the tests folder.

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
