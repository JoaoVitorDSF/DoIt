import { Router } from 'express';
import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Todo, TodoStatus } from '../entities/Todo';
import { Client } from '../entities/Client';
import { authenticateToken, requireClient, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply authentication and client requirement to all routes
router.use(authenticateToken, requireClient);

// Get own todos
router.get('/todos', async (req: AuthRequest, res: Response) => {
  try {
    const todoRepository = AppDataSource.getRepository(Todo);
    const todos = await todoRepository.find({
      where: { 
        client: { id: req.userId },
        isFlagged: false,
        isDeleted: false
      },
      relations: ['client']
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notifications
router.get('/notifications', async (req: AuthRequest, res: Response) => {
  try {
    const todoRepository = AppDataSource.getRepository(Todo);
    const unnotifiedFlagged = await todoRepository.find({
      where: { 
        client: { id: req.userId }, 
        isFlagged: true, 
        isFlaggedNotified: false 
      }
    });

    if (unnotifiedFlagged.length > 0) {
      for (let todo of unnotifiedFlagged) {
        todo.isFlaggedNotified = true;
      }
      await todoRepository.save(unnotifiedFlagged);
    }
    
    res.json({ flaggedTasks: unnotifiedFlagged });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create todo
router.post('/todos', async (req: AuthRequest, res: Response) => {
  try {
    const { titulo, descricao, status, tipo, grupoId, dataInicio, dataExpiracao } = req.body;

    if (!titulo) {
      return res.status(400).json({ error: 'Titulo is required' });
    }

    const todoRepository = AppDataSource.getRepository(Todo);
    const clientRepository = AppDataSource.getRepository(Client);
    const client = await clientRepository.findOne({ where: { id: req.userId } });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const todo = new Todo();
    todo.titulo = titulo;
    todo.descricao = descricao;
    todo.status = status || TodoStatus.PENDING;
    todo.tipo = tipo || 'individual';
    todo.client = client;
    todo.dataInicio = dataInicio ? new Date(dataInicio) : null;
    todo.dataExpiracao = dataExpiracao ? new Date(dataExpiracao) : null;

    await todoRepository.save(todo);
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update own todo
router.put('/todos/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { titulo, descricao, status } = req.body;
    const todoRepository = AppDataSource.getRepository(Todo);
    const todo = await todoRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['client']
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (todo.client.id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (titulo) todo.titulo = titulo;
    if (descricao !== undefined) todo.descricao = descricao;
    if (status) todo.status = status;
    if (status === TodoStatus.COMPLETED) todo.completedAt = new Date();

    await todoRepository.save(todo);
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete own todo
router.patch('/todos/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const todoRepository = AppDataSource.getRepository(Todo);
    const todo = await todoRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['client']
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (todo.client.id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    todo.status = TodoStatus.COMPLETED;
    todo.completedAt = new Date();

    await todoRepository.save(todo);
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete own todo
router.delete('/todos/:id', async (req: AuthRequest, res: Response) => {
  try {
    const todoRepository = AppDataSource.getRepository(Todo);
    const todo = await todoRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['client']
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (todo.client.id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await todoRepository.remove(todo);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get own profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const clientRepository = AppDataSource.getRepository(Client);
    const client = await clientRepository.findOne({
      where: { id: req.userId },
      select: ['id', 'nome', 'sobrenome', 'email', 'profileImage', 'theme', 'createdAt']
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update own profile
router.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    console.log('Received profile update request');
    const { nome, sobrenome, profileImage, theme } = req.body;
    console.log('Profile image length:', profileImage?.length || 0);
    console.log('Theme:', theme);

    const clientRepository = AppDataSource.getRepository(Client);
    const client = await clientRepository.findOne({ where: { id: req.userId } });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (nome) client.nome = nome;
    if (sobrenome) client.sobrenome = sobrenome;
    if (profileImage !== undefined) client.profileImage = profileImage;
    if (theme) client.theme = theme;

    console.log('Saving client...');
    await clientRepository.save(client);
    console.log('Client saved successfully');
    res.json(client);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
