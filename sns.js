const aws = require("aws-sdk");
const Promise = require("bluebird");

// Configuration
const AWS_SNS_ARN = process.env.AWS_SNS_ARN;

const sns = Promise.promisifyAll(new aws.SNS());

const publishSNS = message => {
  return sns.publishAsync({
    Message: "Test publish to SNS from Lambda",
    TopicArn: AWS_SNS_ARN
  });
};

module.exports = {
  publishSNS: publishSNS
};
