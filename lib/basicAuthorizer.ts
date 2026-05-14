import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from "aws-lambda";

export const main = async (
  event: APIGatewayTokenAuthorizerEvent,
): Promise<APIGatewayAuthorizerResult> => {
  console.log("Event: ", JSON.stringify(event));

  if (!event.authorizationToken) {
    throw new Error("Unauthorized");
  }

  try {
    const token = event.authorizationToken;

    const encodedCredentials = token.split(" ")[1];
    if (!encodedCredentials) {
      throw new Error("Unauthorized");
    }

    const buff = Buffer.from(encodedCredentials, "base64");
    const plainCredentials = buff.toString("utf-8").split(":");
    const username = plainCredentials[0];
    const password = plainCredentials[1];

    console.log(`Username: ${username}`);

    const storedPassword = process.env[username];
    const effect =
      storedPassword && storedPassword === password ? "Allow" : "Deny";

    return generatePolicy(encodedCredentials, event.methodArn, effect);
  } catch (error) {
    throw new Error("Unauthorized");
  }
};

const generatePolicy = (
  principalId: string,
  resource: string,
  effect: "Allow" | "Deny",
): APIGatewayAuthorizerResult => {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};
