import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { AppDataSource } from './config/database';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import clientRoutes from './routes/client';
import grupoRoutes from './routes/grupo';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../../todolist-frontend/html')));
app.use('/dist', express.static(path.join(__dirname, '../../todolist-frontend/dist')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/grupo', grupoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../todolist-frontend/html/index/index.html'));
});

// Serve other pages
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../../todolist-frontend/html/login/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../../todolist-frontend/html/register/register.html'));
});

app.get('/admin-register', (req, res) => {
  res.sendFile(path.join(__dirname, '../../todolist-frontend/html/admin-register/admin-register.html'));
});

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../../todolist-frontend/html/admin-login/admin-login.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../../todolist-frontend/html/admin-dashboard/admin-dashboard.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../../todolist-frontend/html/dashboard/dashboard.html'));
});

// Initialize database and start server
AppDataSource.initialize()
  .then(async () => {
    console.log('Database connected successfully');
    
    // Alter profileImage column to LONGTEXT type to support larger images
    try {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.query(`
        ALTER TABLE Client MODIFY COLUMN profileImage LONGTEXT NULL;
      `);
      console.log('Client profileImage column altered to LONGTEXT');
      await queryRunner.query(`
        ALTER TABLE Admin MODIFY COLUMN profileImage LONGTEXT NULL;
      `);
      console.log('Admin profileImage column altered to LONGTEXT');
      await queryRunner.release();
    } catch (error) {
      console.log('Column alteration skipped (may already be LONGTEXT or column does not exist):', error);
    }

    // Add theme column if it doesn't exist
    try {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.query(`
        ALTER TABLE Client ADD COLUMN theme VARCHAR(20) DEFAULT 'light';
      `);
      console.log('Client theme column added');
      await queryRunner.query(`
        ALTER TABLE Admin ADD COLUMN theme VARCHAR(20) DEFAULT 'light';
      `);
      console.log('Admin theme column added');
      await queryRunner.release();
    } catch (error) {
      console.log('Theme column addition skipped (may already exist):', error);
    }
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });
