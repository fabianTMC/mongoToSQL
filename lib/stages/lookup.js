var mysql = require("mysql");
var Errors = require("../Errors");
var ExpressionConvertor = require("../helpers/$group/ExpressionConvertor");

module.exports = function($lookup, resource, options = {}) {
    // Check if all the required fields are present
    let fieldCounter;
    let requiredFields = ["from", "localField", "foreignField", "as"];

    for(fieldCounter = 0; fieldCounter < requiredFields.length; fieldCounter++) {
        if($lookup[requiredFields[fieldCounter]] == undefined) {
            break;
        }
    }

    if(fieldCounter == requiredFields.length) {
        let query = "SELECT ";

        for(let key in $lookup['as']) {
            if($lookup.as.hasOwnProperty(key)) {
                let result = ExpressionConvertor(`${$lookup.as[key]}`, `${key}`,
                {
                    inclusion: true, 
                    belongsToTable: $lookup.from
                });
               
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

        query += " FROM " + resource;
        
        // Time to do the right outer join
        query += " LEFT OUTER JOIN " + mysql.escapeId($lookup.from) + " ON ";

        query += mysql.escapeId($lookup.from) + "." + mysql.escapeId($lookup.foreignField) + " = " + "tableName" + "." + mysql.escapeId($lookup.localField); 

        return {
            success: true,
            query: query
        }
    } else {
        return {
            success: false,
            error: Errors.MISSING_FIELDS("$lookup")
        };
    }
}

