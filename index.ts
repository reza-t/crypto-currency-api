import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import axios from "axios";
import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import { MetricUnit, Metrics } from '@aws-lambda-powertools/metrics';
import { getRandomCryptoSymbol, NAMESPACE, SERVICE_NAME } from "./utils/helper";
import { Tracer } from '@aws-lambda-powertools/tracer';
import { LogFactory } from "./utils/LogFactory";
import { Logger, LogLevel } from '@aws-lambda-powertools/logger';
import { get_ninja_api_key } from "./utils/ninja-api-key";
import { SSMClient } from "@aws-sdk/client-ssm";

const logger = new Logger({
  logFormatter: new LogFactory(),
  logLevel: LogLevel.DEBUG,
  serviceName: SERVICE_NAME,
});

const tracer = new Tracer({ serviceName: SERVICE_NAME });

const metrics = new Metrics({
  namespace: NAMESPACE,
  serviceName: SERVICE_NAME,
});

class Lambda implements LambdaInterface {
  @metrics.logMetrics()
  @tracer.captureLambdaHandler()
  public async handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    // Add context to logger to get pass the function metadata to the loggerFactory
    logger.addContext(context);
    tracer.captureAWSv3Client(new SSMClient({}));


    const apiKey = await get_ninja_api_key(tracer);

    const symbol = getRandomCryptoSymbol()

    logger.debug('Ninja api handler invoked for getting the currency', { symbol });

    try {
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
      // Metrics: add custom metadata and metrics
      metrics.addMetadata('symbol', symbol);
      metrics.addMetric('successfulGetPrice', MetricUnit.Count, 1);
  
      return {
        statusCode: 200,
        body: JSON.stringify(response.data),
      };
    } catch (err: any) {
      metrics.addMetric('failedGetPrice', MetricUnit.Count, 1);

      logger.error(`failed to get the currency for symbol ${symbol}`, err as Error);

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
