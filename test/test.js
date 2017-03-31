var mongoToSQL = require("../index");
var assert = require('chai').assert;

describe('Pipeline tests', function() {
    describe('$group tests', function() {
        let resource = "loginstore";
        let fields = ["count", "user_id", "count", "age"];

        it('Should run a grouping on one level', function() {
            let result = mongoToSQL.convert(resource, fields, [
                {"$group": {
                    _id: "user_id", // GROUP BY
                    count: "COUNT(*)",
                    user_id: "user_id",
                    age: "age"
                }}
            ]);

            assert(result == "SELECT COUNT(*) as count, user_id as user_id, age as age FROM loginstore GROUP BY user_id", "First level grouping failed");
        })

        it('Should run a grouping on two levels', function() {
            let result = mongoToSQL.convert(resource, fields, [
                {"$group": {
                    _id: "user_id", // GROUP BY
                    count: "COUNT(*)",
                    user_id: "user_id",
                    age: "age"
                }},
                {"$group": {
                    _id: "age", // GROUP BY
                    count: "COUNT(*)",
                }}
            ]);

            assert(result == "SELECT COUNT(*) as count FROM (SELECT COUNT(*) as count, user_id as user_id, age as age FROM loginstore GROUP BY user_id) t0 GROUP BY age", "Two level grouping failed");
        })
    });
})
