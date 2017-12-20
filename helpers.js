const Promise = require("bluebird");
const zlib = Promise.promisifyAll(require("zlib"));

// Configuration
const ERROR_WORDS = (process.env.ERROR_WORDS || "Error,Failure,Exception")
  .toLowerCase()
  .split(",");

const logsFromEvent = event => {
  var payload = new Buffer(event.awslogs.data, "base64");

  return zlib
    .gunzipAsync(payload)
    .then(result => {
      console.log(result.toString("ascii"));
      return JSON.parse(result.toString("ascii"));
    })
    .then(result => {
      return filterLogEvents(result);
    });
};

const filterLogEvents = log => {
  log.logEvents = log.logEvents.filter(event => {
    for (let i in ERROR_WORDS) {
      let word = ERROR_WORDS[i];
      if (event.message.toLowerCase().indexOf(word) !== -1) {
        return true;
      }
    }
    return false;
  });
  return log;
};

module.exports = {
  logsFromEvent: logsFromEvent
};
