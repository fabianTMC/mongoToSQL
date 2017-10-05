// Convert expressions into their matching SQL components
// $name -> name as name
// name -> 'name' as name
// 1.1 -> 
var mysql = require("mysql");
var ConvertAccumulators = require("./ConvertAccumulators");

module.exports = function(field, fieldValue, options = {accumulators: false, inclusion: false}) {
    let query = "";

    switch(typeof fieldValue) {
        case "string": {
            // Check if the fieldValue is a valid key
            if(fieldValue[0] == "$") {
                fieldValue = fieldValue.slice(1);

                if(options.belongsToTable) {
                    fieldValue = options.belongsToTable + "." + fieldValue;
                }

                query += " " + mysql.escapeId(fieldValue) + " as " + mysql.escapeId(field) + ',';
            } else {
                query += " " + mysql.escape(fieldValue) + " as " + mysql.escapeId(field) + ',';
            }

            break;
        }

        case "object": {
            if(options['accumulators'] && options.accumulators === true) {
                let result = ConvertAccumulators(field, fieldValue);
                if(result.success) {
                    query += " " + result.query + " as " + mysql.escapeId(field) + ',';
                } else {
                    return result;
                }
            };

            break;
        }

        case "number": {
            if(options['inclusion'] && options.inclusion === true) {
                if(fieldValue === 1) {
                    query += " " + mysql.escapeId(field) + ",";
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
