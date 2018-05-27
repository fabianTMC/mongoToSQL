// Convert expressions into their matching SQL components
// $name -> name as name
// name -> 'name' as name
// 1.1 -> 
var mysql = require("mysql");
var ConvertAccumulators = require("./ConvertAccumulators");

module.exports = function(field, fieldValue, options = {}) {
    let defaultOptions = {accumulators: false, inclusion: false, aliasing: true};
    options = {...defaultOptions, ...options};

    let query = "";

    switch(typeof fieldValue) {
        case "string": {
            // Check if the fieldValue is a valid key
            if(fieldValue[0] == "$") {
                fieldValue = fieldValue.slice(1);

                if(options.belongsToTable) {
                    fieldValue = options.belongsToTable + "." + fieldValue;
                }

                query += " " + mysql.escapeId(fieldValue);
                if(options['aliasing'] == true) {
                    query += " as " + mysql.escapeId(field);
                }

                query += ',';
            } else {
                query += " " + mysql.escape(fieldValue);

                if(options['aliasing'] == true) {
                     query += " as " + mysql.escapeId(field);
                }

                query += ',';
            }

            break;
        }

        case "object": {
            if(options['accumulators'] && options.accumulators === true) {
                let result = ConvertAccumulators(field, fieldValue);
                if(result.success) {
                    query += " " + result.query;
                    if(options['aliasing'] == true) {
                        query += " as " + mysql.escapeId(field);
                    }

                    query += ',';
                } else {
                    return result;
                }
            };

            break;
        }

        case "number": {
            if(options['inclusion'] && options.inclusion === true) {
                if(fieldValue === 1) {
                    if(options.inclusionTable) {
                        field = options.inclusionTable + "." + field;
                    }

                    query += " " + mysql.escapeId(field) + ",";
                } else {
                    query += " " + mysql.escape(fieldValue);
                    if(options['aliasing'] == true) {
                        query += " as " + mysql.escapeId(field);
                    }

                    query += ',';
                }
            } else {
                query += " " + mysql.escape(fieldValue);
                if(options['aliasing'] == true) {
                    query += " as " + mysql.escapeId(field);
                }

                query += ',';
            }

            break;
        }

        case "boolean": {
            query += " " + mysql.escape(fieldValue);
            if(options['aliasing'] == true) {
                query += " as " + mysql.escapeId(field);
            }

            query += ',';
            break;
        }
    }

    return {
        success: true,
        query: query
    };
}
