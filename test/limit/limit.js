var mongoToSQL = require("../../lib/index");
var assert = require('chai').assert;
var $limit = require("../../lib/stages/limit");

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

    it('should add a limit when $limit is an object', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$limit": {
                    "limit": 5
                },
            }
        ]);

        assert.equal(result, "`inventory` LIMIT 5");
    });

    it('should add a skip because $limit is an object with only skip', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$limit": {
                    "skip": 5
                },
            }
        ]);

        assert.equal(result, "`inventory` OFFSET 5");
    });

    it('should add a skip and limit because $limit', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$limit": {
                    "limit": 5,
                    "skip": 5
                },
            }
        ]);

        assert.equal(result, "`inventory` LIMIT 5 OFFSET 5");
    });

    it('should fail because $limit is an empty object', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$limit": {

                },
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_LIMIT);
    });

    it("direct stage test - should not add the resource name when `headless` is provided", function() {
        let result = $limit(5, resource, {
            headless: true,
        });

        assert.equal(result.success, true);
        assert.equal(result.query, "LIMIT 5")
    });

    it("direct stage test - should add the resource name when `headless` is provided but false", function() {
        let result = $limit(5, resource, {
            headless: false,
        });

        assert.equal(result.success, true);
        assert.equal(result.query, "`inventory` LIMIT 5")
    });

    it("direct stage test - should add the resource name when `headless` is not provided", function() {
        let result = $limit(5, resource, {});

        assert.equal(result.success, true);
        assert.equal(result.query, "`inventory` LIMIT 5")
    });
})