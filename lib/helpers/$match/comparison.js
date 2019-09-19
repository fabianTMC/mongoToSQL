// REF: https://docs.mongodb.com/manual/reference/operator/query-comparison/#query-selectors-comparison
// NOTE: Does not match array values or strong values as of now

var mysql = require("mysql");
var Errors = require("../../Errors");

module.exports = function (field, fieldValue, originalField, comparisonType) {
    let query = "";
    let validComparisonTypes = ["<", ">", "<=", ">=", "=", "!="];

    if (typeof originalField !== undefined) {
        if (validComparisonTypes.indexOf(comparisonType) != -1) {
            if (typeof fieldValue === "number" || typeof fieldValue === "string") {
                query += " " + mysql.escapeId(originalField) + " " + comparisonType + " " + mysql.escape(fieldValue);

                return {
                    success: true,
                    query: query
                }
            } else {
                return {
                    success: false,
                    error: Errors.NOT_A_NUMBER
                }
            }
        } else {
            return {
                success: false,
                error: Errors.INVALID_COMPARISON_TYPE
            }
        }
    } else {
        return {
            success: false,
            error: Errors.MISSING_ORIGINAL_FIELD(field)
        }
    }
}