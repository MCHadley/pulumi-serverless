const pulumi = require("@pulumi/pulumi")
const aws = require("@pulumi/aws")

class S3DynamoComponent extends pulumi.ComponentResource {
    constructor(name, args, opts) {
        super("customer:resource:S3DynamoComponent", name, args, opts)

        let bucket = new aws.s3.Bucket("myBucket", {
            name: args.bucketName,
            policy: {
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: "*",
                        Action: "s3:*",
                        Resource: "s3.amazonaws.com"
                    }
                ]
            }
        }, { parent: this })

        const dynamoTable = new aws.dynamodb.Table("myTable", {
            name: args.tableName,
            attributes: args.tableAttributes,
            billingMode: "PAY_PER_REQUEST",
            hashKey: args.hashKey,
            rangeKey: args.rangeKey,
            policy: {
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Action: "dynamodb:*",
                        Resource: "*"
                    }
                ]
            }
        }, { parent: this })

        this.registerOutputs({
            bucket: bucket,
            table: dynamoTable
        })
    }
}

module.exports = S3DynamoComponent;