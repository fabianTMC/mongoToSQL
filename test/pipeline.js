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

    it('optimize sql query based on $match before $project at a later secondary stage with an order and then follow up with a $lookup', function() {
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
                "$lookup": {
                    from: "districts",
                    foreignField: "uuid",
                    localField: "district_id",
                    as: {
                        uuid: 1,
                        email: 1,
                        districtName: "$name",
                    }
                }
            }
            
        ]);

        assert.equal(result, "SELECT `t4`.`uuid`, `t4`.`email`, `districts`.`name` as `districtName` FROM (SELECT `status` FROM (SELECT * FROM (SELECT * FROM `inventory` WHERE `status` = 'A') t0 WHERE `status` = 'D') t1 WHERE `qty` = 2 ORDER BY `status` ASC) t4 LEFT OUTER JOIN `districts` ON `districts`.`uuid` = `t4`.`district_id`");
    });

    it('should succeed - one $match, $project then $lookup with three nested $lookup specifications', function() {
        let result = mongoToSQL.convert("users",[
            {
                "$match": {
                    uuid: "abcd" 
                },
            },
            {
                "$project": {
                    uuid: 1,
                    email: 1, 
                },
            },
            {
                "$lookup": [
                    {
                        from: "districts",
                        foreignField: "uuid",
                        localField: "district_id",
                        as: {
                            uuid: 1,
                            email: 1,
                            districtName: "$name",
                        }
                    },
                    {
                        from: "states",
                        on: "districts",
                        foreignField: "uuid",
                        localField: "state_id",
                        as: {
                            stateName: "$name"
                        }
                    },
                    {
                        from: "countries",
                        on: "states",
                        foreignField: "uuid",
                        localField: "country_id",
                        as: {
                            countryName: "$name",
                        }
                    },
                ]
            },
        ]);

        assert.equal(result, "SELECT `t1`.`uuid`, `t1`.`email`, `districts`.`name` as `districtName`, `states`.`name` as `stateName`, `countries`.`name` as `countryName` FROM (SELECT `uuid`, `email` FROM `users` WHERE `uuid` = 'abcd') t1 INNER JOIN `districts` INNER JOIN `states` INNER JOIN `countries` ON `districts`.`uuid` = `t1`.`district_id` AND `states`.`uuid` = `districts`.`state_id` AND `countries`.`uuid` = `states`.`country_id`");
    });

    it('should succeed - one $match, $project then $lookup with three nested $lookup specifications and one $match', function() {
        let result = mongoToSQL.convert("users",[
            {
                "$match": {
                    uuid: "abcd" 
                },
            },
            {
                "$project": {
                    uuid: 1,
                    email: 1, 
                },
            },
            {
                "$lookup": [
                    {
                        from: "districts",
                        foreignField: "uuid",
                        localField: "district_id",
                        as: {
                            uuid: 1,
                            email: 1,
                            districtName: "$name",
                        }
                    },
                    {
                        from: "states",
                        on: "districts",
                        foreignField: "uuid",
                        localField: "state_id",
                        as: {
                            stateName: "$name"
                        }
                    },
                    {
                        from: "countries",
                        on: "states",
                        foreignField: "uuid",
                        localField: "country_id",
                        as: {
                            countryName: "$name",
                        }
                    },
                ]
            },
            {
                "$match": {
                    districtName: "The Nilgiris" 
                }
            },
        ]);

        assert.equal(result, "SELECT * FROM (SELECT `t1`.`uuid`, `t1`.`email`, `districts`.`name` as `districtName`, `states`.`name` as `stateName`, `countries`.`name` as `countryName` FROM (SELECT `uuid`, `email` FROM `users` WHERE `uuid` = 'abcd') t1 INNER JOIN `districts` INNER JOIN `states` INNER JOIN `countries` ON `districts`.`uuid` = `t1`.`district_id` AND `states`.`uuid` = `districts`.`state_id` AND `countries`.`uuid` = `states`.`country_id`) t2 WHERE `districtName` = 'The Nilgiris'");
    });
})