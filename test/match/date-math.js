var mongoToSQL = require("../../lib/index");
var assert = require('chai').assert;

var moment = require("moment");

let resource = "inventory";

describe('date math $match tests using mongoToSQL', function() {
    it('should succeed because of a $lt operator that is assumed to be a date', function() {
        let result = mongoToSQL.convert(resource, [
        {"$match": {
            qty: {
                $lt: "2019-02-02"
            }
        }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` < '2019-02-02'");
    });
    
    it('should fail because of a invalid date math specification inside the $lt operator', function() {
        let result = mongoToSQL.convert(resource, [
            {"$match": {
                qty: {
                    $lt: {}
                }
            }}
        ]);
        
        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.NOT_A_VALID_DATE_MATH_FORMAT);
    });
    

    it('should fail because of a incomplete date math specification inside the $lt operator - only dateType specified', function() {
        let result = mongoToSQL.convert(resource, [
            {"$match": {
                qty: {
                    $lt: {
                        "type": "DATE",
                    }
                }
            }}
        ]);
        
        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.NOT_A_VALID_DATE_MATH_FORMAT);
    });

    it('should fail because of a incomplete date math specification inside the $lt operator - only dateType and operation specified', function() {
        let result = mongoToSQL.convert(resource, [
            {"$match": {
                qty: {
                    $lt: {
                        "type": "DATE",
                        "operation": "subtract",
                    }
                }
            }}
        ]);
        
        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.NOT_A_VALID_DATE_MATH_FORMAT);
    });


    it('should fail because of a incomplete date math specification inside the $lt operator - no units', function() {
        let result = mongoToSQL.convert(resource, [
            {"$match": {
                qty: {
                    $lt: {
                        "type": "DATE",
                        "operation": "subtract",
                        "units": []
                    }
                }
            }}
        ]);
        
        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.NOT_A_VALID_DATE_MATH_FORMAT);
    });

    it('should fail because of an invalid optional date value inside the $lt operator', function() {
        let result = mongoToSQL.convert(resource, [
            {"$match": {
                qty: {
                    $lt: {
                        "value": "subtract",
                        "type": "DATE",
                        "operation": "subtract",
                        "units": [
                            {

                            }
                        ]
                    }
                }
            }}
        ]);
        
        assert.equal(result.success, false);
        assert.equal(result.error, mongoToSQL.Errors.INVALID_DATE_OR_TIME);
    });

    it('should succeed despite an incomplete date math specification inside the $lt operator - invalid units', function() {
        let result = mongoToSQL.convert(resource, [
            {"$match": {
                qty: {
                    $lt: {
                        "value": "2021-02-24",
                        "type": "DATE",
                        "operation": "subtract",
                        "units": [
                            {

                            }
                        ]
                    }
                }
            }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` < '2021-02-24'");
    });


    it('should succeed when 1 unit are passed to the date math specification inside the $lt operator along with an optional date value', function() {
        let result = mongoToSQL.convert(resource, [
            {"$match": {
                qty: {
                    $lt: {
                        "value": "2021-02-24",
                        "type": "DATE",
                        "operation": "subtract",
                        "units": [
                            {
                                "number": 1,
                                "type": "days"
                            }
                        ]
                    }
                }
            }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` < '2021-02-23'");
    });

    it('should succeed when 2 units are passed to the date math specification inside the $lt operator along with an optional date value', function() {
        let result = mongoToSQL.convert(resource, [
            {"$match": {
                qty: {
                    $lt: {
                        "value": "2021-02-24",
                        "type": "DATE",
                        "operation": "subtract",
                        "units": [
                            {
                                "number": 1,
                                "type": "days"
                            },
                            {
                                "number": 1,
                                "type": "days"
                            }
                        ]
                    }
                }
            }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` < '2021-02-22'");
    });


    it('should succeed when 2 units are passed to the date math specification inside the $lt operator along with an optional date value in the date time format', function() {
        let result = mongoToSQL.convert(resource, [
            {"$match": {
                qty: {
                    $lt: {
                        "value": "2021-02-24 12:00:00",
                        "type": "DATETIME",
                        "operation": "subtract",
                        "units": [
                            {
                                "number": 1,
                                "type": "day"
                            },
                            {
                                "number": 1,
                                "type": "hour"
                            }
                        ]
                    }
                }
            }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` < '2021-02-23 11:00:00'");
    });

    it('should succeed when 2 units are passed to the date math specification but 1 is invalid inside the $lt operator along with an optional date value in the date time format', function() {
        let result = mongoToSQL.convert(resource, [
            {"$match": {
                qty: {
                    $lt: {
                        "value": "2021-02-24 12:00:00",
                        "type": "DATETIME",
                        "operation": "subtract",
                        "units": [
                            {
                                "number": 1,
                                "type": "day"
                            },
                            {
                                "number": 1,
                                "type": "moon"
                            }
                        ]
                    }
                }
            }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` < '2021-02-23 12:00:00'");
    });

    it('should succeed when 1 units are passed to the date math specification inside the $lt operator along with an optional date value in the time format', function() {
        let result = mongoToSQL.convert(resource, [
            {"$match": {
                qty: {
                    $lt: {
                        "value": "2021-02-21 12:00:00",
                        "type": "TIME",
                        "operation": "subtract",
                        "units": [
                            {
                                "number": 1,
                                "type": "hour"
                            }
                        ]
                    }
                }
            }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` < '11:00:00'");
    });

    it('should succeed when 1 units are passed to the date math specification inside the $lt operator along with an optional date value in the date time format - add', function() {
        let result = mongoToSQL.convert(resource, [
            {"$match": {
                qty: {
                    $lt: {
                        "value": "2021-02-21 12:00:00",
                        "type": "TIME",
                        "operation": "add",
                        "units": [
                            {
                                "number": 1,
                                "type": "hour"
                            }
                        ]
                    }
                }
            }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` < '13:00:00'");
    });

    it('should succeed when 1 units are passed to the date math specification inside the $lt operator in the date time format - add', function() {
        let result = mongoToSQL.convert(resource, [
            {"$match": {
                qty: {
                    $lt: {
                        "type": "TIME",
                        "operation": "add",
                        "units": [
                            {
                                "number": 1,
                                "type": "hour"
                            }
                        ]
                    }
                }
            }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` < '" + moment().add("1", "hour").format("HH:mm:ss") + "'");
    });

    it('should succeed when 1 unit are passed to the date math specification inside the $lt operator along with an optional date value in conjunction with another field', function() {
        let result = mongoToSQL.convert(resource, [
            {"$match": {
                qty: {
                    $lt: {
                        "value": "2021-02-24",
                        "type": "DATE",
                        "operation": "subtract",
                        "units": [
                            {
                                "number": 1,
                                "type": "days"
                            }
                        ]
                    }
                },
                qty2: {
                    $gt: {
                        "value": "2021-02-24",
                        "type": "DATE",
                        "operation": "subtract",
                        "units": [
                            {
                                "number": 2,
                                "type": "days"
                            }
                        ]
                    }
                }
            }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `qty` < '2021-02-23' AND `qty2` > '2021-02-22'");
    });

    it('should succeed when 1 unit are passed to the date math specification inside the $lt operator along with an optional date value in conjunction with $and', function() {
        let result = mongoToSQL.convert(resource, [
            {"$match": {
                $and: [
                    {
                        qty: {
                            $lt: {
                                "value": "2021-02-24",
                                "type": "DATE",
                                "operation": "subtract",
                                "units": [
                                    {
                                        "number": 1,
                                        "type": "days"
                                    }
                                ]
                            }
                        }
                    },
                    {
                        qty2: {
                            $gt: {
                                "value": "2021-02-24",
                                "type": "DATE",
                                "operation": "subtract",
                                "units": [
                                    {
                                        "number": 2,
                                        "type": "days"
                                    }
                                ]
                            }
                        }
                    }
                ]
            }}
        ]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE ( `qty` < '2021-02-23' AND `qty2` > '2021-02-22' )");
    });
});