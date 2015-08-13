
var fs = require('fs'),
    _ = require('underscore'),
    nodemailer = require('nodemailer');


/**
 * The transporter that will be used to send me emails
 */
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'milo.toor.burningman2015@gmail.com',
        pass: '5fcPoK5ojVxV'
    }
});


// Build the message template for sending post updates
var MSG_TEMPLATE = _.template(String(fs.readFileSync(__dirname + '/new_posts.html')));


/**
 * Compiles all of the mailing options we need to send me mail
 */
function get_mail_opts (posts, location) {
    return {
        from: 'Milo "Gonna Get a Ticket" Toor',
        to: 'milo.toor@gmail.com',
        subject: posts.length + ' New Craigslist Listings!',
        html: MSG_TEMPLATE({ posts: posts, location_url: location.url })
    };
}


/**
 * Sends the given posts to me!
 *
 * @param posts
 */
exports.send_posts = function (posts, location) {
    // Get the mailing options
    var mail_opts = get_mail_opts(posts, location);

    // Send the mail!
    transporter.sendMail(mail_opts, function (error, info) {
        if (error) {
            return console.log(error);
        }

        console.log('Message sent: ' + info.response);
    });
};
