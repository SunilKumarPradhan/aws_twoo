const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    // Parse the incoming request body
    const requestBody = JSON.parse(event.body);
    
    // Validate required fields
    if (!requestBody.principalId || !requestBody.content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields: principalId or content' })
      };
    }
    
    // Create event object to store in DynamoDB
    const newEvent = {
      id: uuidv4(),
      principalId: requestBody.principalId,
      createdAt: new Date().toISOString(),
      body: requestBody.content
    };
    
    // Save event to DynamoDB
    await dynamoDB.put({
      TableName: tableName,
      Item: newEvent
    }).promise();
    
    // Return success response
    return {
      statusCode: 201,
      body: JSON.stringify({
        statusCode: 201,
        event: newEvent
      })
    };
  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};