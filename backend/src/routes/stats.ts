import { Router } from 'express';
import { prisma } from '../prismaClient'; 
const router = Router();

router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  const gameId = req.query.gameId ? String(req.query.gameId) : undefined;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const sessions = await prisma.session.findMany({
    where: {
      userId,
      endTime: { not: null }
    },
    include: { game: true }
  });

  const totalPlayedSeconds = sessions.reduce((sum, s) => sum + s.playedSeconds, 0);
  const perGame = new Map<string, { gameId: string; gameName: string; total: number; sessions: number }>();

  for (const session of sessions) {
    const existing = perGame.get(session.gameId);
    if (existing) {
      existing.total += session.playedSeconds;
      existing.sessions += 1;
    } else {
      perGame.set(session.gameId, {
        gameId: session.gameId,
        gameName: session.game.name,
        total: session.playedSeconds,
        sessions: 1
      });
    }
  }

  const minutesPerGame = [...perGame.values()].map((g) => ({
    gameId: g.gameId,
    gameName: g.gameName,
    minutes: Math.round(g.total / 60)
  }));

  const percentPerGame = [...perGame.values()].map((g) => ({
    gameId: g.gameId,
    gameName: g.gameName,
    percent: totalPlayedSeconds > 0 ? Number(((g.total / totalPlayedSeconds) * 100).toFixed(1)) : 0
  }));

  const sessionsByGame = [...perGame.values()].map((g) => ({
    gameId: g.gameId,
    gameName: g.gameName,
    sessions: g.sessions,
    averageMinutes: Number(((g.total / Math.max(g.sessions, 1)) / 60).toFixed(1))
  }));

  let weeklyByUserForGame: Array<{ date: string; minutes: number }> = [];
  if (gameId) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const sessionsForGame = await prisma.session.findMany({
      where: {
        userId,
        gameId,
        startTime: { gte: sevenDaysAgo },
        endTime: { not: null }
      },
      orderBy: { startTime: 'asc' }
    });

    const dayMap = new Map<string, number>();
    for (let i = 0; i < 7; i += 1) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      const key = date.toISOString().slice(0, 10);
      dayMap.set(key, 0);
    }

    for (const session of sessionsForGame) {
      const key = session.startTime.toISOString().slice(0, 10);
      dayMap.set(key, (dayMap.get(key) ?? 0) + session.playedSeconds);
    }

    weeklyByUserForGame = [...dayMap.entries()].map(([date, seconds]) => ({
      date,
      minutes: Math.round(seconds / 60)
    }));
  }

  return res.json({
    totalPlayedSeconds,
    minutesPerGame,
    percentPerGame,
    sessionsByGame,
    weeklyByUserForGame
  });
});

router.get('/global', async (_req, res) => {
  const sessions = await prisma.session.findMany({
    where: { endTime: { not: null } },
    include: { game: true }
  });

  const totals = new Map<string, { gameId: string; gameName: string; total: number }>();

  for (const session of sessions) {
    const current = totals.get(session.gameId);
    if (current) {
      current.total += session.playedSeconds;
    } else {
      totals.set(session.gameId, {
        gameId: session.gameId,
        gameName: session.game.name,
        total: session.playedSeconds
      });
    }
  }

  const totalTimePerGame = [...totals.values()].map((item) => ({
    ...item,
    minutes: Math.round(item.total / 60)
  }));

  res.json({ totalTimePerGame });
});

router.get('/leaderboard', async (req, res) => {
  const gameId = String(req.query.gameId ?? '');

  if (!gameId) {
    return res.status(400).json({ message: 'gameId is required' });
  }

  const sessions = await prisma.session.findMany({
    where: {
      gameId,
      endTime: { not: null }
    },
    include: { user: true }
  });

  const leaderboard = new Map<string, { userId: string; name: string; totalSeconds: number }>();

  for (const session of sessions) {
    const key = session.userId;
    const existing = leaderboard.get(key);

    if (existing) {
      existing.totalSeconds += session.playedSeconds;
    } else {
      leaderboard.set(key, {
        userId: session.userId,
        name: `${session.user.firstName} ${session.user.lastName}`,
        totalSeconds: session.playedSeconds
      });
    }
  }

  const rows = [...leaderboard.values()]
    .map((entry) => ({
      ...entry,
      minutes: Math.round(entry.totalSeconds / 60)
    }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds)
    .slice(0, 10);

  return res.json(rows);
});

router.get('/weekly-by-game', async (req, res) => {
  const gameId = String(req.query.gameId ?? '');
  if (!gameId) {
    return res.status(400).json({ message: 'gameId is required' });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const sessions = await prisma.session.findMany({
    where: {
      gameId,
      startTime: { gte: sevenDaysAgo },
      endTime: { not: null }
    },
    include: { user: true }
  });

  const dayRows: Record<string, Record<string, number>> = {};

  for (let i = 0; i < 7; i += 1) {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    dayRows[key] = {};
  }

  for (const session of sessions) {
    const dayKey = session.startTime.toISOString().slice(0, 10);
    if (!dayRows[dayKey]) {
      dayRows[dayKey] = {};
    }
    const userName = `${session.user.firstName} ${session.user.lastName}`;
    const current = dayRows[dayKey]?.[userName] ?? 0;
    dayRows[dayKey][userName] = current + session.playedSeconds;
  }

  const data = Object.entries(dayRows).map(([date, values]) => {
    const row: Record<string, number | string> = { date };
    for (const [userName, seconds] of Object.entries(values)) {
      row[userName] = Math.round(seconds / 60);
    }
    return row;
  });

  return res.json(data);
});

export default router;
