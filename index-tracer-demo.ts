import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import { Tracer } from '@aws-lambda-powertools/tracer';
import { getRandomCryptoSymbol, SERVICE_NAME } from "./utils/helper";
import { get_ninja_api_key } from "./utils/ninja-api-key";

const tracer = new Tracer({ serviceName: SERVICE_NAME });

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const symbol = getRandomCryptoSymbol();

  const handlerSegment = tracer.getSegment()?.addNewSubsegment('ninja-api-handler');
  handlerSegment && tracer.setSegment(handlerSegment); 
  tracer.putMetadata('dependency', 'NinjaAPI');
  tracer.putMetadata('apiName', 'Get crypto price');
  try {
    const apiKey = await get_ninja_api_key();

    const response = await axios.get(
      "https://api.api-ninjas.com/v1/cryptoprice",
      {
        params: {
          symbol,
        },
        headers: {
          "X-Api-Key": apiKey,
        },
      }
    );
    tracer.putAnnotation("statusCode", response.status);
    tracer.addResponseAsMetadata(response.data, "ninja-api-response");

    handlerSegment?.close();
    handlerSegment && tracer.setSegment(handlerSegment?.parent); 

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "some error happened",
      }),
    };
  }
};
