const aws = require("aws-sdk");

const sns = require("./sns");
const helpers = require("./helpers");

module.exports = options => {
  options = options || {};
  return (event, context, callback) => {
    helpers
      .logsFromEvent(event)
      .then(log => {
        let promises = [];
        log.logEvents.forEach(event => {
          promises.push(
            sns.publishSNS(event.message, log.logGroup, log.logStream)
          );
        });
        return Promise.all(promises);
      })
      .then(() => {
        callback();
      })
      .catch(callback);
  };
};
