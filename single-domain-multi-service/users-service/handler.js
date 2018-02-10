module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: `Hello from the ${process.env.SERVICE_NAME}`
  }
  return callback(null, response)
}
