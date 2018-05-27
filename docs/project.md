# $project

## Import 

```javascript
const $project = require("mongo-to-sql").$project;
```

or 

```javascript
const $project = require("mongo-to-sql/stages/project");
```

# Syntax
```javascript
$project(stage, tableName, options);
```

# Options
* `headless`
    * Defaults to `false`
    * When specified as `true`, it will remove the FROM keyword and the assosiated table name from the generated query.


# Similarities to MongoDB
*  If you exclude fields, you cannot also specify the inclusion of fields.
* Fields with expressions will automatically have their expressions converted to their appropriate forms.

# Differences with MongoDB

* The `_id` field is not included by default.

## Supported operators
----
* $concat
* $toLower
* $toUpper

# Field Inclusion
```javascript
$project({
    "field1": 1,
    "field2": 1
}, "tableName");
```

# Field Exclusion
```javascript
$project({
    "field1": 0,
    "field2": 0
}, "tableName");
```

# $concat
```javascript
$project({
    "concatenatedFieldName": {
        "$concat": [ "$field1", " - ", "$field2" ]
    }
}, "tableName");
```

# $toLower
```javascript
$project({
    "lowercaseFieldName": {
        "$toLower": "$field1"
    },
    "lowercaseFieldName2": {
        "$toLower": "HELLO WORLD"
    }
}, "tableName");
```

# $toUpper
```javascript
$project({
    "uppercaseFieldName": {
        "$toUpper": "$field1"
    },
    "uppercaseFieldName2": {
        "$toUpper": "hello world"
    }
}, "tableName");
```