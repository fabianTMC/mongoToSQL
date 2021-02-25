var mongoToSQL = require("../../lib/index");
var assert = require('chai').assert;

let resource = "inventory";

describe('subquery $match tests using mongoToSQL', function() {
    it('should return a subquery match', function() {
        let result = mongoToSQL.convert(resource, [{
            $match: {
                status: {
                    $in: {
                        $query: {
                            resource: "inventory",
                            pipeline: [
                                {
                                    $match: {
                                        "id": {
                                            $gt: 10
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `status` in (SELECT * FROM `inventory` WHERE `id` > 10)");
    });

    it('should return a subquery project', function() {
        let result = mongoToSQL.convert(resource, [{
            $match: {
                status: {
                    $in: {
                        $query: {
                            resource: "inventory",
                            pipeline: [
                                {
                                    $project: {
                                        "id": 1
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `status` in (SELECT `id` FROM `inventory`)");
    });

    it('should return a subquery match with project', function() {
        let result = mongoToSQL.convert(resource, [{
            $match: {
                status: {
                    $in: {
                        $query: {
                            resource: "inventory",
                            pipeline: [
                                {
                                    $match: {
                                        "id": {
                                            $gt: 10
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        "id": 1
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }]);
        
        assert.equal(result, "SELECT * FROM `inventory` WHERE `status` in (SELECT `id` FROM `inventory` WHERE `id` > 10)");
    });
});