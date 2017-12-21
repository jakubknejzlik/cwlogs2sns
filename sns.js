const aws = require("aws-sdk");
const Promise = require("bluebird");

// Configuration
const AWS_SNS_ARN = process.env.AWS_SNS_ARN;

const sns = Promise.promisifyAll(new aws.SNS());

const publishSNS = (subject, message, topic) => {
  return sns.publishAsync({
    Subject: subject,
    Message: message,
    TopicArn: topic || AWS_SNS_ARN
  });
};

module.exports = {
  publishSNS: publishSNS
};
