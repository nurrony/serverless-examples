const needle = require("needle");

module.exports.hello = async (event) => {
  console.log("sqs event", event);
  console.log("starting http");
  const response = await needle(
    "post",
    "https://httpbin.org/post",
    { event },
    { json: true }
  );
  console.log("response", response);
};
