var mongoToSQL = require("../lib/index");
var assert = require('chai').assert;

let resource = "inventory";

describe('mixed pipeline tests', function() {
    it('optimize sql query based on $match before $project at the initial stage', function() {
        let result = mongoToSQL.convert(resource, [
            {
                "$match": {
                    "status": "D",
                    "qty": 2
                }
            },
            {
                "$project": {
                    "status": 1
                }
            }
        ]);
        
        assert.equal(result, "SELECT `status` FROM `inventory` WHERE `status` = 'D' AND `qty` = 2");
    });

    it('optimize sql query based on $match before $project at a secondary stage', function() {
        let result = mongoToSQL.convert(resource, [
            {
                "$match": {
                    "status": "D",
                }
            },
            {
                "$match": {
                    "qty": 2
                }
            },
            {
                "$project": {
                    "status": 1
                }
            }
        ]);
        
        assert.equal(result, "SELECT `status` FROM (SELECT * FROM `inventory` WHERE `status` = 'D') t0 WHERE `qty` = 2");
    });

    it('optimize sql query based on $match before $project at a later secondary stage', function() {
        let result = mongoToSQL.convert(resource, [
            {
                "$match": {
                    "status": "A",
                }
            },
            {
                "$match": {
                    "status": "D",
                }
            },
            {
                "$match": {
                    "qty": 2
                }
            },
            {
                "$project": {
                    "status": 1
                }
            }
        ]);
        
        assert.equal(result, "SELECT `status` FROM (SELECT * FROM (SELECT * FROM `inventory` WHERE `status` = 'A') t0 WHERE `status` = 'D') t1 WHERE `qty` = 2");
    });
})