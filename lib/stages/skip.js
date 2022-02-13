var mysql = require("mysql");
var Errors = require("../Errors");

function addSkip($skip, resource, options) {
    const offset = parseInt($skip);

    if (offset < 0 || offset == Infinity || isNaN(offset)) {
        return {
            success: false,
            error: Errors.INVALID_SKIP,
        };
    } else {
        let query = `OFFSET ${offset}`;

        if (options.tableCounter && options.tableCounter != 0) {
            query = `${resource} ${query}`;
        } else if(options.headless === true) {
            query = `${query}`;
        } else {
            query = `${mysql.escapeId(resource)} ${query}`;
        }
        return {
            success: true,
            query: query,
        }
    }
}

module.exports = function ($skip, resource, options = {}) {
    if (typeof $skip !== undefined) {
        if (typeof $skip == "number") {
            return addSkip($skip, resource, options);
        } else {
            return {
                success: false,
                error: Errors.INVALID_SKIP,
            };
        }
    } else {
        return {
            success: false,
            error: Errors.EMPTY_SKIP,
        };
    }
}

