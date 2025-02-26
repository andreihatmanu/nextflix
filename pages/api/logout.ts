import { NextApiRequest, NextApiResponse } from 'next';
import { magicAdmin } from '../../lib/magic';
import { removeTokenCookie } from '../../lib/cookies';
import { verifyToken } from '../../lib/utils';

export default async function logout(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    const token: string | undefined = req.cookies.token;
    if (!token) {
      res.status(401).json({ message: 'User is not logged in' });
      return;
    }

    const userId: string | null = await verifyToken(token);
    if (!userId) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    removeTokenCookie(res);

    try {
      await magicAdmin.users.logoutByIssuer(userId);
    } catch (error) {
      console.warn("User's session with Magic may have already expired");
      console.error('Magic logout error:', error);
    }
    res.status(200).json({ done: true, redirect: '/login' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
