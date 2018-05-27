var mongoToSQL = require("../lib/index");
var assert = require('chai').assert;

let resource = "loginstore";

describe('$project tests', function () {
    it('should throw an error as the projection is empty', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$project": {}
            }
        ]);

        assert.equal(result, mongoToSQL.Errors.EMPTY_PROJECTION);
    })

    it('throw an error as both inclusion and exclusion were run', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$project": {
                    "user_id": 0,
                    "verified": 1
                }
            }
        ]);

        assert.equal(result, mongoToSQL.Errors.INCLUSION_AND_EXCLUSION);
    })

    it('should select only the user_id', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$project": {
                    "user_id": 1
                }
            }
        ]);

        assert.equal(result, "SELECT `user_id` FROM `loginstore`");
    })

    it('should select the user_id and verified fields', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$project": {
                    "user_id": 1,
                    "verified": "$verified"
                }
            }
        ]);

        assert.equal(result, "SELECT `user_id`, `verified` as `verified` FROM `loginstore`");
    });

    it('should select the user_id and verified fields without the table name', function () {
        let result = mongoToSQL.$project(
            {
                "user_id": 1,
                "verified": "$verified"
            }, 
            resource, 
         
            {
                headless: true
            }
        );

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT `user_id`, `verified` as `verified`");
    });

    it('should select the user_id, verified and custom fields', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$project": {
                    "user_id": 1,
                    "verified": "$verified",
                    "custom": "custom"
                }
            }
        ]);

        assert.equal(result, "SELECT `user_id`, `verified` as `verified`, 'custom' as `custom` FROM `loginstore`");
    })

    it('should select the fields that are not present in the fields list', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$project": {
                    "custom": 1
                }
            }
        ]);

        assert.equal(result, "SELECT `custom` FROM `loginstore`");
    })

    it('should select the fields that are not present in the fields list when prefixed with $', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$project": {
                    "custom": "$custom"
                }
            }
        ]);

        assert.equal(result, "SELECT `custom` as `custom` FROM `loginstore`");
    });

    it('should concat the passed fields', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$project": {
                    "concat": {
                        "$concat": [ "$age", " - ", "$user_id" ],
                    }
                }
            }
        ]);

        assert.equal(result, "SELECT CONCAT(`age`, ' - ', `user_id`) as `concat` FROM `loginstore`");
    });

    it('should convert the given field to lowercase', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$project": {
                    "lower": {
                        "$toLower": "$email",
                    }
                }
            }
        ]);

        assert.equal(result, "SELECT LOWER(`email`) as `lower` FROM `loginstore`");
    });

    it('should convert the given field to uppercase', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$project": {
                    "upper": {
                        "$toUpper": "$email",
                    }
                }
            }
        ]);

        assert.equal(result, "SELECT UPPER(`email`) as `upper` FROM `loginstore`");
    });

    it('should convert multiple operators in the given projection', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$project": {
                    "verified": 1,
                    "concat": {
                        "$concat": [ "$age", " - ", "$user_id" ],
                    },
                    "lower": {
                        "$toLower": "$email",
                    },
                    "upper": {
                        "$toUpper": "$email",
                    }
                }
            }
        ]);

        assert.equal(result, "SELECT `verified`, CONCAT(`age`, ' - ', `user_id`) as `concat`, LOWER(`email`) as `lower`, UPPER(`email`) as `upper` FROM `loginstore`");
    });
});
