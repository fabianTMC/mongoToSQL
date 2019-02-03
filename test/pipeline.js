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

    it('optimize sql query based on $match before $project at a later secondary stage with an order', function() {
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
            },
            {
                "$order": [
                    {
                        "status": 1
                    }
                ]
            }
            
        ]);
        assert.equal(result, "SELECT `status` FROM (SELECT * FROM (SELECT * FROM `inventory` WHERE `status` = 'A') t0 WHERE `status` = 'D') t1 WHERE `qty` = 2 ORDER BY `status` ASC");
    });

    it('optimize sql query based on $match before $project at a later secondary stage with an order and then follow up with a $match', function() {
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
            },
            {
                "$order": [
                    {
                        "status": 1
                    }
                ]
            },
            {
                "$match": {
                    "status": 10
                }
            }
            
        ]);
        assert.equal(result, "SELECT * FROM (SELECT `status` FROM (SELECT * FROM (SELECT * FROM `inventory` WHERE `status` = 'A') t0 WHERE `status` = 'D') t1 WHERE `qty` = 2 ORDER BY `status` ASC) t4 WHERE `status` = 10");
    });

    it('optimize sql query based on $match before $project at a later secondary stage with multiple orders and then follow up with a $match', function() {
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
            },
            {
                "$order": [
                    {
                        "status": 1
                    },
                    {
                        "qty": -1
                    }
                ]
            },
            {
                "$match": {
                    "status": 10
                }
            }
            
        ]);
        assert.equal(result, "SELECT * FROM (SELECT `status` FROM (SELECT * FROM (SELECT * FROM `inventory` WHERE `status` = 'A') t0 WHERE `status` = 'D') t1 WHERE `qty` = 2 ORDER BY `status` ASC, `qty` DESC) t4 WHERE `status` = 10");
    });

    it('should error because of invalid $order', function() {
        let result = mongoToSQL.convert(resource, [
            {
                "$project": {
                    "status": 1
                }
            },
            {
                "$order": [
                    
                ]
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.EMPTY_ORDER);
    });

    it('should error because of invalid $order', function() {
        let result = mongoToSQL.convert(resource, [
            {
                "$project": {
                    "status": 1
                }
            },
            {
                "$order": [
                    {
                        "status": 2
                    }
                ]
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_ORDER);
    });

    it('should error because of invalid $order in the second order', function() {
        let result = mongoToSQL.convert(resource, [
            {
                "$project": {
                    "status": 1
                }
            },
            {
                "$order": [
                    {
                        "id": 1,
                    },
                    {
                        "status": 2
                    }
                ]
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_ORDER);
    });

    it('should error because of invalid $order object', function() {
        let result = mongoToSQL.convert(resource, [
            {
                "$project": {
                    "status": 1
                }
            },
            {
                "$order": [
                    ["status"]
                ]
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_ORDER_OBJECT);
    });

    it('should error because of invalid second $order object', function() {
        let result = mongoToSQL.convert(resource, [
            {
                "$project": {
                    "status": 1
                }
            },
            {
                "$order": [
                    {
                        "id": 1,
                    },
                    ["status"]
                ]
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_ORDER_OBJECT);
    });

    it('$union with $order', function() {
        let result = mongoToSQL.convert(resource, [
            {"$union": {
                pipelines: [
                    {
                        pipeline: [
                            {
                                $match: {
                                    user_id: 100,
                                }
                            }
                        ],
                    },
                    {
                        resource: "inventory_old",
                        pipeline: [
                            {
                                $match: {
                                    user_id: 200,
                                }
                            }
                        ],
                    }
                ]
            }},
            {
                $order: [{
                    id: 1,
                }]
            }
        ]);

        assert.equal(result, "SELECT * FROM (SELECT * FROM `inventory` WHERE `user_id` = 100 UNION SELECT * FROM `inventory_old` WHERE `user_id` = 200) t0 ORDER BY `id` ASC");
    });
})