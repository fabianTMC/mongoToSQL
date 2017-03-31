var Errors = {
    MISSING_ID: "Missing _id field",
    INVALID_FIELD: function(field) {
        return "`" + field + "` is not present in the given fields list"
    },
    UNSUPPORTED_ACCUMULATOR: function(acc) {
        return "Unsuported accumulator in `" + JSON.stringify(acc) + "`"
    },
    UNSUPPORTED_ACCUMULATOR_EXPRESSION: function(acc) {
        return "Unsuported accumulator expression in `" + JSON.stringify(acc) + "`"
    }
}

function convertAccumulators(allFields, key, obj) {
    if(obj['$sum']) {
        // Check if we have one field or multiple or if we have to run a count
        switch(typeof obj['$sum']) {
            case "number": {
                let query = "COUNT(*)";
                if(obj['$sum'] > 1) {
                    query += " * " + obj['$sum']
                }

                return {
                    success: true,
                    query: query
                };
            }

            case "string": {
                // Check if the string is a valid field
                if(obj['$sum'][0] == "$" && allFields.indexOf(obj['$sum'].slice(1)) != -1) {
                    return {
                        success: true,
                        query: "COUNT(" + obj['$sum'].slice(1) + ")"
                    };
                } else {
                    return {
                        success: false,
                        error: Errors.INVALID_FIELD(obj['$sum'])
                    };
                }
            }

            default: {
                return {
                    success: false,
                    error: Errors.UNSUPPORTED_ACCUMULATOR_EXPRESSION(obj)
                }
            }
        }
    } else {
        // Unsupported accumulator
        return {
            success: false,
            error: Errors.UNSUPPORTED_ACCUMULATOR(obj)
        }
    }
}

function convert(resource, fields, stage) {
    // Create the aggregation query
    let query = "";

    if(stage['$group']) {
        if(stage['$group']['_id'] !== undefined) {
            query += 'SELECT';

            // Iterate over all the keys after removing the _id field
            let keys = Object.keys(stage['$group']);
            keys.splice(keys.indexOf("_id"), 1);

            if(keys.length > 0) {
                for(let i = 0; i < keys.length; i++) {
                    let field = keys[i];
                    let fieldValue = stage['$group'][field];

                    switch(typeof fieldValue) {
                        case "string": {
                            // Check if the fieldValue is a valid key
                            if(fieldValue[0] == "$" && fields.indexOf(fieldValue.slice(1)) != -1) {
                                query += " " + fieldValue.slice(1) + " as " + field + ',';
                            } else {
                                query += " '" + fieldValue + "' as " + field + ',';
                            }
                            break;
                        }

                        case "object": {
                            let result = convertAccumulators(fields, field, fieldValue);
                            if(result.success) {
                                query += " " + result.query + " as " + field + ',';
                            } else {
                                return result;
                            }
                        }
                    }
                }

                // Remove the last comma
                query = query.slice(0, -1);
            } else {
                query += "*";
            }

            // Add the table name
            query += " FROM " + resource;

            // Lets add the grouping (if any)
            if(stage['$group']['_id'] != "") {
                query += " GROUP BY " + stage['$group']['_id'];
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
    }
}

function convert2(resource, fields, pipeline) {
    let lastResource = resource;
    let lastQuery = "";

    for(let i = 0; i < pipeline.length; i++) {
        lastQuery = convert(lastResource, fields, pipeline[i]);

        // Check if anything went wrong
        if(lastQuery.success) {
            // Check if this is the last stage in the pipeline
            if((i + 1) != pipeline.length) {
                lastResource = "(" + lastQuery.query +") t" + i;
            } else {
                lastResource = lastQuery.query;
            }
        } else {
            return lastQuery.error;
        }
    }
    return lastResource;
}

module.exports = {
    convert: convert2,
    Errors: Errors
}
