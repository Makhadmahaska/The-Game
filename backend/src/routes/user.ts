import { Router } from 'express';
import { prisma } from '../prismaClient';
import { createUserSchema } from '../validation/userV';

const router = Router();

router.post('/', async (req, res) => {
  const { email, firstName, lastName, profilePictureUrl } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const user = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      profilePictureUrl: profilePictureUrl || null
    }
  });

  return res.status(201).json(user);
});

router.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(users);
});

router.get('/search', async (req, res) => {
  const q = String(req.query.q ?? '').trim();

  if (!q) {
    return res.json([]);
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } }
      ]
    },
    take: 20
  });

  return res.json(users);
});

export default router;