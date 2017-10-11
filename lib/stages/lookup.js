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
        if(typeof resource == "string" && resource.length > 0) {
            let tableName = resource;
            
            if(options && options.tableCounter) {
                tableName = "t" + (options.tableCounter - 1);
            }
    
            try {
                if(!Array.isArray($lookup.as) && Object.keys($lookup.as).length > 0) {
                    let query = "SELECT"; // + mysql.escapeId(tableName + ".*") + ", "
                    
                    for(let key in $lookup['as']) {
                        if($lookup.as.hasOwnProperty(key)) {
                            let result = ExpressionConvertor(key, $lookup.as[key],
                            {
                                inclusion: true, 
                                inclusionTable: tableName,
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
            
                    if(options.tableCounter && options.tableCounter > 0) {
                        query += " FROM " + resource;
                    } else {
                        query += " FROM " + mysql.escapeId(resource);
                    }
                    
                    // Time to do the right outer join
                    query += " LEFT OUTER JOIN " + mysql.escapeId($lookup.from) + " ON ";
            
                    query += mysql.escapeId($lookup.from) + "." + mysql.escapeId($lookup.foreignField) + " = " + mysql.escapeId(tableName) + "." + mysql.escapeId($lookup.localField); 
            
                    return {
                        success: true,
                        query: query
                    }
                } else {
                    return {
                        success: false, 
                        error: Errors.INVALID_$AS
                    }
                }
            } catch(e) {
                return {
                    success: false, 
                    error: Errors.INVALID_$AS
                }
            }
        } else {
            return {
                success: false, 
                error: Errors.MISSING_RESOURCE_NAME
            }
        }
    } else {
        return {
            success: false,
            error: Errors.MISSING_FIELDS("$lookup")
        };
    }
}

