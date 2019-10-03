var mysql = require("mysql");

var Errors = require("./Errors");

var $group = require("./stages/group");
var $project = require("./stages/project");
var $match = require("./stages/match");
var $lookup = require("./stages/lookup");
var $order = require("./stages/order");


function QueryBuilder(resource, stage, options) {
    options.stages = {
        $group,
        $project, 
        $match,
        $lookup,
        $union,
        $query,
        $order,
        convert,
    };

    if (stage['$group']) {
        if(options.nextStage !== null && options.nextStage["$match"]) {
            options["headless"] = true;
        }

        return $group(stage['$group'], resource, options);
    }

    else if (stage['$project']) {
        if (options.previousStage != undefined && options.previousStage !== null && options.previousStage["$match"]) {
            options['headless'] = true;
        }

        return $project(stage['$project'], resource, options);
    }

    else if (stage['$match']) {
        if (options.nextStage != undefined && options.nextStage !== null && options.nextStage["$project"]) {
            options['headless'] = true;
        }

        if (options.previousStage != undefined && options.previousStage !== null && options.previousStage["$group"]) {
            options['headless'] = true;
        }

        return $match(stage['$match'], resource, options);
    }

    else if (stage['$lookup']) {
        return $lookup(stage['$lookup'], resource, options);
    }

    else if(stage['$union']) {
        return $union(stage['$union'], resource, options);
    }

    else if(stage['$query']) {
        return $query(stage['$query'], resource, options);
    }

    else if(stage['$order']) {
        return $order(stage['$order'], resource, options);
    }
}

function convert(resource, pipeline, options) {
    try {
        let resources = [];

        const wrapInDerivedTable = (query, counter) => `(${query}) t${counter}`;

        let queries = pipeline.reduce((acc, currentStage, index, arr) => {

            /*
            * Escape the first identifier because only the $match>$project optimization will be using it
            * and it will not get escaped if that pattern is the first two stages
            */
            resources.push((index == 0) ? mysql.escapeId(acc) : acc);

            let previousStage = (index > 0) ? pipeline[index - 1] : null;
            let nextStage = (index + 1 != pipeline.length) ? pipeline[index + 1] : null;

            let currentQuery = QueryBuilder(acc, currentStage, {
                tableCounter: index,
                nextStage: nextStage,
                previousStage: previousStage,

                // This option comes from $query
                previousResource: (options && options.previousResource),
            });

            /*
            * The following optimzations skip additional queries if there are subsequent stages of:
            * $project
            * $match
            * $order
            * 
            * NOTE: Order of computation of these optimizations matter
            */
            if (currentQuery.success) {
                let modifiedQuery = currentQuery.query;
                let wrappedInDerivedTable = false;

                if(nextStage !== null && nextStage["$project"] && currentStage["$match"]) {
                    modifiedQuery = currentQuery.query;
                } 

                else if(nextStage !== null && nextStage["$match"] && currentStage["$group"]) {
                    modifiedQuery = currentQuery.query;
                } 

                else if(previousStage !== null && previousStage["$group"] && currentStage["$match"]) {
                    modifiedQuery = acc + " FROM " + resources[index - 1] + " " + currentQuery.query;
                } 
                
                else if(previousStage !== null && previousStage["$match"] && currentStage["$project"]) {
                    modifiedQuery = currentQuery.query + " FROM " + resources[index - 1] + " " + acc;
                } 

                else if(currentStage["$order"] && nextStage === null) {
                    if(previousStage["$match"] || previousStage["$project"]) {
                        modifiedQuery = `${acc} ${currentQuery.query}`;
                    } else {
                        modifiedQuery = `SELECT * FROM ${acc} ${currentQuery.query}`;
                    }
                } 
                
                else if(nextStage !== null) {
                    if(currentStage["$order"]) {
                        modifiedQuery = wrapInDerivedTable(`${acc} ${currentQuery.query}`, index);
                        wrappedInDerivedTable = true;
                    } else {
                        modifiedQuery = wrapInDerivedTable(currentQuery.query, index);
                        wrappedInDerivedTable = true;
                    }
                } 
                
                else {
                    modifiedQuery = currentQuery.query;
                }

                if(!wrappedInDerivedTable) {
                    if(nextStage && !nextStage["$order"] && !nextStage["$project"] && !nextStage["$match"]) {
                        modifiedQuery = wrapInDerivedTable(modifiedQuery, index);
                        wrappedInDerivedTable = true;
                    }
                }

                return modifiedQuery;
            } else {
                arr.splice(1);

                return {
                    success: false,
                    error: currentQuery.error
                }
            }
        }, resource);

        return queries;
    } catch (error) {
        return error;
    }
}

/* This stage is placed here as it will not work otherwise due to the failure to load modules that have a circular dependency */
function $query(query, resource, options = {}) {
    if(Array.isArray(query.pipeline) && query.pipeline.length > 0) {

        let currentResource = resource;
        if(typeof query.resource === "string" && query.resource.length > 0) {
            options["previousResource"] = currentResource;
            currentResource = query.resource;
        }

        const queryResult = convert(currentResource, query.pipeline, options);

        // Modify the query to be a subquery
        if(typeof queryResult === "object") {
            queryResult.query = `(${queryResult.query})`;
            return queryResult;
        } else {
            return {
                success: true,
                query: `(${queryResult.trim()})`,
            }
        }
    } else {
        return {
            success: false,
            error: Errors.EMPTY_QUERY_PIPELINE
        };
    }
}

function $union(union, resource) {
    if(union.pipelines && Array.isArray(union.pipelines) && union.pipelines.length > 0) {
        const unionType = (typeof union.type === "string" && union.type.toLowerCase() === "all") ? "UNION ALL" : "UNION";

        const unionResult = union.pipelines.reduce((acc, currentPipeline, index, array) => {
            if(currentPipeline.pipeline && Array.isArray(currentPipeline.pipeline) && currentPipeline.pipeline.length > 0) {
                let currentResource = resource;

                if(typeof currentPipeline.resource === "string" && currentPipeline.resource.length > 0) {
                    currentResource = currentPipeline.resource;
                }

                const result = convert(currentResource, currentPipeline.pipeline);

                if(typeof result === "object") {
                    if(result.success === false) {
                        array.splice(1);

                        return result;
                    } else {
                        return `${acc} ${result.query} ${unionType}`;
                    }
                } else {
                    return `${acc} ${result} ${unionType}`;
                }
            } else {
                array.splice(1);

                return {
                    success: false,
                    error: Errors.EMPTY_UNION_SUBPIPELINE
                }
            }
        }, "");

        if(typeof unionResult === "object") {
            return unionResult;
        } else {
            return {
                success: true,
                query: unionResult.substr(0, unionResult.lastIndexOf(unionType)).trim(),
            }
        }
    } else {
        return {
            success: false,
            error: Errors.EMPTY_UNION_PIPELINE
        };
    }
}

module.exports = {
    convert,
    $group,
    $lookup,
    $match,
    $project,
    $query,
    Errors,
};
