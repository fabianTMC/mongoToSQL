var mysql = require("mysql");
var Errors = require("../../Errors");
var ExpressionConvertor = require("../$group/ExpressionConvertor");

function ProjectExpressionConvertor(field, fieldValue, stages, resource, options) {
    let query = "";

    let operators = Object.keys(fieldValue);

    operators.forEach((operator) => {
        switch(operator) {
            case "$concat": {
                if(Array.isArray(fieldValue["$concat"])) {
                    let convertedFields = fieldValue["$concat"].reduce((acc, item) => {
                        let result = ExpressionConvertor(field, item, {aliasing: false, escape: false});
                        if(!result.success) {
                            throw result; // An error occurred so bubble it up
                        } else {
                            return acc + result.query;
                        }
                    }, "");

                    // Remove the trailing comma
                    if(convertedFields[convertedFields.length - 1] == ",") {
                        convertedFields = convertedFields.slice(0, -1).trim();
                    }

                    query += ` CONCAT(${convertedFields}) as ` + mysql.escapeId(field) + ",";
                } else {
                    throw new Error(Errors.CONCAT_NOT_AN_ARRAY);
                }

                break;
            }

            case "$toLower": {
                let result = ExpressionConvertor(field, fieldValue["$toLower"], {aliasing: false, escape: false});
                if(!result.success) {
                    throw result; // An error occurred so bubble it up
                } else {
                    // Remove the trailing comma
                    if(result.query[result.query.length - 1] == ",") {
                        result.query = result.query.slice(0, -1).trim();
                    }

                    query += ` LOWER(${result.query}) as ` + mysql.escapeId(field) + ",";
                }
                break;
            }

            case "$toUpper": {
                let result = ExpressionConvertor(field, fieldValue["$toUpper"], {aliasing: false, escape: false});
                if(!result.success) {
                    throw result; // An error occurred so bubble it up
                } else {
                    // Remove the trailing comma
                    if(result.query[result.query.length - 1] == ",") {
                        result.query = result.query.slice(0, -1).trim();
                    }

                    query += ` UPPER(${result.query}) as ` + mysql.escapeId(field) + ",";
                }
                break;
            }

            case "$query": {
                let result = stages.$query(fieldValue["$query"], resource, options);

                if(!result.success) {
                    throw result; // An error occurred so bubble it up
                } else {
                    query = ` ${result.query} as ` + mysql.escapeId(field) + ",";
                }
                
                break;
            }
        }
    });

    return {
        success: true,
        query: query
    };
}

module.exports = ProjectExpressionConvertor;
