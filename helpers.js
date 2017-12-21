const Promise = require("bluebird");
const zlib = Promise.promisifyAll(require("zlib"));

const logsFromEvent = (event, triggerWords, transformFn) => {
  var payload = new Buffer(event.awslogs.data, "base64");

  return zlib
    .gunzipAsync(payload)
    .then(result => {
      return JSON.parse(result.toString("ascii"));
    })
    .then(result => {
      return filterLogEvents(result, triggerWords);
    })
    .then(log => {
      return Promise.map(log.logEvents, logEvent => {
        return transformFn(logEvent, log.logGroup, log.logStream);
      })
        .filter(value => {
          return !!value;
        })
        .finally(event => {
          return event !== null;
        });
    });
};

const filterLogEvents = (log, triggerWords) => {
  log.logEvents = log.logEvents.filter(event => {
    for (let i in triggerWords) {
      let word = triggerWords[i];
      if (word === "*") return true;
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
