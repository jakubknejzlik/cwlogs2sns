const cwlogs2sns = require("cwlogs2sns");

// config which stacks/services you want to ignore
const ignoreStacks = ["system", "core"];
const ignoreServices = [];

// validate message content (logEvent.message)
const isValidMessage = message => {
  let parsedMessage = null;
  try {
    parsedMessage = JSON.parse(message);
  } catch (e) {
    return false;
  }

  const stack = parsedMessage.stack;
  if (stack && ignoreStacks.indexOf(stack) !== -1) {
    return false;
  }

  const service = parsedMessage.service;
  if (service && ignoreServices.indexOf(service) !== -1) {
    return false;
  }

  return true;
};

// custom map function
const mapFn = (logEvent, logGroup, logStream) => {
  const isValid = isValidMessage(logEvent.message);

  if (!isValid) return null;

  return {
    subject: `${logGroup} (${logStream})`,
    message: logEvent.message,
    topic: null
  };
};

exports.handler = cwlogs2sns({ map: mapFn });
