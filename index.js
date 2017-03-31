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

            return query;
        } else {
            return "Missing _id field";
        }
    }
}

function convert2(resource, fields, pipeline) {
    let lastResource = resource;
    let lastQuery = "";

    if(pipeline.length > 1) {
        for(let i = 0; i < pipeline.length; i++) {
            lastQuery = convert(lastResource, fields, pipeline[i]);

            // Check if this is the last stage in the pipeline
            if((i + 1) != pipeline.length) {
                lastResource = "(" + lastQuery +") t" + i;
            } else {
                lastResource = lastQuery;
            }
        }
    } else {
        return convert(lastResource, fields, pipeline[0]);
    }

    return lastResource;
}

module.exports = {
    convert: convert2
}
