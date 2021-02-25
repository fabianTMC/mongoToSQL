var mongoToSQL = require("../../lib/index");
var assert = require('chai').assert;

let resource = "loginstore";
let fields = ["verified", "user_id", "count", "age"];

describe('$group tests', function() {
    it('should fail because of the empty grouping', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {

            }}
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.EMPTY_GROUPING);
    })

    it('should fail because of the missing _id field', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                count: {
                    "$count": 1
                },
                user_id: "$user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result, "SELECT COUNT(*) as `count`, `user_id` as `user_id`, `age` as `age` FROM `loginstore`");
    })

    it('should fail because of the missing _id field in the second stage', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$count": 1
                },
                user_id: "$user_id",
                age: "$age"
            }},
            {"$group": {
                count: {
                    "$count": 1
                },
                user_id: "$user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result, "SELECT COUNT(*) as `count`, `user_id` as `user_id`, `age` as `age` FROM (SELECT `user_id` as `_id`, COUNT(*) as `count`, `user_id` as `user_id`, `age` as `age` FROM `loginstore` GROUP BY `user_id`) t0");
    })

    it('should run a grouping by a string because of the misssing $ in _id', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "user_id", // GROUP BY
                count: {
                    "$count": 1
                },
                user_id: "$user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result, "SELECT 'user_id' as `_id`, COUNT(*) as `count`, `user_id` as `user_id`, `age` as `age` FROM `loginstore` GROUP BY 'user_id'");
    })

    it('should run a grouping on two levels by a string because of the missing $ in _id', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "user_id", // GROUP BY
                count: {
                    "$count": 1
                },
                user_id: "$user_id",
                age: "$age"
            }},
            {"$group": {
                _id: "age", // GROUP BY
                count: {
                    "$count": 1
                },
            }}
        ]);

        assert.equal(result, "SELECT 'age' as `_id`, COUNT(*) as `count` FROM (SELECT 'user_id' as `_id`, COUNT(*) as `count`, `user_id` as `user_id`, `age` as `age` FROM `loginstore` GROUP BY 'user_id') t0 GROUP BY 'age'");
    })


    it('should run a grouping on one level', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$count": 1
                },
                user_id: "$user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result, "SELECT `user_id` as `_id`, COUNT(*) as `count`, `user_id` as `user_id`, `age` as `age` FROM `loginstore` GROUP BY `user_id`");
    })

    it('should run a grouping on two levels', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$count": 1
                },
                user_id: "$user_id",
                age: "$age"
            }},
            {"$group": {
                _id: "$age", // GROUP BY
                count: {
                    "$count": 1
                },
            }}
        ]);

        assert.equal(result, "SELECT `age` as `_id`, COUNT(*) as `count` FROM (SELECT `user_id` as `_id`, COUNT(*) as `count`, `user_id` as `user_id`, `age` as `age` FROM `loginstore` GROUP BY `user_id`) t0 GROUP BY `age`");
    })

    it('should add a string as a field because of the missing $ (one level)', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$count": 1
                },
                user_id: "user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result, "SELECT `user_id` as `_id`, COUNT(*) as `count`, 'user_id' as `user_id`, `age` as `age` FROM `loginstore` GROUP BY `user_id`");
    })

    it('should add a string as a field because of the missing $ (two level)', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$count": 1
                },
                user_id: "user_id",
                age: "$age"
            }},
            {"$group": {
                _id: "$age", // GROUP BY
                count: {
                    "$count": 1
                },
                age: "age"
            }}
        ]);

        assert.equal(result, "SELECT `age` as `_id`, COUNT(*) as `count`, 'age' as `age` FROM (SELECT `user_id` as `_id`, COUNT(*) as `count`, 'user_id' as `user_id`, `age` as `age` FROM `loginstore` GROUP BY `user_id`) t0 GROUP BY `age`");
    })

    it('should count all the verified fields', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$count": "$verified"
                },
                user_id: "$user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result, "SELECT `user_id` as `_id`, COUNT(`verified`) as `count`, `user_id` as `user_id`, `age` as `age` FROM `loginstore` GROUP BY `user_id`");
    })

    it('should fail to count all the verified fields becasuse of the missing $', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$count": "verified"
                },
                user_id: "$user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_FIELD('verified'));
    })

    it('should count all fields multiplied by a factor of 2', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$count": 2
                },
                user_id: "$user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result, "SELECT `user_id` as `_id`, COUNT(*) * 2 as `count`, `user_id` as `user_id`, `age` as `age` FROM `loginstore` GROUP BY `user_id`");
    })

    it('should run a grouping on one level despite the $count field not being in the field list', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$count": "$custom"
                },
                user_id: "$user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result, "SELECT `user_id` as `_id`, COUNT(`custom`) as `count`, `user_id` as `user_id`, `age` as `age` FROM `loginstore` GROUP BY `user_id`");
    })

    it('should SUM one field', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                sum: {
                    "$sum": "$a"
                }
            }}
        ]);

        assert.equal(result, "SELECT `user_id` as `_id`, SUM(`a`) as `sum` FROM `loginstore` GROUP BY `user_id`");

    })

    it('should not SUM a non $ string', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                sum: {
                    "$sum": "a"
                }
            }}
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_FIELD('a'));
    })

    it('should SUM a number', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                sum: {
                    "$sum": 12
                }
            }}
        ]);

        assert.equal(result, "SELECT `user_id` as `_id`, SUM(12) as `sum` FROM `loginstore` GROUP BY `user_id`");

    })

    it('should SUM a number of fields', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                sum: {
                    "$sum": ["$a", "*", "$b"]
                }
            }}
        ]);

        assert.equal(result, "SELECT `user_id` as `_id`, SUM(`a` * `b`) as `sum` FROM `loginstore` GROUP BY `user_id`");

    });

    it('should not SUM a number of fields as one is a non $ string', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                sum: {
                    "$sum": ["$a", "*", "$b", "/", "c"]
                }
            }}
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.UNSUPPORTED_ACCUMULATOR_EXPRESSION('c'));

    });

    it('should not SUM a number of fields as there is a missing math operator in the middle', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                sum: {
                    "$sum": ["$a", "$b"]
                }
            }}
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_SUM_OPERATOR);

    });

    it('should not SUM a number of fields as there is are missing operands at % 1', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                sum: {
                    "$sum": ["*", "$a", "$b"]
                }
            }}
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_SUM_OPERATOR);

    });

    it('should not SUM a number of fields as there is are missing operators at the end', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                sum: {
                    "$sum": ["$a", "*", "$b", "/"]
                }
            }}
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_SUM_OPERATOR);

    });

    it('should SUM a number of fields and a number', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                sum: {
                    "$sum": ["$a", "*", "$b", "/", 3]
                }
            }}
        ]);

        assert.equal(result, "SELECT `user_id` as `_id`, SUM(`a` * `b` / 3) as `sum` FROM `loginstore` GROUP BY `user_id`");

    })

    it('should SUM a number of numbers separated by a *', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                sum: {
                    "$sum": [3, "*", 5]
                }
            }}
        ]);

        assert.equal(result, "SELECT `user_id` as `_id`, SUM(3 * 5) as `sum` FROM `loginstore` GROUP BY `user_id`");

    })

    it('should SUM a number of numbers separated by a /', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                sum: {
                    "$sum": [3, "/", 5]
                }
            }}
        ]);

        assert.equal(result, "SELECT `user_id` as `_id`, SUM(3 / 5) as `sum` FROM `loginstore` GROUP BY `user_id`");

    })

    it('should SUM a number of numbers separated by a +', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                sum: {
                    "$sum": [3, "+", 5]
                }
            }}
        ]);

        assert.equal(result, "SELECT `user_id` as `_id`, SUM(3 + 5) as `sum` FROM `loginstore` GROUP BY `user_id`");

    })

    it('should SUM a number of numbers separated by a -', function() {
        let result = mongoToSQL.convert(resource, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                sum: {
                    "$sum": [3, "-", 5]
                }
            }}
        ]);

        assert.equal(result, "SELECT `user_id` as `_id`, SUM(3 - 5) as `sum` FROM `loginstore` GROUP BY `user_id`");

    })
});
