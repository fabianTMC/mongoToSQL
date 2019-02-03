// Convert expressions into their matching SQL components for projection

var mysql = require("mysql");
var Errors = require("../../Errors");

// Operators to be used
var $in = require("./$in");
var comparison = require("./comparison");

// Function to handle $or and $and and their nested conditions
function logical(field, fieldValue, originalField, useAnd = false) {
    let query = "";
    let type = (useAnd === true) ? "AND" : "OR";

    if(Array.isArray(fieldValue) && fieldValue.length > 0) {
        for(let i = 0; i < fieldValue.length; i++) {
            let keys = Object.keys(fieldValue[i]);
            
            for(let j = 0; j < keys.length; j++) {
                let result = MatchExpressionConvertor(keys[j], fieldValue[i][keys[j]]);

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

function MatchExpressionConvertor(field, fieldValue, originalField, stages) {
    let query = "";

    if(field[0] == "$") {
        switch(field) {
            case "$in": {
                return $in(field, fieldValue, originalField, true, stages);
            }

            case "$nin": {
                return $in(field, fieldValue, originalField, false, stages);
            }

            case "$lt": {
                return comparison(field, fieldValue, originalField, "<", stages);
            }

            case "$lte": {
                return comparison(field, fieldValue, originalField, "<=", stages);
            }

            case "$gt": {
                return comparison(field, fieldValue, originalField, ">", stages);
            }

            case "$gte": {
                return comparison(field, fieldValue, originalField, ">=", stages);
            }

            case "$eq": {
                return comparison(field, fieldValue, originalField, "=", stages);
            }

            case "$ne": {
                return comparison(field, fieldValue, originalField, "!=", stages);
            }

            case "$or": {
                return logical(field, fieldValue, originalField, false, stages);
            }

            case "$and": {
                return logical(field, fieldValue, originalField, true, stages);
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

            case "object": {
                if(fieldValue === null) {
                    query += " " + mysql.escapeId(field) + " IS " + mysql.escape(fieldValue);
                } else {
                    let keys = Object.keys(fieldValue);
                    
                    for(let i = 0; i < keys.length; i++) {
                        let result = MatchExpressionConvertor(keys[i], fieldValue[keys[i]], field, stages);
                        if(result.success === true) {
                            query += result.query;
                        } else {
                            return result; // Propogate the error upwards
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
