const pulumi = require("@pulumi/pulumi")
const aws = require("@pulumi/aws")

class S3DynamoComponent extends pulumi.ComponentResource {
    constructor(name, args, opts) {
        super("customer:resource:S3DynamoComponent", name, args, opts)

        let bucket = new aws.s3.Bucket(args.bucketName, {}, { parent: this })

        this.bucketId = bucket.id;
        this.bucketArn = bucket.arn;

        const dynamoTable = new aws.dynamodb.Table(args.tableName, {
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

        this.table = dynamoTable

        this.registerOutputs({
            bucketId: this.bucketId,
            bucketArn: this.bucketArn,
            table: this.dynamoTable
        })
    }
}

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

exports.bucketId = s3DynamoComponent.bucketId
exports.bucketArn = s3DynamoComponent.bucketArn