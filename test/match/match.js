var mongoToSQL = require("../../lib/index");
var assert = require('chai').assert;

let resource = "inventory";

describe('$match tests using mongoToSQL', function() {
    it('should fail because of the empty $match', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            
        }}
        ]);
        
        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.EMPTY_MATCHING);
    });
    
    it('should succeed because of the one match value', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            status: "D"
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `status` = 'D'");
    });
    
    it('should succeed because of the two match values', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            status: "D",
            qty: 2
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `status` = 'D' AND `qty` = 2");
    });
    
    it('should succeed because of a valid $lt operator', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            qty: {
                $lt: 2
            }
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` < 2");
    });
    
    it('should succeed because of a valid $gt operator', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            qty: {
                $gt: 2
            }
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` > 2");
    });
    
    it('should succeed because of a valid $lte operator', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            qty: {
                $lte: 2
            }
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` <= 2");
    });
    
    it('should succeed because of a valid $gte operator', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            qty: {
                $gte: 2.2
            }
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` >= 2.2");
    });
    
    it('should succeed because of a valid $eq operator - number', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            qty: {
                $eq: 2
            }
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` = 2");
    });

    it('should succeed because of a valid $eq operator - string', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            qty: {
                $eq: "20"
            }
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` = '20'");
    });

    it('should succeed because of a valid $eq operator - boolean', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            qty: {
                $eq: false
            }
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` IS false");
    });

    it('should succeed because of a valid $ne operator - boolean', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            qty: {
                $ne: false
            }
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` IS NOT false");
    });
    
    it('should succeed because of a valid $ne operator', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            qty: {
                $ne: 2
            }
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` != 2");
    });
    
    // NOTE: Since $lt, $gt, $gte, $lte, $eq use the same function internally, to test 
    // failure for one is to test failure for all
    it('should fail because of a invalid $lt value', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            qty: {
                $lt: [2]
            }
        }}
        ]);
        
        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.NOT_A_NUMBER);
    });

    it('should fail because of a invalid $lt value', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            qty: {
                $lt: false
            }
        }}
        ]);
        
        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.NOT_A_NUMBER);
    });
});

// NOTE: We are only testing options below
describe('$match tests using $match directly', function() {
    it('should return the entire query', function() {
        let result = mongoToSQL.$match({
            status: "hello",
            area: "world"
        }, resource);
        
        assert.equal(result.query, "SELECT * FROM `inventory` WHERE `status` = 'hello' AND `area` = 'world'");
    });

    it('should return the entire query without the head', function() {
        let result = mongoToSQL.$match({
            status: "hello",
            area: "world"
        }, resource, {headless: true});
        
        assert.equal(result.query, "WHERE `status` = 'hello' AND `area` = 'world'");
    });


    it('should return the entire query since we have specified no options', function() {
        let result = mongoToSQL.$match({
            status: {
                $in: ["A", "D"]
            }
        }, resource);
        
        assert.equal(result.query, "SELECT * FROM `inventory` WHERE `status` in ('A','D')");
    });

    it('should return the partial query since we have specified headless mode', function() {
        let result = mongoToSQL.$match({
            status: {
                $in: ["A", "D"]
            }
        }, resource, {headless: true});
        
        assert.equal(result.query, "WHERE `status` in ('A','D')");
    });

    it('should return the entire query since we have specified no headless mode', function() {
        let result = mongoToSQL.$match({
            status: {
                $in: ["A", "D"]
            }
        }, resource, {headless: false});
        
        assert.equal(result.query, "SELECT * FROM `inventory` WHERE `status` in ('A','D')");
    });

    it('should succeed with undefined being replaced by null', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            status: undefined
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `status` IS NULL");
    });
})