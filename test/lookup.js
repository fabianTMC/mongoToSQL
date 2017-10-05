var mongoToSQL = require("../lib/index");
var assert = require('chai').assert;

describe('$lookup tests', function() {
    it('should fail because of missing fields in the $lookup', function() {
        let result = mongoToSQL.$lookup({
            from: "states",
            foreignField: "id",
            localField: "state_id"
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.MISSING_FIELDS("$lookup"));
    })

    it('should fail because of missing fields in the $lookup', function() {
        let result = mongoToSQL.$lookup({
            from: "states",
            foreignField: "id",
            localField: "state_id",
            as: {
                "stateName": "$name"
            }
        });

        console.log(result)
    })
});
