import { getParameter } from '@aws-lambda-powertools/parameters/ssm';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { SERVICE_NAME } from './helper';

let tracer = new Tracer({ serviceName: SERVICE_NAME });

export const get_ninja_api_key = async (newTracer?: Tracer): Promise<string> => {
  tracer = newTracer || tracer;

  const handlerSegment = tracer.getSegment()?.addNewSubsegment('getting-api-key');
  handlerSegment && tracer.setSegment(handlerSegment);   
  
  const apiKey = await getParameter('/lambda/crypto-currency/api-key', {decrypt: true});
  if (!apiKey) {
    throw new Error("API key is missing");
  }

  handlerSegment?.addMetadata('parameterName', "/lambda/crypto-currency/api-key");

  handlerSegment?.close();
  handlerSegment && tracer.setSegment(handlerSegment?.parent); 

  return apiKey;
}