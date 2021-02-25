var mongoToSQL = require("../../lib/index");
var assert = require('chai').assert;

let resource = "loginstore";

describe('$union tests', function() {
    it('should fail because of the empty match in the first pipeline', function() {
        let result = mongoToSQL.convert(resource, [
            {"$union": {
                pipelines: [
                    {
                        pipeline: [
                            {
                                $match: {
                                    
                                }
                            }
                        ],
                    },
                    {
                        resource: "loginstore_old",
                        pipeline: [
                            {
                                $match: {
                                    user_id: 100,
                                }
                            }
                        ],
                    }
                ]
            }}
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.EMPTY_MATCHING)
    });

    it('should fail because of the empty match in the second pipeline', function() {
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
                        resource: "loginstore_old",
                        pipeline: [
                            {
                                $match: {
                                    
                                }
                            }
                        ],
                    }
                ]
            }}
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.EMPTY_MATCHING)
    });

    it('should union both the matches', function() {
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
                        resource: "loginstore_old",
                        pipeline: [
                            {
                                $match: {
                                    user_id: 200,
                                }
                            }
                        ],
                    }
                ]
            }}
        ]);

        assert.equal(result, "SELECT * FROM `loginstore` WHERE `user_id` = 100 UNION SELECT * FROM `loginstore_old` WHERE `user_id` = 200");
    });

    it('should union both the matches where one has a projection', function() {
        let result = mongoToSQL.convert(resource, [
            {"$union": {
                pipelines: [
                    {
                        pipeline: [
                            {
                                $match: {
                                    user_id: 100,
                                }
                            },
                            {
                                $project: {
                                    user_id: 1,
                                    name: 1
                                }
                            }
                        ],
                    },
                    {
                        resource: "loginstore_old",
                        pipeline: [
                            {
                                $match: {
                                    user_id: 200,
                                }
                            }
                        ],
                    }
                ]
            }}
        ]);

        assert.equal(result, "SELECT `user_id`, `name` FROM `loginstore` WHERE `user_id` = 100 UNION SELECT * FROM `loginstore_old` WHERE `user_id` = 200");
    });

    it('should union both the matches where one has a projection with the same resource', function() {
        let result = mongoToSQL.convert(resource, [
            {"$union": {
                pipelines: [
                    {
                        pipeline: [
                            {
                                $match: {
                                    user_id: 100,
                                }
                            },
                            {
                                $project: {
                                    user_id: 1,
                                    name: 1
                                }
                            }
                        ],
                    },
                    {
                        pipeline: [
                            {
                                $match: {
                                    user_id: 200,
                                }
                            }
                        ],
                    }
                ]
            }}
        ]);

        assert.equal(result, "SELECT `user_id`, `name` FROM `loginstore` WHERE `user_id` = 100 UNION SELECT * FROM `loginstore` WHERE `user_id` = 200");
    });

    it('should union both when one has a multiple stage with $lookup', function() {
        let result = mongoToSQL.convert(resource, [
            {"$union": {
                pipelines: [
                    {
                        pipeline: [
                            {
                                $match: {
                                    id: 100
                                }
                            },
                            {
                                $lookup: {
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
                                }
                            }
                        ],
                    },
                    {
                        pipeline: [
                            {
                                $match: {
                                    user_id: 200,
                                }
                            }
                        ],
                    }
                ]
            }}
        ]);

        assert.equal(result, "SELECT `t0`.`state_id`, `states`.`name` as `stateName`, 'dummy' as `dummy`, true as `boolean`, 10.5 as `number` FROM (SELECT * FROM `loginstore` WHERE `id` = 100) t0 INNER JOIN `states` ON `states`.`id` = `t0`.`state_id` UNION SELECT * FROM `loginstore` WHERE `user_id` = 200");
    });

    it('should union all the stages', function() {
        let result = mongoToSQL.convert(resource, [
            {"$union": {
                type: "all",
                pipelines: [
                    {
                        pipeline: [
                            {
                                $match: {
                                    user_id: 100,
                                }
                            },
                            {
                                $project: {
                                    user_id: 1,
                                    name: 1
                                }
                            }
                        ],
                    },
                    {
                        pipeline: [
                            {
                                $match: {
                                    user_id: 200,
                                }
                            }
                        ],
                    }
                ]
            }}
        ]);

        assert.equal(result, "SELECT `user_id`, `name` FROM `loginstore` WHERE `user_id` = 100 UNION ALL SELECT * FROM `loginstore` WHERE `user_id` = 200");
    });
});
