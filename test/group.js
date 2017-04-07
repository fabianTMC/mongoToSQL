var mongoToSQL = require("../lib/index");
var assert = require('chai').assert;

let resource = "loginstore";
let fields = ["verified", "user_id", "count", "age"];

describe('$group tests', function() {
    it('should fail because of the empty grouping', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {"$group": {

            }}
        ]);

        assert.equal(result, mongoToSQL.Errors.EMPTY_GROUPING);
    })

    it('should fail because of the missing _id field', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {"$group": {
                count: {
                    "$sum": 1
                },
                user_id: "$user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result, mongoToSQL.Errors.MISSING_ID);
    })

    it('should fail because of the missing _id field in the second stage', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$sum": 1
                },
                user_id: "$user_id",
                age: "$age"
            }},
            {"$group": {
                count: {
                    "$sum": 1
                },
                user_id: "$user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result, mongoToSQL.Errors.MISSING_ID);
    })

    it('should run a grouping by a string because of the misssing $ in _id', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {"$group": {
                _id: "user_id", // GROUP BY
                count: {
                    "$sum": 1
                },
                user_id: "$user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result, "SELECT COUNT(*) as count, user_id as user_id, age as age FROM loginstore GROUP BY 'user_id'");
    })

    it('should run a grouping on two levels by a string because of the missing $ in _id', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {"$group": {
                _id: "user_id", // GROUP BY
                count: {
                    "$sum": 1
                },
                user_id: "$user_id",
                age: "$age"
            }},
            {"$group": {
                _id: "age", // GROUP BY
                count: {
                    "$sum": 1
                },
            }}
        ]);

        assert.equal(result, "SELECT COUNT(*) as count FROM (SELECT COUNT(*) as count, user_id as user_id, age as age FROM loginstore GROUP BY 'user_id') t0 GROUP BY 'age'");
    })


    it('should run a grouping on one level', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$sum": 1
                },
                user_id: "$user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result, "SELECT COUNT(*) as count, user_id as user_id, age as age FROM loginstore GROUP BY user_id");
    })

    it('should run a grouping on two levels', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$sum": 1
                },
                user_id: "$user_id",
                age: "$age"
            }},
            {"$group": {
                _id: "$age", // GROUP BY
                count: {
                    "$sum": 1
                },
            }}
        ]);

        assert.equal(result, "SELECT COUNT(*) as count FROM (SELECT COUNT(*) as count, user_id as user_id, age as age FROM loginstore GROUP BY user_id) t0 GROUP BY age");
    })

    it('should add a string as a field because of the missing $ (one level)', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$sum": 1
                },
                user_id: "user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result, "SELECT COUNT(*) as count, 'user_id' as user_id, age as age FROM loginstore GROUP BY user_id");
    })

    it('should add a string as a field because of the missing $ (two level)', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$sum": 1
                },
                user_id: "user_id",
                age: "$age"
            }},
            {"$group": {
                _id: "$age", // GROUP BY
                count: {
                    "$sum": 1
                },
                age: "age"
            }}
        ]);

        assert.equal(result, "SELECT COUNT(*) as count, 'age' as age FROM (SELECT COUNT(*) as count, 'user_id' as user_id, age as age FROM loginstore GROUP BY user_id) t0 GROUP BY age");
    })

    it('should count all the verified fields', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$sum": "$verified"
                },
                user_id: "$user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result, "SELECT COUNT(verified) as count, user_id as user_id, age as age FROM loginstore GROUP BY user_id");
    })

    it('should fail to count all the verified fields becasuse of the missing $', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$sum": "verified"
                },
                user_id: "$user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result, mongoToSQL.Errors.INVALID_FIELD('verified'));
    })

    it('should count all fields multiplied by a factor of 2', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {"$group": {
                _id: "$user_id", // GROUP BY
                count: {
                    "$sum": 2
                },
                user_id: "$user_id",
                age: "$age"
            }}
        ]);

        assert.equal(result, "SELECT COUNT(*) * 2 as count, user_id as user_id, age as age FROM loginstore GROUP BY user_id");
    })
});
