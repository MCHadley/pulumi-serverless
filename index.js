"use strict";
const aws = require("@pulumi/aws")
const pulumi = require("@pulumi/pulumi")
const { bucketId, bucketArn } = require("./S3DynamoComponent");

const user = new aws.iam.User("user", {});
const group = new aws.iam.Group("group", {});


const cloudwatchDynamoAccess = JSON.stringify({
    Version: "2012-10-17",
    Statement: [
        {
            Effect: "Allow",
            Action: "logs:*",
            Resource: "*"
        },
        {
            Effect: "Allow",
            Action: "dynamodb:*",
            Resource: "*"
        },
        {
            Effect: "Allow",
            Action: "s3:*",
            Resource: "*"
        }
    ]
});

const newPolicy = new aws.iam.Policy("cloudwatchPolicy", {
    description: "Cloudwatch Access",
    policy: cloudwatchDynamoAccess
})

const iamForLambda = new aws.iam.Role("iamForLambda", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {
                Service: "lambda.amazonaws.com"
            }
        }]
    })
})

const policyAttach = new aws.iam.PolicyAttachment("attachCloudwatch", {
    users: [user.name],
    roles: [iamForLambda.name],
    groups: [group.name],
    policyArn: newPolicy.arn
})



const lambdaFunction = new aws.lambda.Function("s3Lambda", {
    code: new pulumi.asset.FileArchive("lambdaFunction.js.zip"),
    role: iamForLambda.arn,
    handler: "lambdaFunction.handler",
    runtime: "nodejs18.x"
})

const allowBucket = new aws.lambda.Permission("allowBucket", {
    action: "lambda:InvokeFunction",
    "function": lambdaFunction.arn,
    principal: "s3.amazonaws.com",
    sourceArn: bucketArn
});

const bucketNotification = new aws.s3.BucketNotification("bucketNotification", {
    bucket: bucketId,
    lambdaFunctions: [{
        lambdaFunctionArn: lambdaFunction.arn,
        events: ["s3:ObjectCreated:*"]
    }],
}, {
    dependsOn: [allowBucket],
});

module.exports = [
    bucketNotification
]