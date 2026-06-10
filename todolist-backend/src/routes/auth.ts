import { Router } from 'express';
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Admin } from '../entities/Admin';
import { Client } from '../entities/Client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/email';

const router = Router();

// Admin Registration
router.post('/admin/register', async (req: Request, res: Response) => {
  try {
    const { nome, sobrenome, email, senha, celular } = req.body;

    if (!nome || !sobrenome || !email || !senha || !celular) {
      return res.status(400).json({ error: 'Nome, sobrenome, email, senha, and celular are required' });
    }

    const adminRepository = AppDataSource.getRepository(Admin);
    const existingEmail = await adminRepository.findOne({ where: { email } });
    
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await hashPassword(senha);
    const admin = adminRepository.create({ nome, sobrenome, email, senha: hashedPassword, celular });
    await adminRepository.save(admin);

    const token = generateToken(admin.id, 'admin');
    res.status(201).json({ token, userType: 'admin', userId: admin.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Login
router.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email and senha are required' });
    }

    const adminRepository = AppDataSource.getRepository(Admin);
    const admin = await adminRepository.findOne({ where: { email } });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await comparePassword(senha, admin.senha);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (admin.isBlocked) {
      return res.status(403).json({ error: 'Account is blocked' });
    }

    admin.lastLoginAt = new Date();
    await adminRepository.save(admin);

    const token = generateToken(admin.id, 'admin');
    res.json({ token, userType: 'admin', userId: admin.id, nome: admin.nome, email: admin.email, profileImage: admin.profileImage, theme: admin.theme });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Client Registration
router.post('/client/register', async (req: Request, res: Response) => {
  try {
    const { nome, sobrenome, email, senha } = req.body;

    if (!nome || !sobrenome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, sobrenome, email, and senha are required' });
    }

    const clientRepository = AppDataSource.getRepository(Client);
    const existingEmail = await clientRepository.findOne({ where: { email } });

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await hashPassword(senha);
    const client = clientRepository.create({
      nome,
      sobrenome,
      email,
      senha: hashedPassword,
      emailVerified: true,
    });
    await clientRepository.save(client);

    const token = generateToken(client.id, 'client');
    res.status(201).json({ token, userType: 'client', userId: client.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Client Login
router.post('/client/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email and senha are required' });
    }

    const clientRepository = AppDataSource.getRepository(Client);
    const client = await clientRepository.findOne({ where: { email } });

    if (!client) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await comparePassword(senha, client.senha);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (client.isBlocked) {
      return res.status(403).json({ error: 'Account is blocked' });
    }

    client.lastLoginAt = new Date();
    await clientRepository.save(client);

    const token = generateToken(client.id, 'client');
    res.json({ token, userType: 'client', userId: client.id, nome: client.nome, email: client.email, profileImage: client.profileImage, theme: client.theme });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email Confirmation
router.get('/confirm/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const clientRepository = AppDataSource.getRepository(Client);
    const client = await clientRepository.findOne({ where: { verificationToken: token } });

    if (!client) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    client.emailVerified = true;
    client.verificationToken = null;
    await clientRepository.save(client);

    const jwtToken = generateToken(client.id, 'client');
    res.json({
      message: 'Email verified successfully',
      token: jwtToken,
      userType: 'client',
      userId: client.id,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
