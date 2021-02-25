var mongoToSQL = require("../../lib/index");
var assert = require('chai').assert;

let resource = "inventory";

describe('$skip tests using mongoToSQL', function () {
    it('should fail because of the empty $skip', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$skip": {
                    
                }
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_SKIP);
    });

    it('should fail because $skip is a string', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$skip": "5"
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_SKIP);
    });

    it('should not fail because $skip is a valid number = 0', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$skip": 0
            }
        ]);

        assert.equal(result, "`inventory` OFFSET 0");
    });

    it('should not fail because $skip is a valid number > 0', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$skip": 5
            }
        ]);

        assert.equal(result, "`inventory` OFFSET 5");
    });

    it('should fail because $skip is a negative number', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$skip": -5
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_SKIP);
    });

    it('should fail because $skip is Infinity', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$skip": Infinity,
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_SKIP);
    });

    it('should fail because $skip is -Infinity', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$skip": -Infinity,
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_SKIP);
    });

    it('should fail because $skip is NaN', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$skip": NaN,
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_SKIP);
    });

    it('should fail because $skip is boolean', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$skip": true,
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_SKIP);
    });

    it('should not fail because $skip is a float', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$skip": 5.5,
            }
        ]);

        assert.equal(result, "`inventory` OFFSET 5");
    });
})