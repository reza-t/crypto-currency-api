import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import { Logger, LogLevel } from '@aws-lambda-powertools/logger';
import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import { LogFactory } from "./utils/LogFactory";
import { getRandomCryptoSymbol, SERVICE_NAME } from "./utils/helper";
import { get_ninja_api_key } from "./utils/ninja-api-key";

/**
 * @see https://docs.powertools.aws.dev/lambda/typescript/latest/core/logger/
 *
 */
const logger = new Logger({
  logFormatter: new LogFactory(),
  logLevel: LogLevel.DEBUG,
  serviceName: SERVICE_NAME,
});

class Lambda implements LambdaInterface {
  // Decorate your handler class method
  @logger.injectLambdaContext()
  public async handler(event: APIGatewayProxyEvent, context: unknown): Promise<APIGatewayProxyResult> {
    const symbol = getRandomCryptoSymbol()

    try {
      logger.debug('Ninja api handler invoked for getting the currency', { symbol });
  
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
      return {
        statusCode: 200,
        body: JSON.stringify(response.data),
      };
    } catch (err: any) {
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
