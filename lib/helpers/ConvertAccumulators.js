var Errors = require("../Errors");

// Handle the different types of accumulators
module.exports = function(allFields, key, obj) {
    if(obj['$sum']) {
        // Check if we have one field or multiple or if we have to run a count
        switch(typeof obj['$sum']) {
            case "number": {
                let query = "COUNT(*)";
                if(obj['$sum'] > 1) {
                    query += " * " + obj['$sum']
                }

                return {
                    success: true,
                    query: query
                };
            }

            case "string": {
                // Check if the string is a valid field
                if(obj['$sum'][0] == "$" && allFields.indexOf(obj['$sum'].slice(1)) != -1) {
                    return {
                        success: true,
                        query: "COUNT(" + obj['$sum'].slice(1) + ")"
                    };
                } else {
                    return {
                        success: false,
                        error: Errors.INVALID_FIELD(obj['$sum'])
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
