import { NextApiResponse } from 'next';
import { serialize } from 'cookie';

const MAX_AGE = 1 * 24 * 60 * 60; // 1day

export const setTokenCookie = (token: string, res: NextApiResponse) => {
  const setCookie = serialize('token', token, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  res.setHeader('Set-Cookie', setCookie);
};
export const removeTokenCookie = (res: NextApiResponse) => {
  const setCookie = serialize('token', '', {
    maxAge: -1,
    path: '/',
  });
  res.setHeader('Set-Cookie', setCookie);
};
