
var fs = require('fs'),
    _ = require('underscore'),
    request = require('request'),
    waldo = require('waldo'),
    dateformat = require('dateformat'),
    ini = require('node-ini'),

    helpers = require('./helpers'),
    csv = require('./csv'),
    mail = require('./mail');

// This is the database we use to record the posts we have already seen
var CL_RECORD_IDS = csv.CL_RECORD_IDS;


module.exports = function (location) {
    // Load the page
    request(helpers.get_location_url(location), function (error, response, body) {
        if (error) {
            console.log(location.location + ' - ' + error);
            return;
        }

        // Scrape it
        var contents = waldo.scrape(body, function () {
            return {
                no_results: this.find('div.noresults'),
                posts: this.find('p.row').map(function () {
                    var repost_id = this.$.data('repost-of');
                    return {
                        post_id: String(this.$.data('pid')),
                        orig_post_id: repost_id ? String(repost_id) : null,
                        url: this.find('a.hdrlnk').attr('href'),
                        title: this.find('a.hdrlnk').text(),
                        price: this.find('span.l2 > span.price').text(),
                        timestamp: this.find('time').attr('title')
                    }
                })
            };
        });

        // First of all, check for the `div.noresults` selector. If this turns something up, there
        // were no local results.
        if (contents.no_results.$.length) {
            return;
        }

        // OK, results were found. Search through em.
        var posts = contents.posts.map(function (post) {
            // If it's in the CL_RECORD_IDS object, we've seen it before
            if (_(CL_RECORD_IDS).contains(post.post_id) || _(CL_RECORD_IDS).contains(post.orig_post_id)) {
                return;
            }

            // We haven't seen this post before!
            return post;
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
};
