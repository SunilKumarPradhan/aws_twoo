const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({ region: "eu-west-1" });

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TARGET_TABLE || "cmtr-12739f4b-Events-c0mq"; // Read from environment variable

exports.handler = async (event) => {
    try {
        const { principalId, content } = JSON.parse(event.body);

        if (!principalId || !content) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing principalId or content" }),
            };
        }

        const newEvent = {
            id: uuidv4(),
            principalId: principalId,
            createdAt: new Date().toISOString(),
            body: content,
        };

        // Store event in DynamoDB
        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: newEvent,
        }).promise();

        return {
            statusCode: 201,  // ✅ Fix: Ensure correct response code
            body: JSON.stringify({ event: newEvent }),
        };

    } catch (error) {
        console.error("Lambda Execution Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};
