import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const dynamodb = new DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });
const TableName = process.env.DYNAMODB_TABLE;

export const create: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  if (typeof data.text !== "string") {
    console.error("Validation Failed");
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "text is required" }),
    };
  }

  const params = {
    TableName,
    Item: {
      id: uuidv4(),
      text: data.text,
      checked: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  try {
    await dynamodb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: params.Item,
        message: "Item created successfully",
      }),
    };
  } catch (error) {
    console.log("error while creating todo", error.message);
    return {
      body: JSON.stringify({ error }),
      statusCode: 500,
    };
  }
};

export const get: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { id } = event.pathParameters;
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: new Error("id is required") }),
    };
  }
  try {
    const result: any = await dynamodb
      .get({ TableName, Key: { id } })
      .promise();
    return {
      body: JSON.stringify({
        data: result.Item,
      }),
      statusCode: 200,
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 500, body: JSON.stringify({ error }) };
  }
};

export const list: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const results = await dynamodb.scan({ TableName }).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: results.Items,
        messages: "operation successful",
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error }) };
  }
};

export const deleteIt: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters;
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: new Error("id is required") }),
      };
    }
    await dynamodb.delete({ TableName, Key: { id } }).promise();
    return {
      body: JSON.stringify({}),
      statusCode: 204,
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error }) };
  }
};
