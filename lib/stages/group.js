var mysql = require("mysql");
var Errors = require("../Errors");
var ExpressionConvertor = require("../helpers/$group/ExpressionConvertor");

module.exports = function($group, resource, options = {}) {
    if(Object.keys($group).length != 0) {
        let query = '';

        // Iterate over all the keys after removing the _id field
        let keys = Object.keys($group);
        if(keys.indexOf("_id") > -1) {
            keys.splice(keys.indexOf("_id"), 1);
        }

        if(keys.length > 0) {
            for(let i = 0; i < keys.length; i++) {
                let field = keys[i];
                let fieldValue = $group[field];

                let result = ExpressionConvertor(field, fieldValue, {accumulators: true});
                if(!result.success) {
                    return result; // An error occurred so bubble it up
                } else {
                    query += result.query;
                }
            }

            // Remove the last comma
            if(query[query.length - 1] == ",") {
                query = query.slice(0, -1);
            }
        }

        // Add the table name
        if(!(options && options.headless && options.headless === true)) {
            if(options.tableCounter && options.tableCounter != 0) {
                query += " FROM " + resource;
            } else {
                query += " FROM " + mysql.escapeId(resource);
            }
        }

        // Lets add the grouping (if any)
        if($group['_id'] !== undefined && $group['_id'] != "") {
            let _id = "";

            if($group['_id'][0] == "$") {
                _id = mysql.escapeId($group['_id'].slice(1));
            } else {
                _id = mysql.escape($group['_id']);
            }

            if(keys.length > 0) {
                query = "," + query;
            }

            query = "SELECT " + _id + " as " + mysql.escapeId("_id") + query + " GROUP BY " + _id;
        } else {
            query = "SELECT" + query;
        }

        return {
            success: true,
            query: query
        };
    } else {
        return {
            success: false,
            error: Errors.EMPTY_GROUPING
        };
    }
}
