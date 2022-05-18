import { readJSONSync } from 'fs-extra';
import { User } from './shared/types';
import { ddbBatchWrite } from './shared/utils';

const main = async () => {
  try {
    const users: User[] = readJSONSync('./sample-users.json');
    const ddbUsers = users.map((u) => {
      return { ...u, itemType: 'User' };
    });
    await ddbBatchWrite('appsync-graphql-api-develop', ddbUsers);
  } catch (error) {
    console.log(error);
  }
};

main();
