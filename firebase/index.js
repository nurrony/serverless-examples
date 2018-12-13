const Busboy = require('busboy');
const firebase = require('firebase-admin');
const path = require('path');
const os = require('os');
const fs = require('fs');
const functions = require('firebase-functions');
const { Storage } = require('@google-cloud/storage');
const admin = firebase.initializeApp(functions.config().firebase);

const gcs = new Storage();
const bucket = gcs.bucket('nomadic-care-hosting-app-nmr.appspot.com');
exports.upload = functions.https.onRequest((req, res) => {
  if (req.method === 'POST') {
    console.log('I am executing in post');
    const busboy = new Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();

    // This object will accumulate all the fields, keyed by their name
    const fields = {};

    // This object will accumulate all the uploaded files, keyed by their name.
    const uploads = {};

    // This code will process each non-file field in the form.
    busboy.on('field', (fieldname, val) => {
      // TODO(developer): Process submitted field values here
      console.log(`Processed field ${fieldname}: ${val}.`);
      fields[fieldname] = val;
    });

    let fileWrites = [];

    // This code will process each file uploaded.
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      // Note: os.tmpdir() points to an in-memory file system on GCF
      // Thus, any files in it must fit in the instance's memory.
      console.log(`Processed file ${filename}`);
      const filepath = path.join(tmpdir, filename);
      uploads[fieldname] = filepath;

      const writeStream = fs.createWriteStream(filepath);
      file.pipe(writeStream);

      // File was processed by Busboy; wait for it to be written to disk.
      const promise = new Promise((resolve, reject) => {
        file.on('end', () => {
          writeStream.end();
        });
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
      fileWrites.push(promise);
    });

    // Triggered once all uploaded files are processed by Busboy.
    // We still need to wait for the disk writes (saves) to complete.
    busboy.on('finish', () => {
      const uploadPromises = [];
      Promise.all(fileWrites)
        .then(() => {
          console.log(' ', uploads);
          // TODO(developer): Process saved files here
          return bucket.upload(uploads['avatar'], {
            destination: `clients/${path.basename(uploads['avatar'])}`
          });
        })
        .then(uploaded => {
          fs.unlinkSync(uploads['avatar']);
          return res.json(uploaded);
        })
        .catch(error => {
          console.error('I am in error', error);
          res.status(500).json(error);
        });
    });

    busboy.end(req.rawBody);
  } else {
    // Return a "method not allowed" error
    res.status(405).end();
  }
});
