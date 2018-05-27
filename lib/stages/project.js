var mysql = require("mysql");
var Errors = require("../Errors");
var ExpressionConvertor = require("../helpers/$group/ExpressionConvertor");
var ProjectExpressionConvertor = require("../helpers/$project/ProjectExpressionConvertor");

module.exports = function($project, resource, options = {}) {
    let defaultOptions = {headless: false};
    options = {...defaultOptions, ...options};
   
    let query = 'SELECT';

    var keysInStage = Object.keys($project);
    let hasInclusion = false;
    let hasExclusion = false;

    if(keysInStage.length > 0) {
        for(let i = 0; i < keysInStage.length; i++) {
            let field = keysInStage[i];
            let fieldValue = $project[keysInStage[i]];

            if(fieldValue === 1) {
                hasInclusion = true;
            } else if(fieldValue === 0) {
                hasExclusion = true;
            }

            if(hasInclusion && hasExclusion) {
                return {
                    success: false,
                    error: Errors.INCLUSION_AND_EXCLUSION
                }
            } else {
                let result = ExpressionConvertor(field, fieldValue, {inclusion: true});
                if(!result.success) {
                    return result; // An error occurred so bubble it up
                } else {
                    query += result.query;
                }

                // Handle projection operators
                if(typeof fieldValue == "object") {
                    result = ProjectExpressionConvertor(field, fieldValue);
                    if(!result.success) {
                        return result; // An error occurred so bubble it up
                    } else {
                        query += result.query;
                    }
                }
            }
        }

        // Remove the last comma
        if(query[query.length - 1] == ",") {
            query = query.slice(0, -1);
        }
    } else {
        return {
            success: false,
            error: Errors.EMPTY_PROJECTION
        }
    }

    if(!(options && options.headless && options.headless === true)) {
        // Add the table name
        if(options.tableCounter && options.tableCounter != 0) {
            query += " FROM " + resource;
        } else {
            query += " FROM " + mysql.escapeId(resource);
        }
    }

    return {
        success: true,
        query: query
    };
}
