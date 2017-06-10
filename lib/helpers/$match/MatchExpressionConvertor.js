// Convert expressions into their matching SQL components for projection

var mysql = require("mysql");
var Errors = require("../../Errors");

// Operators to be used
var $in = require("./$in");
var comparison = require("./comparison");

function MatchExpressionConvertor(field, fieldValue, originalField) {
    let query = "";

    if(field[0] == "$") {
        switch(field) {
            case "$in": {
                return $in(field, fieldValue, originalField, true);
            }

            case "$nin": {
                return $in(field, fieldValue, originalField, false);
            }

            case "$lt": {
                return comparison(field, fieldValue, originalField, "<");
            }

            case "$lte": {
                return comparison(field, fieldValue, originalField, "<=");
            }

            case "$gt": {
                return comparison(field, fieldValue, originalField, ">");
            }

            case "$gte": {
                return comparison(field, fieldValue, originalField, ">=");
            }

            case "$eq": {
                return comparison(field, fieldValue, originalField, "=");
            }

            case "$ne": {
                return comparison(field, fieldValue, originalField, "!=");
            }
        }
    } else {
        switch(typeof fieldValue) {
            case "string": {            
                query += " " + mysql.escapeId(field) + " = " + mysql.escape(fieldValue);
                break;
            }

            case "object": {
                let keys = Object.keys(fieldValue);

                for(let i = 0; i < keys.length; i++) {
                    let result = MatchExpressionConvertor(keys[i], fieldValue[keys[i]], field);
                    if(result.success === true) {
                        query += result.query;
                    } else {
                        return result; // Propogate the error upwards
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
