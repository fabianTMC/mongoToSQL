var mysql = require("mysql");
var Errors = require("../../Errors");

module.exports = function(field, fieldValue, originalField, checkIfIn = true) {
    let query = "";

    if(originalField !== undefined) {
        if(Array.isArray(fieldValue) && fieldValue.length > 0) {
            let type = (checkIfIn === true) ? "in" : "not in";

            query += " " + mysql.escapeId(originalField) + " " + type + " " + "(";

            for(let i = 0; i < fieldValue.length; i++) {
                query += mysql.escape(fieldValue[i]) + ",";
            }

            // Remove the last comma
            if(query[query.length - 1] == ",") {
                query = query.slice(0, -1);
            }

            query += ")";

            return {
                success: true,
                query: query
            }
        } else {
            return {
                success: false,
                error: Errors.IN_NOT_AN_ARRAY
            }
        }               
    } else {
        return {
            success: false, 
            error: Errors.MISSING_ORIGINAL_FIELD(field)
        }
    }
}