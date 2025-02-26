import { NextApiRequest, NextApiResponse } from 'next';
import { findVideoIdByUser, insertStats, updateStats } from '../../lib/db/hasura';
import { verifyToken } from '@/lib/utils';

export default async function stats(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(403).send({});
      }

      const { videoId, favourited = 0, watched = true } = req.body;

      if (videoId) {
        const userId = await verifyToken(token);

        if (!userId) {
          return res.status(401).send({ error: 'Invalid userId' });
        }

        const findVideo = await findVideoIdByUser(token, userId, videoId);
        const doesStatsExist = findVideo?.length > 0;

        if (doesStatsExist) {
          // Update stats
          const response = await updateStats(token, {
            watched,
            userId,
            videoId,
            favourited,
          });
          res.send({ data: response });
        } else {
          // add it
          const response = await insertStats(token, {
            watched,
            userId,
            videoId,
            favourited,
          });
          res.send({ data: response });
        }
      } else {
        return res.status(500).send({ error: 'Missing videoId' });
      }
    } catch (error) {
      console.error('Error occurred /stats', error);
      return res.status(500).send({ done: false, error: (error as Error).message });
    }
  } else {
    const token = req.cookies.token;
    if (!token) {
      res.status(403).send({ error: 'Invalid token' });
    } else {
      const { videoId } = req.query;
      if (videoId) {
        const userId = await verifyToken(token);

        const findVideo = await findVideoIdByUser(token, userId, videoId);
        const doesStatsExist = findVideo?.length > 0;
        if (doesStatsExist) {
          res.send(findVideo);
        } else {
          // add it
          res.status(404);
          res.send({ user: null, msg: 'Video not found' });
        }
      }
    }
  }
}
