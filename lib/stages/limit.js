var mysql = require("mysql");
var Errors = require("../Errors");

module.exports = function ($limit, resource, options = {}) {
    if (typeof $limit !== undefined) {
        if (typeof $limit == "number") {
            const limit = parseInt($limit);

            if(limit < 0 || limit == Infinity || isNaN(limit)) {
                return {
                    success: false,
                    error: Errors.INVALID_LIMIT,
                };
            } else {
                let query = `LIMIT ${limit}`;

                if(options.tableCounter && options.tableCounter != 0) {
                    query = `${resource} ${query}`;
                } else {
                    query = `${mysql.escapeId(resource)} ${query}`;
                }
                return {
                    success: true,
                    query: query,
                }
            }
        } else {
            return {
                success: false,
                error: Errors.INVALID_LIMIT,
            };
        }
    } else {
        return {
            success: false,
            error: Errors.EMPTY_LIMIT,
        };
    }
}

