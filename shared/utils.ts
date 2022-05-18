import { DynamoDBDocumentClient, BatchWriteCommand, BatchWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import _ from 'lodash';

// Logger Functions
export const logInfo = (message: string | any, title: string | undefined = undefined): void => {
  if (typeof message === 'string') {
    title ? console.info(`${title}: ${message}`) : console.info(message);
  } else {
    title ? console.info(`${title}:`, JSON.stringify(message, null, 2)) : console.info(JSON.stringify(message, null, 2));
  }
};
export const logError = (message: string | any, title: string | undefined = undefined): void => {
  if (typeof message === 'string') {
    title ? console.error(`${title}: ${message}`) : console.error(message);
  } else {
    title ? console.error(`${title}:`, JSON.stringify(message, null, 2)) : console.error(JSON.stringify(message, null, 2));
  }
};
export const logWarn = (message: string | any, title: string | undefined = undefined): void => {
  if (typeof message === 'string') {
    title ? console.warn(`${title}: ${message}`) : console.warn(message);
  } else {
    title ? console.warn(`${title}:`, JSON.stringify(message, null, 2)) : console.warn(JSON.stringify(message, null, 2));
  }
};
export const logDebug = (message: string | any, title: string | undefined = undefined): void => {
  if (process.env.LOG_LEVEL === 'debug') {
    if (typeof message === 'string') {
      title ? console.debug(`${title}: ${message}`) : console.debug(message);
    } else {
      title ? console.debug(`${title}:`, JSON.stringify(message, null, 2)) : console.debug(JSON.stringify(message, null, 2));
    }
  }
};

// Get Document Client
export const getDDBDocClient = (): Promise<DynamoDBDocumentClient> => {
  return new Promise((resolve, reject) => {
    const ddbClient = new DynamoDBClient({ region: 'ap-southeast-2' });
    const marshallOptions = {
      convertEmptyValues: true,
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    };
    const unmarshallOptions = {
      wrapNumbers: false,
    };
    const translateConfig = { marshallOptions, unmarshallOptions };
    const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, translateConfig);
    resolve(ddbDocClient);
  });
};

// DDB Batch Write
export const ddbBatchWrite = (table: string, items: any[]): Promise<void> => {
  return new Promise<void>(async (resolve, reject) => {
    console.info(`Batch Writing ${items.length} items`);
    const ddbDocClient = await getDDBDocClient();

    const putRequests = items.map((i) => {
      return {
        PutRequest: {
          Item: i,
        },
      };
    });

    const batchChunks = _.chunk(putRequests, 25);
    for (const [i, chunk] of batchChunks.entries()) {
      const batchWriteInput: BatchWriteCommandInput = {
        RequestItems: {},
      };
      if (batchWriteInput.RequestItems) {
        batchWriteInput.RequestItems[table] = chunk;
        try {
          const batchWriteCommand = new BatchWriteCommand(batchWriteInput);
          await ddbDocClient.send(batchWriteCommand);
        } catch (err) {
          console.log(err);
        }
      }
    }
    resolve();
  });
};
