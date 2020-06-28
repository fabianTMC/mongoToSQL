var mysql = require("mysql");
var Errors = require("../Errors");
var ExpressionConvertor = require("../helpers/$group/ExpressionConvertor");

var JoinGenerator = require("../helpers/$join/JoinGenerator");

function asGenerator($lookup, tableName, query) {
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

    return {
        query,
        success: true,
    };
}

function hasRequireFields($lookup) {
    let fieldCounter;
    let requiredFields = ["from", "localField", "foreignField", "as"];

    for(fieldCounter = 0; fieldCounter < requiredFields.length; fieldCounter++) {
        if($lookup[requiredFields[fieldCounter]] == undefined) {
            break;
        }
    }

    return fieldCounter == requiredFields.length;
}

module.exports = function($lookup, resource, options = {}) {
    try {
        if(!Array.isArray($lookup)) {
            $lookup = [$lookup];
        }

        let tables = "";

        if(options.tableCounter && options.tableCounter > 0) {
            tables += " FROM " + resource;
        } else {
            tables += " FROM " + mysql.escapeId(resource);
        }

        const parts = $lookup.reduce((currentLookupResult, thisLookup) => {
            let tableName = resource;

            let selection = "";
            let tables = "";
            let joinCondition = "";

            // Bubble up any errors
            if(currentLookupResult.success === false) {
                return currentLookupResult;
            } else {
                selection = currentLookupResult.selection;
                tables = currentLookupResult.tables;
                joinCondition = currentLookupResult.joinCondition;
            }

            if(!hasRequireFields(thisLookup)) {
                return {
                    success: false,
                    error: Errors.MISSING_FIELDS("$lookup")
                };
            }

            if(typeof resource == "string" && resource.length > 0) {
                if(options && options.tableCounter) {
                    tableName = "t" + (options.tableCounter - 1);
                }
            } else {
                return {
                    success: false,
                    error: Errors.MISSING_RESOURCE_NAME
                }
            }

            if(!Array.isArray(thisLookup.as) && Object.keys(thisLookup.as).length > 0) {
                const asResult = asGenerator(thisLookup, tableName, selection);
                if(asResult.success !== true) {
                    return asResult;
                } else {
                    selection = asResult.query;
                }

                // Because we are supporting inner joins on multiple tables at once using the $lookup: Array
                // syntax, we need to explicitly set the inner join type if the join type is not specified
                if($lookup.length > 1) {
                    thisLookup.joinType = thisLookup.joinType || "inner";
                }

                const joinResult = JoinGenerator(thisLookup, tableName, tables, joinCondition);
                if(joinResult.success !== true) {
                    return joinResult;
                } else {
                    tables = joinResult.tables;
                    joinCondition = joinResult.joinCondition;
                }
        
                return {
                    success: true,
                    selection,
                    tables,
                    joinCondition,
                }
            } else {
                return {
                    success: false,
                    error: Errors.INVALID_$AS
                }
            }
        }, {
            selection: "SELECT", // + mysql.escapeId(tableName + ".*") + ", ",
            tables,
            joinCondition: "",
            success: true,
        });

        if(parts.success === true) {
            // Remove the last comma
            if(parts.selection[parts.selection.length - 1] == ",") {
                parts.selection = parts.selection.slice(0, -1);
            }

            return {
                success: true,
                query: parts.selection.trim() + " " + parts.tables.trim() + " ON " + parts.joinCondition.trim(),
            }
        } else {
            return parts;
        }
    } catch(e) {
        return {
            success: false,
            error: Errors.INVALID_$AS
        }
    }
}

