const aws = require("aws-sdk");
const Promise = require("bluebird");

// Configuration
const AWS_SNS_ARN = process.env.AWS_SNS_ARN;

const sns = Promise.promisifyAll(new aws.SNS());

const publishSNS = (message, logGroup, logStream) => {
  return sns.publishAsync({
    Subject: `${logGroup} (${logStream})`,
    Message: message,
    TopicArn: AWS_SNS_ARN
  });
};

module.exports = {
  publishSNS: publishSNS
};
