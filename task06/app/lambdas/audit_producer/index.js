import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  try {
    await Promise.all(event.Records.map(processRecord));
    console.log("Successfully processed all records.");
    return { statusCode: 200, body: "Success" };
  } catch (error) {
    console.error("Error processing records:", error);
    return { statusCode: 500, body: "Error processing records." };
  }
};

async function processRecord(record) {
  const { eventName, dynamodb } = record;
  const itemKey = dynamodb?.Keys?.key?.S;

  if (!itemKey) {
    console.error("Missing item key in record:", JSON.stringify(record, null, 2));
    return;
  }

  const auditItem = {
    id: uuidv4(),
    itemKey,
    modificationTime: new Date().toISOString(),
  };

  if (eventName === "INSERT") {
    const newImage = unmarshallImage(dynamodb.NewImage);
    auditItem.newValue = { key: newImage.key, value: newImage.value };
  } else if (eventName === "MODIFY") {
    const oldImage = unmarshallImage(dynamodb.OldImage);
    const newImage = unmarshallImage(dynamodb.NewImage);

    auditItem.oldValue = oldImage.value;
    auditItem.newValue = newImage.value;
    auditItem.updatedAttribute = "value"; 
  } else if (eventName === "REMOVE") {
    auditItem.oldValue = unmarshallImage(dynamodb.OldImage);
  }

  console.log("Saving audit item to DynamoDB:", JSON.stringify(auditItem, null, 2));

  try {
    await dynamoDB.send(new PutCommand({ TableName: TABLE_NAME, Item: auditItem }));
    console.log("Audit item saved successfully.");
  } catch (error) {
    console.error("Error saving audit item:", error);
  }
}

function unmarshallImage(image) {
  if (!image) return null;

  const result = {};
  for (const [key, value] of Object.entries(image)) {
    if ('S' in value) result[key] = value.S;
    else if ('N' in value) result[key] = Number(value.N);
    else if ('BOOL' in value) result[key] = value.BOOL;
    else if ('M' in value) result[key] = unmarshallImage(value.M);
    else if ('L' in value) result[key] = value.L.map(item => unmarshallImage(item));
  }
  return result;
}
