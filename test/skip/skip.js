var mongoToSQL = require("../../lib/index");
var assert = require('chai').assert;

var $skip = require("../../lib/stages/skip");


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

    it("direct stage test - should not add the resource name when `headless` is provided", function() {
        let result = $skip(5, resource, {
            headless: true,
        });

        assert.equal(result.success, true);
        assert.equal(result.query, "OFFSET 5")
    });

    it("direct stage test - should add the resource name when `headless` is provided but false", function() {
        let result = $skip(5, resource, {
            headless: false,
        });

        assert.equal(result.success, true);
        assert.equal(result.query, "`inventory` OFFSET 5")
    });

    it("direct stage test - should add the resource name when `headless` is not provided", function() {
        let result = $skip(5, resource, {});

        assert.equal(result.success, true);
        assert.equal(result.query, "`inventory` OFFSET 5")
    });
})