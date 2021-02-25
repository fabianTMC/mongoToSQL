var mongoToSQL = require("../../lib/index");
var assert = require('chai').assert;

let resource = "inventory";

describe('$in $nin - $match tests using mongoToSQL', function() {

    
    // NOTE: Since $in and $ini use the same function internally, to test 
    // failure for one is to test failure for the other
    it('should fail because of an invalid $in operator 11', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            status: {
                $in: []
            }
        }}
        ]);
        
        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.IN_NOT_AN_ARRAY);
    });
    
    it('should fail because of an invalid $in operator 2', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            status: {
                $in: "abc"
            }
        }}
        ]);
        
        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.IN_NOT_AN_ARRAY);
    });
    
    it('should fail because of an invalid $in operator 3', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            status: {
                $in: 1
            }
        }}
        ]);
        
        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.IN_NOT_AN_ARRAY);
    });
    
    it('should succeed because of a valid $in operator', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            status: {
                $in: ["A", "D"]
            }
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `status` in ('A','D')");
    });
    
    it('should succeed because of a valid $in operator with numbers', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            qty: {
                $in: [2, 3]
            }
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` in (2,3)");
    });
    
    it('should succeed because of a valid $in operator and value match', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            status: {
                $in: ["A", "D"]
            },
            qty: 2
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `status` in ('A','D') AND `qty` = 2");
    });
    
    it('should succeed because of a valid $nin operator', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            status: {
                $nin: ["A", "D"]
            }
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `status` not in ('A','D')");
    });
    
    it('should succeed because of a valid $nin operator with numbers', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            qty: {
                $nin: [2, 3]
            }
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` not in (2,3)");
    });
    
    it('should succeed because of a valid $nin operator and value match', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            status: {
                $nin: ["A", "D"]
            },
            qty: 2
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `status` not in ('A','D') AND `qty` = 2");
    });
    
    it('should succeed because of a valid $nin operator and valid $in operator', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            status: {
                $nin: ["A", "D"]
            },
            qty: {
                $in: [2, 3]
            }
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `status` not in ('A','D') AND `qty` in (2,3)");
    });
});