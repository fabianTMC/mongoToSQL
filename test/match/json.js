var mongoToSQL = require("../../lib/index");
var assert = require('chai').assert;

let resource = "inventory";

describe('json $match tests using mongoToSQL', function() {
    it('should match a json array', function() {
        let result = mongoToSQL.convert(resource, [{
            $match: {
                status: ["hello", null]
            }
        }]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE JSON_CONTAINS(`status`, '[\"hello\",null]') = 1");
    });
});