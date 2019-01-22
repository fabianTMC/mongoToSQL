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
                        query: "COUNT(" + obj['$count'].slice(1) + ")"
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
    } else {
        return {
            success: false,
            error: Errors.UNSUPPORTED_ACCUMULATOR(obj)
        }
    }
}
