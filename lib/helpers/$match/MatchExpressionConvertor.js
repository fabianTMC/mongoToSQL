// Convert expressions into their matching SQL components for projection

var mysql = require("mysql");
var Errors = require("../../Errors");

// Operators to be used
var $in = require("./$in");
var comparison = require("./comparison");

// Function to handle $or and $and and their nested conditions
function logical(field, fieldValue, originalField, useAnd = false, stages, options) {
    let query = "";
    let type = (useAnd === true) ? "AND" : "OR";

    if(Array.isArray(fieldValue) && fieldValue.length > 0) {
        for(let i = 0; i < fieldValue.length; i++) {
            let keys = Object.keys(fieldValue[i]);

            for(let j = 0; j < keys.length; j++) {
                let result = MatchExpressionConvertor(keys[j], fieldValue[i][keys[j]], originalField, stages, options);

                if(result.success === true) {
                    query += result.query + " " + type;
                } else {
                    return result;
                    // Propogate the error upwards
                }
            }
        }

        // Remove the last suffix
        if(query.substr(query.length - (type.length + 1)) == " " + type) {
            query = query.slice(0, -(type.length + 1));
        }

        // Wrap the OR/AND in brackets to ensure logical correctness
        query = " (" + query + " )";

        return {
            success: true,
            query: query
        }
    } else {
        return {
            success: false,
            error: Errors.OR_NOT_AN_ARRAY
        }
    }
}

function MatchExpressionConvertor(field, fieldValue, originalField, stages, options) {
    let query = "";

    if(field[0] == "$") {
        switch(field) {
            case "$in": {
                return $in(field, fieldValue, originalField, true, stages, options);
            }

            case "$nin": {
                return $in(field, fieldValue, originalField, false, stages, options);
            }

            case "$lt": {
                return comparison(field, fieldValue, originalField, "<", stages, options);
            }

            case "$lte": {
                return comparison(field, fieldValue, originalField, "<=", stages, options);
            }

            case "$gt": {
                return comparison(field, fieldValue, originalField, ">", stages, options);
            }

            case "$gte": {
                return comparison(field, fieldValue, originalField, ">=", stages, options);
            }

            case "$eq": {
                return comparison(field, fieldValue, originalField, "=", stages, options);
            }

            case "$ne": {
                return comparison(field, fieldValue, originalField, "!=", stages, options);
            }

            case "$or": {
                return logical(field, fieldValue, originalField, false, stages, options);
            }

            case "$and": {
                return logical(field, fieldValue, originalField, true, stages, options);
            }

            case "$search": {
                if (fieldValue == undefined) {
                    return {
                        success: false,
                        error: Errors.EMPTY_SEARCH
                    }
                } else if(typeof fieldValue == "object" && !Array.isArray(fieldValue)) {
                    return {
                        success: false,
                        error: Errors.UNSUPPORTED_SEARCH_VALUE(fieldValue)
                    }
                } else if(options.caseSensitive === false) {
                    query = " LOWER(" + mysql.escapeId(originalField) + ") LIKE LOWER(" + mysql.escape(`%${fieldValue}%`) + ")";
                } else {
                    query = " " + mysql.escapeId(originalField) + " LIKE " + mysql.escape(`%${fieldValue}%`);
                }

                break;
            }

            case "$query": {
                let result = stages.$query(fieldValue, fieldValue.resource);

                if(!result.success) {
                    throw result; // An error occurred so bubble it up
                } else {
                    query = ` ${result.query} as ` + mysql.escapeId(field) + ",";
                }

                break;
            }

            default: {
                return {
                    success: false,
                    error: Errors.UNSUPPORTED_MATCH_OPERATOR(field)
                }
            }
        }
    } else if(typeof fieldValue == "string" && fieldValue[0] == "#" && options.previousResource !== undefined && options.previousResource != "") {
        query += " " + mysql.escapeId(field) + " = " + mysql.escapeId(options.previousResource) + "." + mysql.escapeId(fieldValue.substr(1));
    } else {
        switch(typeof fieldValue) {
            case "string": {
                query += " " + mysql.escapeId(field) + " = " + mysql.escape(fieldValue);
                break;
            }

            case "boolean": {
                query += " " + mysql.escapeId(field) + " IS " + mysql.escape(fieldValue);
                break;
            }

            case "undefined":
            case "object": {
                if(Array.isArray(fieldValue)) {
                    query += " " + "JSON_CONTAINS(" + mysql.escapeId(field) + ", '" + JSON.stringify(fieldValue) + "') = 1";
                } else {
                    if(fieldValue === null || fieldValue === undefined) {
                        query += " " + mysql.escapeId(field) + " IS " + mysql.escape(fieldValue);
                    } else {
                        let keys = Object.keys(fieldValue);

                        for(let i = 0; i < keys.length; i++) {
                            let result = MatchExpressionConvertor(keys[i], fieldValue[keys[i]], field, stages, options);
                            if(result.success === true) {
                                query += result.query;
                            } else {
                                return result; // Propogate the error upwards
                            }
                        }
                    }
                }

                break;
            }

            case "number": {
                query += " " + mysql.escapeId(field) + " = " + mysql.escape(fieldValue);
                break;
            }
        }
    }

    return {
        success: true,
        query: query
    };
}

module.exports = MatchExpressionConvertor;
