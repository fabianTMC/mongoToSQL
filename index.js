var Errors = {
    "MISSING_ID": "Missing _id field"
}

function convert(resource, fields, stage) {
    // Create the aggregation query
    let query = "";

    if(stage['$group']) {
        if(stage['$group']['_id'] !== undefined) {
            query += 'SELECT';

            // Iterate over all the keys
            let keys = Object.keys(stage['$group']);
            keys.splice(keys.indexOf("_id"), 1);
            if(keys.length > 0) {
                for(let i = 0; i < keys.length; i++) {
                    if(fields.indexOf((field = keys[i])) != -1) {
                        query += " " + stage['$group'][field] + " as " + field + ',';
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
