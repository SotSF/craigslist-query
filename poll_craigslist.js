#!/usr/local/bin/node

var fs = require('fs'),
    _ = require('underscore'),
    scrape = require('scrapeit'),
    dateformat = require('dateformat'),
    ini = require('node-ini'),

    locations = require('./craigslist_places'),
    helpers = require('./helpers'),
    csv = require('./csv'),
    mail = require('./mail');

var CONFIG = ini.parseSync(__dirname + '/config.ini');

// This is the database we use to record the posts we have already seen
var CL_RECORD_IDS = csv.CL_RECORD_IDS;


/**
 * Gets data from a post given the post's `p.row` element (the root element of the post)
 *
 * @param elem
 */
function get_info_from_elem (elem) {
    var helpers = require('./helpers');

    var header_link = helpers.find_child_with_attrs(elem, 'a', { 'class': 'hdrlnk' }),
        timestamp = helpers.find_child_with_attrs(elem, 'time'),
        price = helpers.find_child_with_attrs(elem, 'span', { 'class': 'price' });

    // Snatch the URL and the text
    return {
        post_id: elem.attribs['data-pid'],
        orig_post_id: elem.attribs['data-repost-of'],
        url: header_link.attribs.href,
        title: header_link.children[0].raw,
        price: price ? price.children[0].raw : null,
        timestamp: timestamp.attribs['title']
    };
}


function get_posts (location) {
    // Load the page
    scrape(helpers.get_location_url(location), function (error, $, dom) {
        // First of all, check for the `div.noresults` selector. If this turns something up, there
        // were no local results.
        if ($('div.noresults').length) {
            return;
        }

        // OK, results were found. Search through em.
        var posts = $('p.row').map(function (elem) {
            // Look up some basic info from the post's header, including its id, URL, title,
            // timestamp, etc.
            var link_info = get_info_from_elem(elem);

            // If it's in the CL_RECORD_IDS object, we've seen it before
            if (_(CL_RECORD_IDS).contains(link_info.post_id) || _(CL_RECORD_IDS).contains(link_info.orig_post_id)) {
                return;
            }

            // We haven't seen this post before!
            return link_info;
        });

        // Condense the posts so we only get the ones we haven't seen before
        posts = _.compact(posts);
        console.log(helpers.datetime() + ' (' + location.location + ')  -  INFO: Found ' + posts.length + ' new posts');

        // Store them all
        csv.write_csv(helpers.location_data_path(location), _.map(posts, _.values));

        // Message me about them, but only if there actually are any...
        if (posts.length) {
            mail.send_posts(posts, location);
        }
    });
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


function poll (location) {
    get_posts(location);

    // Wait a bit then poll again
    setTimeout(function () {
        poll(location);
    }, CONFIG.query_options.poll_interval);
}


// LETS DO THIS
init();
