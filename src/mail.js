
var fs = require('fs'),
    _ = require('underscore'),
    nodemailer = require('nodemailer'),
    ini = require('node-ini');


var CONFIG = ini.parseSync(__dirname + '/../config.ini');


/**
 * The transporter that will be used to send me emails
 */
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: CONFIG.mail.gmail_user,
        pass: CONFIG.mail.gmail_pass
    }
});


// Build the message template for sending post updates
var MSG_TEMPLATE = _.template(String(fs.readFileSync(__dirname + '/../templates/new_posts.html')));


/**
 * Compiles all of the mailing options we need to send me mail
 */
function get_mail_opts (posts, location) {
    return {
        from: CONFIG.mail.gmail_user,
        to: CONFIG.mail.mailto,
        subject: posts.length + ' New Craigslist Listings! (' + location.location + ')',
        html: MSG_TEMPLATE({ posts: posts, location: location })
    };
}


/**
 * Sends the given posts to me!
 *
 * @param posts
 * @param location
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
