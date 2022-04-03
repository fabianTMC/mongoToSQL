var mongoToSQL = require("../../lib/index");
var assert = require('chai').assert;

let resource = "inventory";

describe('$search - $match tests using mongoToSQL', function () {

    it('should fail because of an invalid $search operator - undefined', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$match": {
                    status: {
                        $search: undefined
                    },
                }
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.EMPTY_SEARCH);
    });

    it('should fail because of an invalid $search operator - null', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$match": {
                    status: {
                        $search: null
                    },
                }
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.EMPTY_SEARCH);
    });

    it('should fail because of an invalid $search operator - object', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$match": {
                    status: {
                        $search: {a: 1, b: 2}
                    },
                }
            }
        ]);

        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.UNSUPPORTED_SEARCH_VALUE({a: 1, b: 2}));
    });

    it('should search because of a valid $search operator - string', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$match": {
                    status: {
                        $search: "A"
                    },
                }
            }
        ]);

        assert.equal(result, "SELECT * FROM `inventory` WHERE `status` LIKE '%A%'");
    });

    it('should case insensitive search because of a valid $search operator - string', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$match": {
                    status: {
                        $search: "A"
                    },
                }
            }
        ], {
            caseSensitive: false,
        });

        assert.equal(result, "SELECT * FROM `inventory` WHERE LOWER(`status`) LIKE LOWER('%A%')");
    });

    it('should search because of a valid $search operator - number', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$match": {
                    qty: {
                        $search: 2
                    },
                }
            }
        ]);

        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` LIKE '%2%'");
    });

    it('should search because of a valid $search operator - boolean', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$match": {
                    valid: {
                        $search: false
                    },
                }
            }
        ]);

        assert.equal(result, "SELECT * FROM `inventory` WHERE `valid` LIKE '%false%'");
    });

    it('should search because of a valid $search operator - float', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$match": {
                    qty: {
                        $search: 2.2
                    },
                }
            }
        ]);

        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` LIKE '%2.2%'");
    });

    it('should search because of a valid $search operator - array', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$match": {
                    qty: {
                        $search: [1,2]
                    },
                }
            }
        ]);

        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` LIKE '%1,2%'");
    });

    it('should search because of multiple valid $search operator - string and number', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$match": {
                    status: {
                        $search: "A"
                    },

                    qty: {
                        $search: 2
                    },
                }
            }
        ]);

        assert.equal(result, "SELECT * FROM `inventory` WHERE `status` LIKE '%A%' AND `qty` LIKE '%2%'");
    });

    it('should case insensitive search because of multiple valid $search operator - string and number', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$match": {
                    status: {
                        $search: "A"
                    },

                    qty: {
                        $search: 2
                    },
                }
            }
        ], {
            caseSensitive: false,
        });

        assert.equal(result, "SELECT * FROM `inventory` WHERE LOWER(`status`) LIKE LOWER('%A%') AND LOWER(`qty`) LIKE LOWER('%2%')");
    });


    it('should search because of multiple valid $search operator with $or', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$match": {
                    $or: [
                        {
                            status: {
                                $search: "A"
                            }
                        },

                        {
                            qty: {
                                $search: 2
                            }
                        },
                    ]
                }
            }
        ]);

        assert.equal(result, "SELECT * FROM `inventory` WHERE ( `status` LIKE '%A%' OR `qty` LIKE '%2%' )");
    });

    it('should case insensitive search because of multiple valid $search operator with $or', function () {
        let result = mongoToSQL.convert(resource, [
            {
                "$match": {
                    $or: [
                        {
                            status: {
                                $search: "A"
                            }
                        },

                        {
                            qty: {
                                $search: 2
                            }
                        },
                    ]
                }
            }
        ], {
            caseSensitive: false,
        });

        assert.equal(result, "SELECT * FROM `inventory` WHERE ( LOWER(`status`) LIKE LOWER('%A%') OR LOWER(`qty`) LIKE LOWER('%2%') )");
    });
});