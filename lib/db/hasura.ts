// Define types for function parameters
interface StatsParams {
  favourited: number;
  userId: string;
  watched: boolean;
  videoId: string;
}

interface UserMetadata {
  issuer: string;
  email: string;
  publicAddress: string;
}

// Function to Insert Stats
export async function insertStats(token: string, params: StatsParams): Promise<StatsParams> {
  const { favourited, userId, watched, videoId } = params;

  const operationsDoc = `
  mutation insertStats($favourited: Int!, $userId: String!, $watched: Boolean!, $videoId: String!) {
    insert_stats_one(object: {
      favourited: $favourited, 
      userId: $userId, 
      watched: $watched, 
      videoId: $videoId
    }) {
        favourited
        userId
    }
  }
  `;

  return await queryHasuraGQL(
    operationsDoc,
    'insertStats',
    { favourited, userId, watched, videoId },
    token
  );
}

// Function to Update Stats
export async function updateStats(token: string, params: StatsParams): Promise<StatsParams> {
  const { favourited, userId, watched, videoId } = params;

  const operationsDoc = `
  mutation updateStats($favourited: Int!, $userId: String!, $watched: Boolean!, $videoId: String!) {
    update_stats(
      _set: {watched: $watched, favourited: $favourited}, 
      where: {
        userId: {_eq: $userId}, 
        videoId: {_eq: $videoId}
      }) {
      returning {
        favourited,
        userId,
        watched,
        videoId
      }
    }
  }
  `;

  return await queryHasuraGQL(
    operationsDoc,
    'updateStats',
    { favourited, userId, watched, videoId },
    token
  );
}

// Function to Check if Video Exists for User
export async function findVideoIdByUser(
  token: string,
  userId: string,
  videoId: string
): Promise<any> {
  const operationsDoc = `
  query findVideoIdByUserId($userId: String!, $videoId: String!) {
    stats(where: { userId: {_eq: $userId}, videoId: {_eq: $videoId }}) {
      id
      userId
      videoId
      favourited
      watched
    }
  }
  `;

  const response = await queryHasuraGQL(
    operationsDoc,
    'findVideoIdByUserId',
    { videoId, userId },
    token
  );
  return response?.data?.stats;
}

// Function to Create a New User
export async function createNewUser(token: string, metadata: UserMetadata): Promise<UserMetadata> {
  const operationsDoc = `
  mutation createNewUser($issuer: String!, $email: String!, $publicAddress: String!) {
    insert_users(objects: {email: $email, issuer: $issuer, publicAddress: $publicAddress}) {
      returning {
        email
        id
        issuer
      }
    }
  }
  `;

  const { issuer, email, publicAddress } = metadata;
  const response = await queryHasuraGQL(
    operationsDoc,
    'createNewUser',
    { issuer, email, publicAddress },
    token
  );
  return response;
}

// Function to Check if a User is New
export async function isNewUser(token: string, issuer: string): Promise<boolean> {
  const operationsDoc = `
  query isNewUser($issuer: String!) {
    users(where: {issuer: {_eq: $issuer}}) {
      id
      email
      issuer
    }
  }
  `;

  const response = await queryHasuraGQL(operationsDoc, 'isNewUser', { issuer }, token);
  return response?.data?.users?.length === 0;
}

export async function watchAgainVideos(userId: string, token: string): Promise<StatsParams> {
  const operationsDoc = `
  query watchedVideos($userId: String!) {
    stats(where: {
      watched: {_eq: true}, 
      userId: {_eq: $userId},
    }) {
      videoId
    }
  }
`;

  const response = await queryHasuraGQL(operationsDoc, 'watchedVideos', { userId }, token);
  return response;
}
export async function myListVideos(userId: string, token: string): Promise<StatsParams> {
  const operationsDoc = `
  query myListVideos($userId: String!) {
    stats(where: {
      watched: {_eq: true}, 
      userId: {_eq: $userId},
      favourited: {_eq: 1},
    }) {
      videoId
    }
  }
`;

  const response = await queryHasuraGQL(operationsDoc, 'myListVideos', { userId }, token);
  return response;
}

// Function to Query Hasura GraphQL API
async function queryHasuraGQL<T>(
  operationsDoc: string,
  operationName: string,
  variables: Record<string, unknown>,
  token: string
): Promise<any> {
  const result = await fetch(`${process.env.NEXT_PUBLIC_HASURA_ADMIN_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || '',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: operationsDoc,
      variables: variables,
      operationName: operationName,
    }),
  });

  return result.json();
}
