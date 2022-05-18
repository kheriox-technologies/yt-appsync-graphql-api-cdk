import { AppSyncResolverHandler } from 'aws-lambda';
import * as utils from '/opt/utils';

import { GetUsersParams, User } from '/opt/types';
import { QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb';

type Result = {
  data: User[];
  nextToken: string;
};

export const handler: AppSyncResolverHandler<GetUsersParams, Result> = async (event, context) => {
  return new Promise<Result>(async (resolve, reject) => {
    try {
      // Print Event
      utils.logInfo(event, 'Event');

      //  Get DDB DocClient
      const ddbDocClient = await utils.getDDBDocClient();

      // Query command input with attributes to get
      const queryCommandInput: QueryCommandInput = {
        TableName: process.env.DDB_TABLE,
        ExclusiveStartKey: event.arguments.getUsersInput.nextToken
          ? JSON.parse(Buffer.from(event.arguments.getUsersInput.nextToken, 'base64').toString('ascii'))
          : undefined,
        ExpressionAttributeValues: {},
      };

      // Add Query Expression
      if (event.arguments.getUsersInput.email) {
        queryCommandInput.KeyConditionExpression = 'email = :email';
        queryCommandInput.ExpressionAttributeValues = {
          ...queryCommandInput.ExpressionAttributeValues,
          ':email': event.arguments.getUsersInput.email,
        };
      } else {
        queryCommandInput.IndexName = 'itemType-index';
        queryCommandInput.KeyConditionExpression = 'itemType = :itemType';
        queryCommandInput.ExpressionAttributeValues = {
          ...queryCommandInput.ExpressionAttributeValues,
          ':itemType': 'User',
        };
      }

      // Execute Query
      const queryCommandOutput = await ddbDocClient.send(new QueryCommand(queryCommandInput));
      const result: Result = {
        data: queryCommandOutput.Items ? (queryCommandOutput.Items as User[]) : [],
        nextToken: queryCommandOutput.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(queryCommandOutput.LastEvaluatedKey)).toString('base64')
          : '',
      };

      // Return result
      resolve(result);
    } catch (error: any) {
      utils.logError(error);
      reject();
    }
  });
};
