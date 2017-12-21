const assert = require("assert");
const Promise = require("bluebird");
const zlib = Promise.promisifyAll(require("zlib"));

const helpers = require("../helpers");

const eventRaw = {
  messageType: "DATA_MESSAGE",
  owner: "123456789123",
  logGroup: "testLogGroup",
  logStream: "testLogStream",
  subscriptionFilters: ["testFilter"],
  logEvents: [
    {
      id: "eventId1",
      timestamp: 1440442987000,
      message: "[ERROR] First test message"
    },
    {
      id: "eventId2",
      timestamp: 1440442987001,
      message: "[FAILURE] Second test message"
    },
    {
      id: "eventId3",
      timestamp: 1440442987002,
      message: "[EXCEPTION] Third test message"
    },
    {
      id: "eventId4",
      timestamp: 1440442987003,
      message: "[OK] Fourth test message"
    }
  ]
};

const tranformFn = (logEvent, logGroup, logStream) => {
  return {
    subject: `${logGroup} (${logStream})`,
    message: logEvent.message,
    topic: `arn:blah:${logGroup}`
  };
};

describe("cwlogs", () => {
  let event = null;
  before(() => {
    return zlib
      .gzipAsync(JSON.stringify(eventRaw))
      .then(result => {
        return result.toString("base64");
      })
      .then(data => {
        event = {
          awslogs: { data: data }
        };
      });
  });

  it("should parse payload for excetpion", () => {
    const expectedOutput = [
      {
        subject: "testLogGroup (testLogStream)",
        message: "[EXCEPTION] Third test message",
        topic: `arn:blah:testLogGroup`
      }
    ];
    return helpers
      .logsFromEvent(event, ["exception"], tranformFn)
      .then(result => {
        assert.deepEqual(result, expectedOutput);
      });
  });

  it("should parse payload for all", () => {
    const expectedOutput = [
      {
        subject: "testLogGroup (testLogStream)",
        message: "[ERROR] First test message",
        topic: `arn:blah:testLogGroup`
      },
      {
        subject: "testLogGroup (testLogStream)",
        message: "[FAILURE] Second test message",
        topic: `arn:blah:testLogGroup`
      },
      {
        subject: "testLogGroup (testLogStream)",
        message: "[EXCEPTION] Third test message",
        topic: `arn:blah:testLogGroup`
      },
      {
        subject: "testLogGroup (testLogStream)",
        message: "[OK] Fourth test message",
        topic: `arn:blah:testLogGroup`
      }
    ];
    return helpers.logsFromEvent(event, ["*"], tranformFn).then(result => {
      assert.deepEqual(result, expectedOutput);
    });
  });

  it("should parse payload for negative transformFn", () => {
    const expectedOutput = [];
    return helpers
      .logsFromEvent(event, ["*"], () => {
        return null;
      })
      .then(result => {
        assert.deepEqual(result, expectedOutput);
      });
  });
});
