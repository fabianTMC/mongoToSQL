var mongoToSQL = require("../../lib/index");
var assert = require('chai').assert;

describe('$join tests', function() {
    it('should fail because of missing fields in the $join', function() {
        let result = mongoToSQL.$join({
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.MISSING_FIELDS("$join"));
    });

    it('should fail because of missing "on" fields in the $join', function() {
        let result = mongoToSQL.$join({
            as: {}
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.MISSING_FIELDS("$join"));
    });

    it('should fail because of missing of an empty "on" field', function() {
        let result = mongoToSQL.$join({
            on: []
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.MISSING_FIELDS("$join"));
    });

    it('should fail because of missing of an on with an invalid specification', function() {
        let result = mongoToSQL.$join({
            on: [{}]
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.MISSING_FIELDS("$join"));
    });

    it('should fail because of missing of an on with an invalid specification - missing to', function() {
        let result = mongoToSQL.$join({
            on: [{
                from: {},
            }]
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.MISSING_FIELDS("$join"));
    });

    it('should fail because of missing of an on with an invalid specification - missing as', function() {
        let result = mongoToSQL.$join({
            on: [{
                to: {},
            }]
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.MISSING_FIELDS("$join"));
    });

    it('should fail because of missing of an on with an invalid specification - empty objects', function() {
        let result = mongoToSQL.$join({
            on: [{
                to: {},
                from: {}
            }]
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.MISSING_FIELDS("$join"));
    });

    it('should fail because of missing of an on with an invalid specification - empty from object', function() {
        let result = mongoToSQL.$join({
            on: [{
                to: {
                    "table": "states",
                    "field": "id"
                },
                from: {}
            }]
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.MISSING_FIELDS("$join"));
    });

    it('should fail because of missing of an on with an invalid specification - empty to object', function() {
        let result = mongoToSQL.$join({
            on: [{
                from: {
                    "table": "states",
                    "field": "id"
                },
                to: {}
            }]
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.MISSING_FIELDS("$join"));
    });

    it('should fail because of missing of an on with an invalid specification - missing field in to object', function() {
        let result = mongoToSQL.$join({
            on: [{
                from: {
                    "table": "states",
                    "field": "id"
                },
                to: {
                    "table": "districts"
                },
            }]
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.MISSING_FIELDS("$join"));
    });

    it('should fail because of missing of an on with an invalid specification - missing field in from object', function() {
        let result = mongoToSQL.$join({
            on: [{
                to: {
                    "table": "states",
                    "field": "id"
                },
                from: {
                    "table": "districts"
                },
            }]
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.MISSING_FIELDS("$join"));
    });

    it('should fail because of missing of an on with an invalid specification - missing table in from object', function() {
        let result = mongoToSQL.$join({
            on: [{
                to: {
                    "table": "states",
                    "field": "id"
                },
                from: {
                    "field": "id"
                },
            }]
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.MISSING_FIELDS("$join"));
    });

    it('should fail because of missing of an on with an invalid specification - missing table in to object', function() {
        let result = mongoToSQL.$join({
            on: [{
                from: {
                    "table": "states",
                    "field": "id"
                },
                to: {
                    "field": "id"
                },
            }]
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.MISSING_FIELDS("$join"));
    });

    it('should succeed because of a valid specification', function() {
        let result = mongoToSQL.$join({
            on: [{
                from: {
                    "table": "districts",
                    "field": "state_id"
                },
                to: {
                    "table": "states",
                    "field": "id"
                },
            }]
        });

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT * FROM `districts` LEFT OUTER JOIN `states` ON `states`.`id` = `districts`.`state_id`");
    });

    it('should succeed because of a valid specification with specified inner join', function() {
        let result = mongoToSQL.$join({
            on: [{
                joinType: "inner",
                from: {
                    "table": "districts",
                    "field": "state_id"
                },
                to: {
                    "table": "states",
                    "field": "id"
                },
            }]
        });

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT * FROM `districts` INNER JOIN `states` ON `states`.`id` = `districts`.`state_id`");
    });

    it('should succeed because of a valid specification with specified right outer join', function() {
        let result = mongoToSQL.$join({
            on: [{
                joinType: "right",
                from: {
                    "table": "districts",
                    "field": "state_id"
                },
                to: {
                    "table": "states",
                    "field": "id"
                },
            }]
        });

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT * FROM `districts` RIGHT OUTER JOIN `states` ON `states`.`id` = `districts`.`state_id`");
    });

    it('should succeed because of a valid specification with specified left outer join', function() {
        let result = mongoToSQL.$join({
            on: [{
                joinType: "left",
                from: {
                    "table": "districts",
                    "field": "state_id"
                },
                to: {
                    "table": "states",
                    "field": "id"
                },
            }]
        });

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT * FROM `districts` LEFT OUTER JOIN `states` ON `states`.`id` = `districts`.`state_id`");
    });

    it('should fail because of an invalid join type', function() {
        let result = mongoToSQL.$join({
            on: [{
                joinType: "invalid",
                from: {
                    "table": "districts",
                    "field": "state_id"
                },
                to: {
                    "table": "states",
                    "field": "id"
                },
            }]
        });

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_JOIN_TYPE("invalid"));
    });

    it('should succeed with an empty as object', function() {
        let result = mongoToSQL.$join({
            as: {},
            on: [{
                from: {
                    "table": "districts",
                    "field": "state_id"
                },
                to: {
                    "table": "states",
                    "field": "id"
                },
            }]
        });

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT * FROM `districts` LEFT OUTER JOIN `states` ON `states`.`id` = `districts`.`state_id`");
    });

    it('should succeed with multiple joins', function() {
        let result = mongoToSQL.$join({
            as: {},
            on: [{
                from: {
                    "table": "districts",
                    "field": "state_id"
                },
                to: {
                    "table": "states",
                    "field": "id"
                },
            }, 
            {
                from: {
                    "table": "states",
                    "field": "country_id"
                },
                to: {
                    "table": "countries",
                    "field": "id"
                },
            }]
        });

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT * FROM `districts` LEFT OUTER JOIN `states` LEFT OUTER JOIN `countries` ON `states`.`id` = `districts`.`state_id` AND `countries`.`id` = `states`.`country_id`");
    });

    it('should succeed with multiple joins with different join types', function() {
        let result = mongoToSQL.$join({
            as: {},
            on: [{
                from: {
                    "table": "districts",
                    "field": "state_id"
                },
                to: {
                    "table": "states",
                    "field": "id"
                },
            }, 
            {
                joinType: "inner",
                from: {
                    "table": "states",
                    "field": "country_id"
                },
                to: {
                    "table": "countries",
                    "field": "id"
                },
            }]
        });

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT * FROM `districts` LEFT OUTER JOIN `states` INNER JOIN `countries` ON `states`.`id` = `districts`.`state_id` AND `countries`.`id` = `states`.`country_id`");
    });

    it('should succeed with multiple joins with specified on fields for all tables', function() {
        let result = mongoToSQL.$join({
            as: {
                districts: {
                    id: "district_id",
                    name: "district_name"
                },
                states: {
                    id: "states_id",
                    name: "states_name"
                },
                countries: {
                    id: "country_id",
                    name: "country_name"
                },
            },
            on: [{
                from: {
                    "table": "districts",
                    "field": "state_id"
                },
                to: {
                    "table": "states",
                    "field": "id"
                },
            }, 
            {
                joinType: "inner",
                from: {
                    "table": "states",
                    "field": "country_id"
                },
                to: {
                    "table": "countries",
                    "field": "id"
                },
            }]
        });

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT `districts`.`id` as `district_id`, `districts`.`name` as `district_name`, `states`.`id` as `states_id`, `states`.`name` as `states_name`, `countries`.`id` as `country_id`, `countries`.`name` as `country_name` FROM `districts` LEFT OUTER JOIN `states` INNER JOIN `countries` ON `states`.`id` = `districts`.`state_id` AND `countries`.`id` = `states`.`country_id`");
    });

    it('should succeed with multiple joins with specified on fields for only two tables', function() {
        let result = mongoToSQL.$join({
            as: {
                states: {
                    id: "states_id",
                    name: "states_name"
                },
                countries: {
                    id: "country_id",
                    name: "country_name"
                },
            },
            on: [{
                from: {
                    "table": "districts",
                    "field": "state_id"
                },
                to: {
                    "table": "states",
                    "field": "id"
                },
            }, 
            {
                joinType: "inner",
                from: {
                    "table": "states",
                    "field": "country_id"
                },
                to: {
                    "table": "countries",
                    "field": "id"
                },
            }]
        });

        assert.equal(result.success, true);
        assert.equal(result.query, "SELECT `states`.`id` as `states_id`, `states`.`name` as `states_name`, `countries`.`id` as `country_id`, `countries`.`name` as `country_name` FROM `districts` LEFT OUTER JOIN `states` INNER JOIN `countries` ON `states`.`id` = `districts`.`state_id` AND `countries`.`id` = `states`.`country_id`");
    });
});
