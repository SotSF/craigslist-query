
var _ = require('underscore'),
    dateformat = require('dateformat'),
    ini = require('node-ini');


var DATA_DIR = __dirname + '/../data/';

// The URL component that will follow the domain
var CL_URL_PATH = '/search/tia?sort=rel&query=burning+man';


/**
 * Finds a child by recursively searching through the tree produced by scrapeit, with `elem` as the
 * root. This will look at each child found and compare it with the attributes provided in the
 * `attrs` object. If no such child is found, returns null.
 *
 * @param elem
 * @param tag
 * @param attrs
 */
exports.find_child_with_attrs = function (elem, tag, attrs) {
    // Check and see if the element itself matches
    if (elem.type === 'tag' && elem.name === tag && elem.attribs) {
        // Check the attribs
        if (_.matcher(attrs)(elem.attribs)) {
            return elem;
        }
    }

    // Element does not match for one reason or another. Attempt to recurse
    if (elem.children) {
        var child_searches = _.map(elem.children, function (child) {
            return exports.find_child_with_attrs(child, tag, attrs);
        });

        // Check for any successful searches
        var successes = _.compact(child_searches);
        if (successes.length) {
            // Found one! Return it
            return successes[0];
        }
    }

    // No children match either :(
    return null;
};


exports.datetime = function () {
    return dateformat(new Date(), "mmmm dS, yyyy, h:MM:ss TT");
};


exports.location_data_path = function (location) {
    return DATA_DIR + cleanse_file_name(location.location) + '.csv';
};


exports.get_location_url = function (location) {
    return location.url + CL_URL_PATH;
};


function cleanse_file_name (filename) {
    return filename.replace(/\//g, '-').replace(/ /g, '_');
}


// Configuration data
var CONFIG = ini.parseSync(__dirname + '/../config.ini');

// The names of the locations we want to query
var location_names = CONFIG.query_regions.regions,
    longest_name = location_names.reduce(function (a, b) { return a.length > b.length ? a : b; });

exports.get_spacing = function (location) {
    var num_spaces = longest_name.length - location.location.length;

    var space_str = '';
    for (var i in _.range(num_spaces)) {
        space_str += ' ';
    }

    return space_str;
};
