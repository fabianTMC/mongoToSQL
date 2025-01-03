var mongoToSQL = require("../../lib/index");
var assert = require('chai').assert;

let resource = "inventory";

describe('$or $and - $match tests using mongoToSQL', function() {
    // NOTE: Since $or and $and use the same function internally, to test 
    // failure for one is to test failure for all
    it('should fail because of an invalid $and operator', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            $and: []
        }}
        ]);
        
        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.NOT_AN_ARRAY("and"));
    });
    

    it('should fail because of an invalid $or operator', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            $or: []
        }}
        ]);
        
        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.NOT_AN_ARRAY("or"));
    });
    
    it('should fail because of an invalid $or operator', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            $or: false
        }}
        ]);
        
        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.NOT_AN_ARRAY("or"));
    });

    it('should succeed because of a valid $or operator', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            $or: [
            {
                qty: 2
            },
            {
                status: "D"
            }
            ]
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE ( `qty` = 2 OR `status` = 'D' )");
    });
    
    it('should succeed because of a valid $or operator with mixed operators', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            $or: [
            {
                qty: {
                    $lt: 2
                }
            },
            {
                status: "D"
            }
            ]
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE ( `qty` < 2 OR `status` = 'D' )");
    });
    
    it('should succeed because of a valid $or operator with mixed operators and an implicit AND', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            type: 3,
            $or: [
            {
                qty: {
                    $lt: 2
                }
            },
            {
                status: "D"
            }
            ]
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `type` = 3 AND ( `qty` < 2 OR `status` = 'D' )");
    });

    it('should succeed because of a valid $and operator', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            $and: [
            {
                qty: 2
            },
            {
                status: "D"
            }
            ]
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE ( `qty` = 2 AND `status` = 'D' )");
    });
    
    it('should succeed because of a valid $and operator with mixed operators', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            $and: [
            {
                qty: {
                    $lt: 2
                }
            },
            {
                status: "D"
            }
            ]
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE ( `qty` < 2 AND `status` = 'D' )");
    });
});