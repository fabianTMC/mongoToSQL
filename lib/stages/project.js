var Errors = require("../Errors");
var ExpressionConvertor = require("../helpers/ExpressionConvertor");

module.exports = function($project, resource, fields) {
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
                let result = ExpressionConvertor(field, fieldValue, fields, {inclusion: true});
                if(!result.success) {
                    return result; // An error occurred so bubble it up
                } else {
                    query += result.query;
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

    // Add the table name
    query += " FROM " + resource;

    return {
        success: true,
        query: query
    };
}
