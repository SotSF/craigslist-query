#!/usr/local/bin/node

var ini = require('node-ini'),
    _ = require('underscore'),

    csv = require('./src/csv'),
    helpers = require('./src/helpers'),
    get_posts = require('./src/get_posts'),
    locations = require('./src/places');

// Configuration data
var CONFIG = ini.parseSync(__dirname + '/config.ini');


function poll (location) {
    get_posts(location);

    // Wait a bit then poll again
    setTimeout(function () {
        poll(location);
    }, CONFIG.query_options.poll_interval);
}



function init () {
    // The names of the locations we want to query
    var location_names =  CONFIG.query_regions.regions;

    // These are all of the areas that we want to query
    var poll_locations = _(locations).filter(function (location) {
        return _(location_names).contains(location.location);
    });

    poll_locations.forEach(function (location) {
        csv.load_csv(helpers.location_data_path(location)).on('end', function () {
            poll(location);
        });
    });
}


// LETS DO THIS
init();