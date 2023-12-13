"use strict";
const aws = require("@pulumi/aws")
const pulumi = require("@pulumi/pulumi")
const S3DynamoComponent = require("./S3DynamoComponent")

const s3DynamoArgs = {
    bucketName: "file-storage",
    tableName: "file-index",
    tableAttributes: [
        {
            name: "fileId",
            type: "S"
        },
        {
            name: "timestamp",
            type: "S"
        }
    ],
    hashKey: "fileId",
    rangeKey: "timestamp"
}

const s3DynamoComponent = new S3DynamoComponent("file-ops", s3DynamoArgs, {})

const assumeRole = aws.iam.getPolicyDocument({
    Version: "2012-10-17",
    Statement: [
        {
            Effect: "Allow",
            Action: [
                "lambda:InvokeFunction",
                "lambda:CreateFunction"
            ],
            Resource: "*"
        }
    ]
})

const iamForLambda = new aws.iam.Role("iamForLambda", { assumeRolePolicy: assumeRole })

const lambdaFunction = new aws.lambda.Function("newLambda", {
    code: new pulumi.asset.FileArchive("lambda_function.zip"),
    role: iamForLambda.arn,
    handler: "lambdaFunction.handler",
    runtime: "nodejs18.x"
})

module.exports = [
    s3DynamoComponent,
    lambdaFunction
]