var mysql = require("mysql");
var Errors = require("../Errors");
var JoinGenerator = require("../helpers/$join/JoinGenerator");

function hasRequireFields($join) {
    let fieldCounter;
    let requiredFields = ["on"];

    for(fieldCounter = 0; fieldCounter < requiredFields.length; fieldCounter++) {
        if($join[requiredFields[fieldCounter]] == undefined) {
            break;
        }
    }

    return fieldCounter == requiredFields.length;
}

function validateFields(fields) {
    return fields.reduce((validated, field) => {
        if(!validated) return validated;

        if(field == undefined || field == null) {
            return false;
        }

        return true;
    }, true);
}

module.exports = function($join, resource, options = {}) {
    if(!hasRequireFields($join) || $join.on.length == 0) {
        return {
            success: false,
            error: Errors.MISSING_FIELDS("$join")
        };
    }

    const parts = $join.on.reduce((currentJoinResult, join) => {
        try {
            if(validateFields([join.from.field, join.to.table, join.to.field]) && (join.from.previousTable == true || typeof join.from.table == "string")) {
                let from;

                // This is for when there was some previous resource name provided 
                // most likely from the pipeline
                if(join.from.previousTable === true) {
                    if(options.tableCounter == 0) {
                        from = resource;

                        if(options.headless === true) {
                            currentJoinResult.tables = mysql.escapeId(currentJoinResult.tables);
                        }
                    } else {
                        from = "t" + (options.tableCounter - 1); // This is escaped later
                    }
                } else {
                    // This is for when the $join is invoked directly which is why options.tableCounter is not provided
                    // Both are from.table because this was designed to retrofit with the $lookup library which is now split to JoinGenerator

                    // RegExp(/^\p{L}/,'u').test(str) checks if the string starts with a unicode letter
                    // Reference: https://stackoverflow.com/a/62032796
                    // This will escape any unescaped table name (which usually does not start with a ` or a bracket or an escape character)
                    if(currentJoinResult.tables == undefined || RegExp(/^\p{L}/,'u').test(currentJoinResult.tables[0])) {
                        currentJoinResult.tables = mysql.escapeId(join.from.table);
                    }

                    from = join.from.table;
                }

                const thisJoin = JoinGenerator({
                    joinType: join.joinType,
        
                    on: from,
                    localField: join.from.field,
                    
                    from: join.to.table,
                    foreignField: join.to.field,
                }, undefined, currentJoinResult.tables, currentJoinResult.joinCondition, true);
                
                return thisJoin;
            } else {
                return {
                    success: false,
                    error: Errors.MISSING_FIELDS("$join")
                };
            }
        } catch(err) {
            return {
                success: false,
                error: Errors.MISSING_FIELDS("$join")
            };
        }
    }, {
        tables: resource,
        joinCondition: "",
        success: true,
    });

    if(parts.success === true) {
        let selection = "SELECT";
        if($join.as == undefined || $join.as == null) {
            selection += " * ";
        } else {
            const tableMappings = Object.keys($join.as);

            if(tableMappings.length == 0) {
                selection += " * ";
            } else {
                selection = tableMappings.reduce((currentSelectionResult, tableName) => {
                    const fieldMapping = $join.as[tableName];
                    const fields = Object.keys(fieldMapping);
    
                    fields.forEach((originalFieldName) => {
                        currentSelectionResult += " " + mysql.escapeId(tableName) + "." + mysql.escapeId(originalFieldName) + " as " + mysql.escapeId(fieldMapping[originalFieldName]) + ",";
                    });
    
                    return currentSelectionResult;
                }, selection);
            }
        }

        if(selection[selection.length - 1] == ",") {
            selection = selection.slice(0, -1);
        }

        return {
            success: true,
            query: selection.trim() + " FROM " + parts.tables.trim(),
        }
    } else {
        return parts;
    }
}

