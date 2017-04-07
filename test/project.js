var mongoToSQL = require("../lib/index");
var assert = require('chai').assert;

let resource = "loginstore";
let fields = ["verified", "user_id", "count", "age"];

describe('$project tests', function() {
    it('should throw an error as the projection is empty', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {
                "$project": {}
            }
        ]);

        assert.equal(result, mongoToSQL.Errors.EMPTY_PROJECTION);
    })

    it('throw an error as both inclusion and exclusion were run', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {
                "$project": {
                    "user_id": 0,
                    "verified": 1
                }
            }
        ]);

        assert.equal(result, mongoToSQL.Errors.INCLUSION_AND_EXCLUSION);
    })

    it('should select only the user_id', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {
                "$project": {
                    "user_id": 1
                }
            }
        ]);

        assert.equal(result, "SELECT user_id FROM loginstore");
    })

    it('should select the user_id and verified fields', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {
                "$project": {
                    "user_id": 1,
                    "verified": "$verified"
                }
            }
        ]);

        assert.equal(result, "SELECT user_id, verified as verified FROM loginstore");
    })

    it('should select the user_id, verified and custom fields', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {
                "$project": {
                    "user_id": 1,
                    "verified": "$verified",
                    "custom": "custom"
                }
            }
        ]);

        assert.equal(result, "SELECT user_id, verified as verified, 'custom' as custom FROM loginstore");
    })

    it('should select the fields that are not present in the fields list', function() {
        let result = mongoToSQL.convert(resource, fields, [
            {
                "$project": {
                    "custom": 1
                }
            }
        ]);

        assert.equal(result, "SELECT custom FROM loginstore");
    })
});
