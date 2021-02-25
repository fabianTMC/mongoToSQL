var mongoToSQL = require("../../lib/index");
var assert = require('chai').assert;

let resource = "loginstore";

describe('$query tests', function () {
    it('should fail because of the empty match', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$query": {
                    "pipeline": [
                        {
                            $match: {

                            }
                        }
                    ]
                }
            }
        ]
    );

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.EMPTY_MATCHING)
    });

    it('should run a projection with a selection', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$query": {
                    "pipeline": [
                        {
                            $match: {
                                user_id: 100,
                            }
                        },
                        {
                            $project: {
                                user_id: 1,
                                name: 1,
                            }
                        }
                    ]
                },
            }
        ]);

    assert.equal(result, "(SELECT `user_id`, `name` FROM `loginstore` WHERE `user_id` = 100)");
});
});
