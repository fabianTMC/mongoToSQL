var mysql = require("mysql");
var Errors = require("../../Errors");

module.exports = function joinGenerator($lookup, tableName, tables, joinCondition) {
    let join = "LEFT OUTER JOIN";

    if($lookup.joinType && typeof $lookup.joinType === "string") {
        switch($lookup.joinType.toLowerCase()) {
            case "left": {
                join = "LEFT OUTER JOIN";
                break;
            }

            case "right": {
                join = "RIGHT OUTER JOIN";
                break;
            }

            case "inner": {
                join = "INNER JOIN";
                break;
            }

            default: {
                return {
                    success: false,
                    error: Errors.INVALID_JOIN_TYPE($lookup.joinType)
                }
            }
        }
    }
    
    tables += ` ${join} ` + mysql.escapeId($lookup.from);

    if(joinCondition.length > 0) {
        joinCondition += " AND ";
    }
    
    joinCondition +=  mysql.escapeId($lookup.from) + "." + mysql.escapeId($lookup.foreignField) + " = " + mysql.escapeId($lookup.on || tableName) + "." + mysql.escapeId($lookup.localField);

    return {
        tables: tables,
        joinCondition: joinCondition,
        success: true,
    }
}