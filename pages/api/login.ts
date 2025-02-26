import { NextApiRequest, NextApiResponse } from 'next';
import { createNewUser, isNewUser } from '@/lib/db/hasura';
import { magicAdmin } from '../../lib/magic';
import jwt from 'jsonwebtoken';
import { setTokenCookie } from '@/lib/cookies';

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ done: false, message: 'Method Not Allowed' });
  }

  try {
    const auth = req.headers.authorization;
    const didToken = auth ? auth.split('Bearer ').reverse()[0] : '';

    if (!didToken) {
      return res.status(401).json({ done: false, message: 'Unauthorized' });
    }

    const metadata = await magicAdmin.users.getMetadataByToken(didToken);

    // Create JWT token
    const token = jwt.sign(
      {
        ...metadata,
        iat: Math.floor(Date.now() / 1000),
        //exp: Math.floor(Date.now() / 1000 + 7 * 24 * 60 * 60), // 7 days
        exp: Math.floor(Date.now() / 1000 + 1 * 24 * 60 * 60), // 1 day
        'https://hasura.io/jwt/claims': {
          'x-hasura-allowed-roles': ['user', 'admin'],
          'x-hasura-default-role': 'user',
          'x-hasura-user-id': `${metadata.issuer}`,
        },
      },
      process.env.JWT_SECRET as string
    );
    const isNewUserQuery = await isNewUser(token, metadata.issuer);
    isNewUserQuery && (await createNewUser(token, metadata));
    setTokenCookie(token, res);
    res.send({ done: true });
  } catch (error) {
    console.error('Something went wrong logging in', error);
    res.status(500).send({ done: false });
  }
}
