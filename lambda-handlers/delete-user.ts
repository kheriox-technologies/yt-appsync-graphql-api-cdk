import { AppSyncResolverHandler } from 'aws-lambda';
import * as utils from '/opt/utils';

import { DeleteUserParams } from '/opt/types';
import { DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

export const handler: AppSyncResolverHandler<DeleteUserParams, string> = async (event, context) => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      // Print Event
      utils.logInfo(event, 'Event');

      //  Get DDB DocClient
      const ddbDocClient = await utils.getDDBDocClient();

      // Check if user is present in DDB
      const getUserOutput = await ddbDocClient.send(
        new QueryCommand({
          TableName: process.env.DDB_TABLE,
          KeyConditionExpression: `email = :email`,
          ExpressionAttributeValues: {
            ':email': event.arguments.deleteUserInput.email,
          },
          ProjectionExpression: 'email',
        })
      );

      // Delete Item
      if (getUserOutput.Items && getUserOutput.Items.length > 0) {
        await ddbDocClient.send(
          new DeleteCommand({ TableName: process.env.DDB_TABLE, Key: { email: event.arguments.deleteUserInput.email } })
        );
        return resolve('User deleted successfully');
      } else {
        return resolve(`User with email ${event.arguments.deleteUserInput.email} not found`);
      }
    } catch (error: any) {
      utils.logError(error);
      reject();
    }
  });
};
