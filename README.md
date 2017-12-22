# cwlogs2sns

AWS CloudWatch to SNS handler for lambda

# Installation

_Assuming you already have created cloudwatch log group/stream, SNS topic and lambda with role permissions for SNS publishing..._

1. Create node project and add dependency:
   `npm install cwlogs2sns`

2. Create `index.js` file with following content:

```
const cwlogs2sns = require("cwlogs2sns");

exports.handler = cwlogs2sns();
```

3. Zip your project file and upload it to AWS Lambda.

4. Setup environment variables:

* `AWS_SNS_TOPIC` - `arn` of SNS topic you want publish to
* `TRIGGER_WORDS` - this lambda function publish only logs that contain these trigger words, you can use `*` to forward all (default: `Error,Failure,Exception,UnhandledPromiseRejection`)

# Reference

`cwlogs2sns(options)`: lambda handler function

`options`:

* `map(logEvent, logGroup, logStream)`: optional function for transforming logs and custom filtering (return null to filter the log)

# What's this for?

When you setup this lambda, you can subscribe for the AWS SNS. For example, you can use [sns2slack](https://www.npmjs.com/package/sns2slack) to forward messages to you slack channels.
