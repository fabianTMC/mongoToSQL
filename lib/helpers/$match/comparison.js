// REF: https://docs.mongodb.com/manual/reference/operator/query-comparison/#query-selectors-comparison
// NOTE: Does not match array values or strong values as of now

var mysql = require("mysql");
var moment = require("moment");

var Errors = require("../../Errors");

module.exports = function (field, fieldValue, originalField, comparisonType, stages, options) {
    let query = "";
    const validComparisonTypes = ["<", ">", "<=", ">=", "=", "!="];
    const booleanComparisons = {
        "=": "IS",
        "!=": "IS NOT"
    };
    const dateFormats = {
        "DATE": "YYYY-MM-DD",
        "DATETIME": "YYYY-MM-DD HH:mm:ss",
        "TIME": "HH:mm:ss",
    };
    const validDateTimeOperations = ["subtract", "add"];

    if (typeof originalField !== undefined) {
        if (validComparisonTypes.indexOf(comparisonType) != -1) {
            if (typeof fieldValue === "number" || typeof fieldValue === "string") {
                query += " " + mysql.escapeId(originalField) + " " + comparisonType + " " + mysql.escape(fieldValue);

                return {
                    success: true,
                    query: query
                }
            } else if(typeof fieldValue === "boolean" && booleanComparisons[comparisonType]) {
                query += " " + mysql.escapeId(originalField) + " " + booleanComparisons[comparisonType] + " " + mysql.escape(fieldValue);

                return {
                    success: true,
                    query: query
                }
            } else if(typeof fieldValue === "object" && !Array.isArray(fieldValue)) {
                let date;

                if(fieldValue.value !== undefined) {
                    date = moment(fieldValue.value);

                    if(!date.isValid()) {
                        return {
                            success: false,
                            error: Errors.INVALID_DATE_OR_TIME
                        }
                    }
                } else {
                    date = moment();
                }

                if(Object.keys(dateFormats).includes(fieldValue.type)) {
                    if(typeof fieldValue.operation === "string" && validDateTimeOperations.includes(fieldValue.operation)) {
                        if(Array.isArray(fieldValue.units) && fieldValue.units.length > 0) {
                            date = fieldValue.units.reduce((acc, quantity) => {
                                if(typeof quantity.number === "number" && typeof quantity.type === "string") {
                                    return acc[fieldValue.operation](quantity.number, quantity.type);
                                } else {
                                    return acc;
                                }
                            }, date);

                            date = date.format(dateFormats[fieldValue.type]);

                            query += " " + mysql.escapeId(originalField) + " " + comparisonType + " " + mysql.escape(date);

                            return {
                                success: true,
                                query: query
                            }
                        } else {
                            return {
                                success: false,
                                error: Errors.NOT_A_VALID_DATE_MATH_FORMAT
                            }
                        }
                    } else {
                        return {
                            success: false,
                            error: Errors.NOT_A_VALID_DATE_MATH_FORMAT
                        }
                    }
                } else {
                    return {
                        success: false,
                        error: Errors.NOT_A_VALID_DATE_MATH_FORMAT
                    }
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