var mongoToSQL = require("../lib/index");
var assert = require('chai').assert;

let resource = "inventory";

describe('$limit tests using mongoToSQL', function () {
    it('should fail because of the empty $limit', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$limit": {
                    
                }
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_LIMIT);
    });

    it('should fail because $limit is a string', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$limit": "5"
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_LIMIT);
    });

    it('should not fail because $limit is a valid number = 0', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$limit": 0
            }
        ]);

        assert.equal(result, "`inventory` LIMIT 0");
    });

    it('should not fail because $limit is a valid number > 0', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$limit": 5
            }
        ]);

        assert.equal(result, "`inventory` LIMIT 5");
    });

    it('should fail because $limit is a negative number', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$limit": -5
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_LIMIT);
    });

    it('should fail because $limit is Infinity', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$limit": Infinity,
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_LIMIT);
    });

    it('should fail because $limit is -Infinity', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$limit": -Infinity,
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_LIMIT);
    });

    it('should fail because $limit is NaN', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$limit": NaN,
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_LIMIT);
    });

    it('should fail because $limit is boolean', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$limit": true,
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_LIMIT);
    });

    it('should not fail because $limit is a float', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$limit": 5.5,
            }
        ]);

        assert.equal(result, "`inventory` LIMIT 5");
    });
})