const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TARGET_TABLE || "Events";

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const newEvent = {
            id: uuidv4(),
            principalId: body.principalId,
            createdAt: new Date().toISOString(),
            body: body.content
        };

        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: newEvent
        }).promise();

        return {
            statusCode: 201,
            body: JSON.stringify({ event: newEvent })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
