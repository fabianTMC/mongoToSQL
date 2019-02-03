var mysql = require("mysql");
var Errors = require("../Errors");

module.exports = function($order, resource, options = {}) {
    if(Array.isArray($order) && $order.length > 0) {
        let query = $order.reduce((acc, current, index, array) => {
            if(!Array.isArray(current) && typeof current === "object") {
                for(let key in current) {
                    if(current[key] === 1) {
                        return `${acc} ${mysql.escapeId(key)} ASC,`;
                    } else if(current[key] === -1) {
                        return `${acc} ${mysql.escapeId(key)} DESC,`;
                    } else {
                        array.splice(1);

                        return {
                            success: false,
                            error: Errors.INVALID_ORDER,
                        };
                    }
                }
            } else {
                array.splice(1);

                return {
                    success: false,
                    error: Errors.INVALID_ORDER_OBJECT,
                };
            }
        }, "");

        if(typeof query === "object") {
            return query;
        } else {
            // Remove the last comma
            if(query.substr(query.length - 1) == ",") {
                query = query.slice(0, -1);
            }

            return {
                success: true,
                query: `ORDER BY ${query.trim()}`,
            }
        }
    } else {
        return {
            success: false,
            error: Errors.EMPTY_ORDER
        };
    }
}

