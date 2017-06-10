var mongoToSQL = require("../lib/index");
var assert = require('chai').assert;

let resource = "inventory";

describe('$match tests', function() {
    it('should fail because of the empty $match', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {

            }}
        ]);

        assert.equal(result, mongoToSQL.Errors.EMPTY_MATCHING);
    });

    it('should succeed because of the one match value', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                status: "D"
            }}
        ]);

        assert.equal(result, "SELECT * FROM inventory WHERE `status` = 'D'");
    });

    it('should succeed because of the two match values', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                status: "D",
                qty: 2
            }}
        ]);

        assert.equal(result, "SELECT * FROM inventory WHERE `status` = 'D' AND `qty` = 2");
    });

    it('should succeed because of a valid $in operator', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                status: {
                    $in: ["A", "D"]
                }
            }}
        ]);

        assert.equal(result, "SELECT * FROM inventory WHERE `status` in ('A','D')");
    });

    it('should succeed because of a valid $in operator with numbers', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                qty: {
                    $in: [2, 3]
                }
            }}
        ]);

        assert.equal(result, "SELECT * FROM inventory WHERE `qty` in (2,3)");
    });

    it('should succeed because of a valid $in operator and value match', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                status: {
                    $in: ["A", "D"]
                },
                qty: 2
            }}
        ]);

        assert.equal(result, "SELECT * FROM inventory WHERE `status` in ('A','D') AND `qty` = 2");
    });

     it('should succeed because of a valid $nin operator', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                status: {
                    $nin: ["A", "D"]
                }
            }}
        ]);

        assert.equal(result, "SELECT * FROM inventory WHERE `status` not in ('A','D')");
    });

    it('should succeed because of a valid $nin operator with numbers', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                qty: {
                    $nin: [2, 3]
                }
            }}
        ]);

        assert.equal(result, "SELECT * FROM inventory WHERE `qty` not in (2,3)");
    });

    it('should succeed because of a valid $nin operator and value match', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                status: {
                    $nin: ["A", "D"]
                },
                qty: 2
            }}
        ]);

        assert.equal(result, "SELECT * FROM inventory WHERE `status` not in ('A','D') AND `qty` = 2");
    });

    it('should succeed because of a valid $nin operator and valid $in operator', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                status: {
                    $nin: ["A", "D"]
                },
                qty: {
                    $in: [2, 3]
                }
            }}
        ]);

        assert.equal(result, "SELECT * FROM inventory WHERE `status` not in ('A','D') AND `qty` in (2,3)");
    });

    // NOTE: Since $in and $ini use the same function internally, to test 
    // failure for one is to test failure for the other
    it('should fail because of an invalid $in operator', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                status: {
                    $in: []
                }
            }}
        ]);

        assert.equal(result, mongoToSQL.Errors.IN_NOT_AN_ARRAY);
    });

    it('should fail because of an invalid $in operator', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                status: {
                    $in: "abc"
                }
            }}
        ]);

        assert.equal(result, mongoToSQL.Errors.IN_NOT_AN_ARRAY);
    });

    it('should fail because of an invalid $in operator', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                status: {
                    $in: 1
                }
            }}
        ]);

        assert.equal(result, mongoToSQL.Errors.IN_NOT_AN_ARRAY);
    });

    it('should succeed because of a valid $lt operator', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                qty: {
                    $lt: 2
                }
            }}
        ]);

        assert.equal(result, "SELECT * FROM inventory WHERE `qty` < 2");
    });

    it('should succeed because of a valid $gt operator', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                qty: {
                    $gt: 2
                }
            }}
        ]);

        assert.equal(result, "SELECT * FROM inventory WHERE `qty` > 2");
    });

    it('should succeed because of a valid $lte operator', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                qty: {
                    $lte: 2
                }
            }}
        ]);

        assert.equal(result, "SELECT * FROM inventory WHERE `qty` <= 2");
    });

    it('should succeed because of a valid $gte operator', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                qty: {
                    $gte: 2.2
                }
            }}
        ]);

        assert.equal(result, "SELECT * FROM inventory WHERE `qty` >= 2.2");
    });

    it('should succeed because of a valid $eq operator', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                qty: {
                    $eq: 2
                }
            }}
        ]);

        assert.equal(result, "SELECT * FROM inventory WHERE `qty` = 2");
    });

    it('should succeed because of a valid $ne operator', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                qty: {
                    $ne: 2
                }
            }}
        ]);

        assert.equal(result, "SELECT * FROM inventory WHERE `qty` != 2");
    });

    // NOTE: Since $lt, $gt, $gte, $lte, $eq use the same function internally, to test 
    // failure for one is to test failure for all
    it('should succeed because of a invalid $lt operator', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                qty: {
                    $lt: "a"
                }
            }}
        ]);

        assert.equal(result, mongoToSQL.Errors.NOT_A_NUMBER);
    });

    it('should succeed because of a invalid $lt operator', function() {
        let result = mongoToSQL.convert(resource, [], [
            {"$match": {
                qty: {
                    $lt: [2]
                }
            }}
        ]);

        assert.equal(result, mongoToSQL.Errors.NOT_A_NUMBER);
    });
});
