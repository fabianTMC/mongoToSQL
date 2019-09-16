var mongoToSQL = require("../lib/index");
var assert = require('chai').assert;

describe('$lookup tests', function() {
    it('should fail because of missing fields in the $lookup', function() {
        let result = mongoToSQL.$lookup({
            from: "states",
            foreignField: "id",
            localField: "state_id"
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.MISSING_FIELDS("$lookup"));
    })

    it('should fail as there is no resource provided', function() {
        let result = mongoToSQL.$lookup({
            from: "states",
            foreignField: "id",
            localField: "state_id",
            as: {
                "state_id": 1
            }
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.MISSING_RESOURCE_NAME);
    });

    it('should fail because `as` is not an object', function() {
        let result = mongoToSQL.$lookup({
            from: "states",
            foreignField: "id",
            localField: "state_id",
            as: ["state_id"]
        }, "users");

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_$AS);
    });

    it('should succeed - single direct $lookup', function() {
        let result = mongoToSQL.$lookup({
            from: "states",
            foreignField: "id",
            localField: "state_id",
            as: {
                "state_id": 1
            }
        }, "users");

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT `users`.`state_id` FROM `users` LEFT OUTER JOIN `states` ON `states`.`id` = `users`.`state_id`");
    });

    it('should succeed - single direct $lookup with selected fields from looked up table', function() {
        let result = mongoToSQL.$lookup({
            from: "states",
            foreignField: "id",
            localField: "state_id",
            as: {
                "state_id": 1,
                "stateName": "$name"
            }
        }, "users");

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT `users`.`state_id`, `states`.`name` as `stateName` FROM `users` LEFT OUTER JOIN `states` ON `states`.`id` = `users`.`state_id`");
    });

    it('should succeed - single direct $lookup with selected fields from looked up table and custom values', function() {
        let result = mongoToSQL.$lookup({
            from: "states",
            foreignField: "id",
            localField: "state_id",
            as: {
                "state_id": 1,
                "stateName": "$name",
                "dummy": "dummy",
                "boolean": true,
                "number": 10.5
            }
        }, "users");

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT `users`.`state_id`, `states`.`name` as `stateName`, 'dummy' as `dummy`, true as `boolean`, 10.5 as `number` FROM `users` LEFT OUTER JOIN `states` ON `states`.`id` = `users`.`state_id`");
    });

    it('should succeed - two stage direct $lookup', function() {
        let result = mongoToSQL.convert("users",[
            {
                "$lookup": {
                    from: "districts",
                    foreignField: "uuid",
                    localField: "district_id",
                    as: {
                        districtName: "$name",
                        state_id: "$state_id",
                        uuid: 1,
                        email: 1,
                    }
                }
            },
            {
                "$lookup": {
                    from: "states",
                    foreignField: "uuid",
                    localField: "state_id",
                    as: {
                        stateName: "$name",
                        districtName: 1,
                        uuid: 1,
                        email: 1
                    }
                }
            }
        ]);

        assert.equal(result, "SELECT `states`.`name` as `stateName`, `t0`.`districtName`, `t0`.`uuid`, `t0`.`email` FROM (SELECT `districts`.`name` as `districtName`, `districts`.`state_id` as `state_id`, `users`.`uuid`, `users`.`email` FROM `users` LEFT OUTER JOIN `districts` ON `districts`.`uuid` = `users`.`district_id`) t0 LEFT OUTER JOIN `states` ON `states`.`uuid` = `t0`.`state_id`");
    });

    it('should succeed - two stage direct $lookup with follow up $match', function() {
        let result = mongoToSQL.convert("users",[
            {
                "$lookup": {
                    from: "districts",
                    foreignField: "uuid",
                    localField: "district_id",
                    as: {
                        districtName: "$name",
                        state_id: "$state_id",
                        uuid: 1,
                        email: 1,
                    }
                }
            },
            {
                "$lookup": {
                    from: "states",
                    foreignField: "uuid",
                    localField: "state_id",
                    as: {
                        stateName: "$name",
                        districtName: 1,
                        uuid: 1,
                        email: 1
                    }
                }
            },
            {
                "$match": {
                    districtName: "The Nilgiris" 
                }
            }
        ]);

        assert.equal(result, "SELECT * FROM (SELECT `states`.`name` as `stateName`, `t0`.`districtName`, `t0`.`uuid`, `t0`.`email` FROM (SELECT `districts`.`name` as `districtName`, `districts`.`state_id` as `state_id`, `users`.`uuid`, `users`.`email` FROM `users` LEFT OUTER JOIN `districts` ON `districts`.`uuid` = `users`.`district_id`) t0 LEFT OUTER JOIN `states` ON `states`.`uuid` = `t0`.`state_id`) t1 WHERE `districtName` = 'The Nilgiris'");
    });

    it('should succeed - two stage direct $lookup with follow up $group and $match', function() {
        let result = mongoToSQL.convert("users",[
            {
                "$lookup": {
                    from: "districts",
                    foreignField: "uuid",
                    localField: "district_id",
                    as: {
                        districtName: "$name",
                        state_id: "$state_id",
                        uuid: 1,
                        email: 1,
                    }
                }
            },
            {
                "$lookup": {
                    from: "states",
                    foreignField: "uuid",
                    localField: "state_id",
                    as: {
                        stateName: "$name",
                        districtName: 1,
                        uuid: 1,
                        email: 1
                    }
                }
            },
            {
                "$group": {
                    _id: "$districtName",
                    count: {
                        "$count": 1
                    } 
                }
            }
        ]);

        assert.equal(result, "SELECT `districtName` as `_id`, COUNT(*) as `count` FROM (SELECT `states`.`name` as `stateName`, `t0`.`districtName`, `t0`.`uuid`, `t0`.`email` FROM (SELECT `districts`.`name` as `districtName`, `districts`.`state_id` as `state_id`, `users`.`uuid`, `users`.`email` FROM `users` LEFT OUTER JOIN `districts` ON `districts`.`uuid` = `users`.`district_id`) t0 LEFT OUTER JOIN `states` ON `states`.`uuid` = `t0`.`state_id`) t1 GROUP BY `districtName`");
    });

    it('should run a left outer join by default', function() {
        let result = mongoToSQL.$lookup({
            from: "states",
            foreignField: "id",
            localField: "state_id",
            as: {
                "state_id": 1,
                "stateName": "$name",
                "dummy": "dummy",
                "boolean": true,
                "number": 10.5
            }
        }, "users");

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT `users`.`state_id`, `states`.`name` as `stateName`, 'dummy' as `dummy`, true as `boolean`, 10.5 as `number` FROM `users` LEFT OUTER JOIN `states` ON `states`.`id` = `users`.`state_id`");
    });

    it('should run a left outer join by configuration', function() {
        let result = mongoToSQL.$lookup({
            from: "states",
            foreignField: "id",
            localField: "state_id",
            joinType: "left",
            as: {
                "state_id": 1,
                "stateName": "$name",
                "dummy": "dummy",
                "boolean": true,
                "number": 10.5
            }
        }, "users");

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT `users`.`state_id`, `states`.`name` as `stateName`, 'dummy' as `dummy`, true as `boolean`, 10.5 as `number` FROM `users` LEFT OUTER JOIN `states` ON `states`.`id` = `users`.`state_id`");
    });

    it('should run a right outer join by configuration', function() {
        let result = mongoToSQL.$lookup({
            from: "states",
            foreignField: "id",
            localField: "state_id",
            joinType: "right",
            as: {
                "state_id": 1,
                "stateName": "$name",
                "dummy": "dummy",
                "boolean": true,
                "number": 10.5
            }
        }, "users");

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT `users`.`state_id`, `states`.`name` as `stateName`, 'dummy' as `dummy`, true as `boolean`, 10.5 as `number` FROM `users` RIGHT OUTER JOIN `states` ON `states`.`id` = `users`.`state_id`");
    });

    it('should run an inner join by configuration', function() {
        let result = mongoToSQL.$lookup({
            from: "states",
            foreignField: "id",
            localField: "state_id",
            joinType: "inner",
            as: {
                "state_id": 1,
                "stateName": "$name",
                "dummy": "dummy",
                "boolean": true,
                "number": 10.5
            }
        }, "users");

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT `users`.`state_id`, `states`.`name` as `stateName`, 'dummy' as `dummy`, true as `boolean`, 10.5 as `number` FROM `users` INNER JOIN `states` ON `states`.`id` = `users`.`state_id`");
    });

    it('should run fail as the joinType is invalid', function() {
        let result = mongoToSQL.$lookup({
            from: "states",
            foreignField: "id",
            localField: "state_id",
            joinType: "inner1",
            as: {
                "state_id": 1,
                "stateName": "$name",
                "dummy": "dummy",
                "boolean": true,
                "number": 10.5
            }
        }, "users");

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_JOIN_TYPE("inner1"));
    });

    it('should default to left outer join when the joinType is a number', function() {
        let result = mongoToSQL.$lookup({
            from: "states",
            foreignField: "id",
            localField: "state_id",
            joinType: 1,
            as: {
                "state_id": 1,
                "stateName": "$name",
                "dummy": "dummy",
                "boolean": true,
                "number": 10.5
            }
        }, "users");

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT `users`.`state_id`, `states`.`name` as `stateName`, 'dummy' as `dummy`, true as `boolean`, 10.5 as `number` FROM `users` LEFT OUTER JOIN `states` ON `states`.`id` = `users`.`state_id`");
    });

    it('should default to left outer join when the joinType is a boolean', function() {
        let result = mongoToSQL.$lookup({
            from: "states",
            foreignField: "id",
            localField: "state_id",
            joinType: false,
            as: {
                "state_id": 1,
                "stateName": "$name",
                "dummy": "dummy",
                "boolean": true,
                "number": 10.5
            }
        }, "users");

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT `users`.`state_id`, `states`.`name` as `stateName`, 'dummy' as `dummy`, true as `boolean`, 10.5 as `number` FROM `users` LEFT OUTER JOIN `states` ON `states`.`id` = `users`.`state_id`");
    });

    it('should default to left outer join when the joinType is null', function() {
        let result = mongoToSQL.$lookup({
            from: "states",
            foreignField: "id",
            localField: "state_id",
            joinType: null,
            as: {
                "state_id": 1,
                "stateName": "$name",
                "dummy": "dummy",
                "boolean": true,
                "number": 10.5
            }
        }, "users");

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT `users`.`state_id`, `states`.`name` as `stateName`, 'dummy' as `dummy`, true as `boolean`, 10.5 as `number` FROM `users` LEFT OUTER JOIN `states` ON `states`.`id` = `users`.`state_id`");
    });

    it('should succeed - one $lookup with two nested $lookup specifications for query without derived tables', function() {
        let result = mongoToSQL.convert("users",[
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
                ]
            },
        ]);

        assert.equal(result, "SELECT `users`.`uuid`, `users`.`email`, `districts`.`name` as `districtName`, `states`.`name` as `stateName` FROM `users` INNER JOIN `districts` INNER JOIN `states` ON `districts`.`uuid` = `users`.`district_id` AND `states`.`uuid` = `districts`.`state_id`");
    });

    it('should succeed - one $lookup with three nested $lookup specifications for query without derived tables', function() {
        let result = mongoToSQL.convert("users",[
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

        assert.equal(result, "SELECT `users`.`uuid`, `users`.`email`, `districts`.`name` as `districtName`, `states`.`name` as `stateName`, `countries`.`name` as `countryName` FROM `users` INNER JOIN `districts` INNER JOIN `states` INNER JOIN `countries` ON `districts`.`uuid` = `users`.`district_id` AND `states`.`uuid` = `districts`.`state_id` AND `countries`.`uuid` = `states`.`country_id`");
    });

    it('should succeed - one $lookup with three nested $lookup specifications and one $match', function() {
        let result = mongoToSQL.convert("users",[
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

        assert.equal(result, "SELECT * FROM (SELECT `users`.`uuid`, `users`.`email`, `districts`.`name` as `districtName`, `states`.`name` as `stateName`, `countries`.`name` as `countryName` FROM `users` INNER JOIN `districts` INNER JOIN `states` INNER JOIN `countries` ON `districts`.`uuid` = `users`.`district_id` AND `states`.`uuid` = `districts`.`state_id` AND `countries`.`uuid` = `states`.`country_id`) t0 WHERE `districtName` = 'The Nilgiris'");
    });
});
