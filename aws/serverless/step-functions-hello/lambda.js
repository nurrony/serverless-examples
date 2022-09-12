"use strict";

module.exports.hello = (event, context, callback) => {
  callback(null, null);
};

module.exports.ciao = (event, context, callback) => {
  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ message: "ciao world!" }),
  });
};
