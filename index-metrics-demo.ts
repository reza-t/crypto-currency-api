import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import { MetricUnit, Metrics } from '@aws-lambda-powertools/metrics';
import { getRandomCryptoSymbol, NAMESPACE, SERVICE_NAME } from "./utils/helper";
import { get_ninja_api_key } from "./utils/ninja-api-key";


const metrics = new Metrics({
  namespace: NAMESPACE,
  serviceName: SERVICE_NAME,
});


class Lambda implements LambdaInterface {
  @metrics.logMetrics()
  public async handler(event: APIGatewayProxyEvent, context: unknown): Promise<APIGatewayProxyResult> {
    try {
      const symbol = getRandomCryptoSymbol();
      const apiKey = await get_ninja_api_key();

      const response = await axios.get(
        "https://api.api-ninjas.com/v1/cryptoprice",
        {
          params: {
            symbol
          },
          headers: {
            "X-Api-Key": apiKey,
          },
        }
      );
      metrics.addMetadata('symbol', symbol);
      metrics.addMetric('successfulGetPrice', MetricUnit.Count, 1);

      return {
        statusCode: 200,
        body: JSON.stringify(response.data),
      };
    } catch (err: any) {
      metrics.addMetric('failedGetPrice', MetricUnit.Count, 1);

      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "some error happened",
        }),
      };
    }
  }
}


const myFunction = new Lambda();
export const handler = myFunction.handler.bind(myFunction);
