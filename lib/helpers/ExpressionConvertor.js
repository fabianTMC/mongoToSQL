var ConvertAccumulators = require("./ConvertAccumulators");

module.exports = function(field, fieldValue, allow = {accumulators: false, inclusion: false}) {
    let query = "";

    switch(typeof fieldValue) {
        case "string": {
            // Check if the fieldValue is a valid key
            if(fieldValue[0] == "$") {
                query += " " + fieldValue.slice(1) + " as " + field + ',';
            } else {
                query += " '" + fieldValue + "' as " + field + ',';
            }

            break;
        }

        case "object": {
            if(allow['accumulators'] && allow.accumulators === true) {
                let result = ConvertAccumulators(field, fieldValue);
                if(result.success) {
                    query += " " + result.query + " as " + field + ',';
                } else {
                    return result;
                }
            };

            break;
        }

        case "number": {
            if(allow['inclusion'] && allow.inclusion === true) {
                if(fieldValue === 1) {
                    query += " " + field + ",";
                }
            }

            break;
        }
    }

    return {
        success: true,
        query: query
    };
}
