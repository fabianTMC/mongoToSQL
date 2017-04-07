var Errors = require("../Errors");
var ExpressionConvertor = require("../helpers/ExpressionConvertor");

module.exports = function($group, resource, fields) {
    if(Object.keys($group).length != 0) {
        if($group['_id'] !== undefined) {
            let query = 'SELECT';

            // Iterate over all the keys after removing the _id field
            let keys = Object.keys($group);
            keys.splice(keys.indexOf("_id"), 1);

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
            } else {
                query += " *";
            }

            // Add the table name
            query += " FROM " + resource;

            // Lets add the grouping (if any)
            if($group['_id'] != "") {
                if($group['_id'][0] == "$") {
                    query += " GROUP BY " + $group['_id'].slice(1);
                } else {
                    query += " GROUP BY '" + $group['_id'] + "'";
                }
            }

            return {
                success: true,
                query: query
            };
        } else {
            return {
                success: false,
                error: Errors.MISSING_ID
            };
        }
    } else {
        return {
            success: false,
            error: Errors.EMPTY_GROUPING
        };
    }
}
