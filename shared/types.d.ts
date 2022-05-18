export type CDKContext = {
  appName: string;
  region: string;
  environment: string;
  branchName: string;
  accountNumber: string;
};

export type LambdaDefinition = {
  name: string;
  memoryMB?: number;
  timeoutMins?: number;
  environment?: {
    [key: string]: string;
  };
};

export type User = {
  itemType: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  jobTitle: string;
  country: string;
};

export type GetUsersParams = {
  getUsersInput: {
    nextToken?: string;
    email?: string;
  };
};

export type AddUserParams = {
  addUserInput: {
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    jobTitle: string;
    country: string;
  };
};

export type UpdateUserParams = {
  updateUserInput: {
    email: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    jobTitle?: string;
    country?: string;
  };
};

export type DeleteUserParams = {
  deleteUserInput: {
    email: string;
  };
};
