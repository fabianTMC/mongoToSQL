var mysql = require("mysql");
var Errors = require("../Errors");

var skip = require("./skip");

function addLimit($limit, resource, options) {
    const limit = parseInt($limit);
    
    if (limit < 0 || limit == Infinity || isNaN(limit)) {
        return {
            success: false,
            error: Errors.INVALID_LIMIT,
        };
    } else {
        let query = `LIMIT ${limit}`;
        
        if(options.headless === true) {
            query = `${query}`;
        } else if (options.tableCounter && options.tableCounter != 0) {
            query = `${resource} ${query}`;
        } else {
            query = `${mysql.escapeId(resource)} ${query}`;
        }

        return {
            success: true,
            query: query,
        }
    }
}

module.exports = function ($limit, resource, options = {}) {
    if (typeof $limit !== undefined) {
        if (typeof $limit == "number") {
            return addLimit($limit, resource, options);
        } 

        else if(typeof $limit === "object") {
            let returnObject;
            let headlessSkip = false;

            if($limit.hasOwnProperty("limit")) {
                returnObject = addLimit($limit.limit, resource, options);
                headlessSkip = true;
            }

            // Check if everything was okay
            if(returnObject !== undefined && returnObject.success === false) {
                return returnObject;
            }
            
            if($limit.hasOwnProperty("skip")) {
                // We are skipping the resource here because we just want to append
                // the offset here but only if it's headless
                let skipResource = headlessSkip ? "" : resource;

                let skipObject = skip($limit.skip, skipResource, {
                    ...options,
                    headless: headlessSkip,
                });
                
                if(returnObject !== undefined) {
                    if(skipObject.success === true) {
                        return {
                            success: true,
                            query: `${returnObject.query} ${skipObject.query}`
                        }
                    } else {
                        return skipObject;
                    }
                } else {
                    returnObject = skipObject;
                }
            }
            
            // Check if everything was okay
            if(returnObject !== undefined) {
                return returnObject;
            }
            
            else {
                return {
                    success: false,
                    error: Errors.INVALID_LIMIT,
                };
            }
        }
        
        else {
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

