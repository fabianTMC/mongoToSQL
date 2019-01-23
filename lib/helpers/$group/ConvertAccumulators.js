var mysql = require("mysql");
var Errors = require("../../Errors");

// Handle the different types of accumulators
module.exports = function(key, obj) {
    if(obj['$count']) {
        // Check if we have one field or multiple or if we have to run a count
        switch(typeof obj['$count']) {
            case "number": {
                let query = "COUNT(*)";
                if(obj['$count'] > 1) {
                    query += " * " + obj['$count']
                }

                return {
                    success: true,
                    query: query
                };
            }

            case "string": {
                // Check if the string is a valid field
                if(obj['$count'][0] == "$") {
                    return {
                        success: true,
                        query: "COUNT(" + mysql.escapeId(obj['$count'].slice(1)) + ")"
                    };
                } else {
                    return {
                        success: false,
                        error: Errors.INVALID_FIELD(obj['$count'])
                    };
                }
            }

            default: {
                return {
                    success: false,
                    error: Errors.UNSUPPORTED_ACCUMULATOR_EXPRESSION(obj)
                }
            }
        }
    } else if(obj['$sum']) {
        // Check if we have one field or multiple or if we have to run a count
        switch(typeof obj['$sum']) {
            case "number": {
                return {
                    success: true,
                    query: "SUM(" + mysql.escape(obj['$sum']) + ")"
                };
            }

            case "string": {
                // Check if the string is a valid field
                if(obj['$sum'][0] == "$") {
                    return {
                        success: true,
                        query: "SUM(" + mysql.escapeId(obj['$sum'].slice(1)) + ")"
                    };
                } else {
                    return {
                        success: false,
                        error: Errors.INVALID_FIELD(obj['$sum'])
                    };
                }
            }

            case "object": {
                if(Array.isArray(obj['$sum']) && obj['$sum'].length > 0) {
                    if(obj['$sum'].length % 2 == 1) {
                        let result = obj['$sum'].slice(0).reduce((acc, item, index, arr) => {
                            // Check if every second item is an operator
                            if(index % 2 == 1) {
                                if(["*", "+", "-", "/"].includes(item)) {
                                    return `${acc} ${item}`;
                                } else {
                                    arr.splice(1);
        
                                    return {
                                        success: false,
                                        error: Errors.INVALID_SUM_OPERATOR
                                    };
                                } 
                            }

                            // Check if the string is a valid field
                            if(item[0] == "$") {
                                return `${acc} ${mysql.escapeId(item.slice(1))}`;
                            } else if(typeof item === "number") {
                                return `${acc} ${mysql.escape(item)}`;
                            } else {
                                return {
                                    success: false,
                                    error: Errors.UNSUPPORTED_ACCUMULATOR_EXPRESSION(item)
                                };
                            }
                        }, "");
        
                        if(typeof result === "string") {
                            return {
                                success: true,
                                query: `SUM(${result.trim()})`
                            };
                        } else {
                            return result;
                        }
                    } else {
                        return {
                            success: false,
                            error: Errors.INVALID_SUM_OPERATOR
                        };
                    }
                } else {
                    return {
                        success: false,
                        error: Errors.UNSUPPORTED_ACCUMULATOR_EXPRESSION(obj['$sum'])
                    };
                }
            }

            default: {
                return {
                    success: false,
                    error: Errors.UNSUPPORTED_ACCUMULATOR_EXPRESSION(obj['$sum'])
                }
            }
        }
    } else {
        return {
            success: false,
            error: Errors.UNSUPPORTED_ACCUMULATOR(obj)
        }
    }
}
