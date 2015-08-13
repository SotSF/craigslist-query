
var fs = require('fs'),
    csv = require('csv');


/**
 * A database for the process to remember post ids we have already encountered
 */
var CL_RECORD_IDS = exports.CL_RECORD_IDS = [];


/**
 * Loads a CSV
 *
 * @param filename
 */
exports.load_csv = function (filename) {
    // If the file doesn't exist, make it
    if (!fs.existsSync(filename)) {
        fs.writeFileSync(filename);
    }

    var file = fs.readFileSync(filename);

    return csv.parse(String(file), { delimiter: '\t' }, function (err, records) {
        // Loop through the records, adding them to the CL_RECORD_IDS object
        records.forEach(function (record) {
            CL_RECORD_IDS.push(record[0]);

            // Store the original post id too, if there is one
            if (record[1]) {
                CL_RECORD_IDS.push(record[1]);
            }
        });
    });
};


/**
 * Writes new records to a CSV
 * 
 * @param filename
 * @param records
 */
exports.write_csv = function (filename, records) {
    // Add the records to the CL_RECORD_IDS object
    records.forEach(function (record) {
        CL_RECORD_IDS.push(record[0]);

        // Store the original post id too, if there is one
        if (record[1]) {
            CL_RECORD_IDS.push(record[1]);
        }
    });

    csv.stringify(records, { delimiter: '\t' }, function (err, stringified) {
        // Open and write the file
        var file_descriptor = fs.openSync(filename, 'a');
        fs.write(file_descriptor, stringified);
    });
};
