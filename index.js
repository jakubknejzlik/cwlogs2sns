const aws = require("aws-sdk");
const Promise = require("bluebird");
const zlib = Promise.promisifyAll(require("zlib"));

const sns = require("./sns");

// Configuration
const ERROR_WORDS = (
  process.env.ERROR_WORDS || "Error,Failure,Exception"
).split(",");

const logsFromEvent = event => {
  var payload = new Buffer(event.awslogs.data, "base64");

  return zlib.gunzipAsync(payload).then(result => {
    return JSON.parse(result.toString("ascii"));
  });
};

const filterLogEvents = log => {
  log.logEvents = log.logEvents.filter(event => {
    for (let i in ERROR_WORDS) {
      let word = ERROR_WORDS[i];
      if (event.message.indexOf(word) !== -1) {
        return true;
      }
    }
    return false;
  });
  return log;
};

module.exports = options => {
  options = options || {};
  return (event, context, callback) => {
    logsFromEvent(event)
      .then(log => {
        return filterLogEvents(log);
      })
      .then(log => {
        let promises = [];
        log.logEvents(event => {
          sns.publishSNS(event.message, log.logGroup, log.logStream);
        });
        return Promise.all(promises);
      })
      .then(() => {
        callback();
      })
      .catch(callback);
  };
};
