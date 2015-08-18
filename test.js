#!/usr/local/bin/node
var request = require('request'),
    waldo = require('waldo');

request('http://sfbay.craigslist.org/search/tia?sort=rel&query=burning+man', function (error, response, body) {
    if (error) {
        console.log(location.location + ' - ' + error);
        return;
    }

    var contents = waldo.scrape(body, function () {
        return {
            no_results: this.find('div.noresults'),
            posts: this.find('p.row').map(function () {
                return {
                    post_id: this.$.data('pid'),
                    orig_post_id: this.$.data('repost-of'),
                    url: this.find('a.hdrlnk').attr('href'),
                    title: this.find('a.hdrlnk').text(),
                    price: this.find('span.l2 > span.price').text(),
                    timestamp: this.find('time').attr('title')
                }
            })
        }
    });

    console.log(contents);
    console.log(contents.no_results.$.length);
});