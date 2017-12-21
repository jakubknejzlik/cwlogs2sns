const aws = require("aws-sdk");

const sns = require("./sns");
const helpers = require("./helpers");

const TRIGGER_WORDS = (process.env.TRIGGER_WORDS || "Error,Failure,Exception")
  .toLowerCase()
  .split(",");

module.exports = options => {
  options = options || {};

  const tranformFn = options.tranformFn || tranformFn;

  return (event, context, callback) => {
    helpers
      .logsFromEvent(event, TRIGGER_WORDS, transformFn)
      .map(log => {
        return sns.publishSNS(log.subject, log.message, log.topic);
      })
      .then(() => {
        callback();
      })
      .catch(callback);
  };
};

const tranformFn = (logEvent, logGroup, logStream) => {
  return {
    subject: `${logGroup} (${logStream})`,
    message: logEvent.message,
    topic: null
  };
};
