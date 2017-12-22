const aws = require("aws-sdk");

const sns = require("./sns");
const helpers = require("./helpers");

const TRIGGER_WORDS = (
  process.env.TRIGGER_WORDS ||
  "Error,Failure,Exception,UnhandledPromiseRejection"
)
  .toLowerCase()
  .split(",");

module.exports = options => {
  options = options || {};

  const _transformFn = options.transformFn || transformFn;

  return (event, context, callback) => {
    helpers
      .logsFromEvent(event, TRIGGER_WORDS, _transformFn)
      .map(log => {
        return sns.publishSNS(log.subject, log.message, log.topic);
      })
      .then(() => {
        callback();
      })
      .catch(callback);
  };
};

const transformFn = (logEvent, logGroup, logStream) => {
  return {
    subject: `${logGroup} (${logStream})`,
    message: logEvent.message,
    topic: null
  };
};
