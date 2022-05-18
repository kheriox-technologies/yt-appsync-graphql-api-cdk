import { AppSyncResolverHandler } from 'aws-lambda';
import * as utils from '/opt/utils';

import { User, AddUserParams } from '/opt/types';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

export const handler: AppSyncResolverHandler<AddUserParams, User> = async (event, context) => {
  return new Promise<User>(async (resolve, reject) => {
    try {
      // Print Event
      utils.logInfo(event, 'Event');

      // Build User Object
      const user: User = {
        itemType: 'User',
        firstName: event.arguments.addUserInput.firstName,
        lastName: event.arguments.addUserInput.lastName,
        email: event.arguments.addUserInput.email,
        gender: event.arguments.addUserInput.gender,
        jobTitle: event.arguments.addUserInput.jobTitle,
        country: event.arguments.addUserInput.country,
      };

      // Get DDB Doc Client
      const ddbDocClient = await utils.getDDBDocClient();

      // Write Item to DDB
      await ddbDocClient.send(new PutCommand({ TableName: process.env.DDB_TABLE, Item: user }));

      // Return new user
      resolve(user);
    } catch (error: any) {
      utils.logError(error);
      reject();
    }
  });
};
