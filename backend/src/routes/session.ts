import { Router } from 'express';
import { prisma } from '../prismaClient';

import {
  startSessionSchema,
  stopSessionSchema
} from '../validation/sessionV';

const router = Router();

router.post('/start', async (req, res) => {
  const { userId, gameId } = req.body;

  const [user, game] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.game.findUnique({ where: { id: gameId } })
  ]);

  if (!user || !game) {
    return res.status(404).json({ message: 'User or game not found' });
  }

  const session = await prisma.session.create({
    data: {
      userId,
      gameId,
      startTime: new Date()
    }
  });

  return res.status(201).json(session);
});

router.post('/stop', async (req, res) => {
  const { sessionId } = req.body;

  const activeSession = await prisma.session.findUnique({
    where: { id: sessionId }
  });

  if (!activeSession) {
    return res.status(404).json({ message: 'Session not found' });
  }

  if (activeSession.endTime) {
    return res.status(400).json({ message: 'Session already stopped' });
  }

  const endTime = new Date();
  const playedSeconds = Math.max(
    1,
    Math.floor((endTime.getTime() - activeSession.startTime.getTime()) / 1000)
  );

  const session = await prisma.session.update({
    where: { id: sessionId },
    data: {
      endTime,
      playedSeconds
    }
  });

  return res.json(session);
});

export default router;