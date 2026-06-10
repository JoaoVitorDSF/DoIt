import { Router } from 'express';
import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Admin } from '../entities/Admin';
import { Client } from '../entities/Client';
import { Todo, TodoStatus } from '../entities/Todo';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { hashPassword } from '../utils/password';
import { MoreThanOrEqual } from 'typeorm';

const router = Router();

// Apply authentication and admin requirement to all routes
router.use(authenticateToken, requireAdmin);

// Get all clients
router.get('/clients', async (req: AuthRequest, res: Response) => {
  try {
    const clientRepository = AppDataSource.getRepository(Client);
    const clients = await clientRepository.find({
      select: ['id', 'nome', 'sobrenome', 'email', 'createdAt', 'isBlocked', 'lastLoginAt']
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get own profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const adminRepository = AppDataSource.getRepository(Admin);
    const admin = await adminRepository.findOne({
      where: { id: req.userId },
      select: ['id', 'nome', 'sobrenome', 'email', 'profileImage', 'theme', 'createdAt']
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update own profile
router.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const { nome, sobrenome, profileImage, theme } = req.body;

    const adminRepository = AppDataSource.getRepository(Admin);
    const admin = await adminRepository.findOne({ where: { id: req.userId } });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    if (nome) admin.nome = nome;
    if (sobrenome) admin.sobrenome = sobrenome;
    if (profileImage !== undefined) admin.profileImage = profileImage;
    if (theme) admin.theme = theme;

    await adminRepository.save(admin);
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all admins
router.get('/admins', async (req: AuthRequest, res: Response) => {
  try {
    const adminRepository = AppDataSource.getRepository(Admin);
    const admins = await adminRepository.find({
      select: ['id', 'nome', 'sobrenome', 'email', 'createdAt']
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete client
router.delete('/clients/:id', async (req: AuthRequest, res: Response) => {
  try {
    const clientRepository = AppDataSource.getRepository(Client);
    const client = await clientRepository.findOne({ where: { id: parseInt(req.params.id) } });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await clientRepository.remove(client);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all todos (from all users)
router.get('/todos', async (req: AuthRequest, res: Response) => {
  try {
    const todoRepository = AppDataSource.getRepository(Todo);
    const todos = await todoRepository.find({
      relations: ['admin', 'client']
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create todo (as admin)
router.post('/todos', async (req: AuthRequest, res: Response) => {
  try {
    const { titulo, descricao, status, tipo, grupoId } = req.body;

    if (!titulo) {
      return res.status(400).json({ error: 'Titulo is required' });
    }

    const todoRepository = AppDataSource.getRepository(Todo);
    const adminRepository = AppDataSource.getRepository(Admin);
    const admin = await adminRepository.findOne({ where: { id: req.userId } });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const todo = todoRepository.create({
      titulo,
      descricao,
      status: status || TodoStatus.PENDING,
      tipo: tipo || 'individual',
      admin
    });

    await todoRepository.save(todo);
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update any todo
router.put('/todos/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { titulo, descricao, status } = req.body;
    const todoRepository = AppDataSource.getRepository(Todo);
    const todo = await todoRepository.findOne({ where: { id: parseInt(req.params.id) } });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
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

// Delete any todo
router.delete('/todos/:id', async (req: AuthRequest, res: Response) => {
  try {
    const todoRepository = AppDataSource.getRepository(Todo);
    const todo = await todoRepository.findOne({ where: { id: parseInt(req.params.id) } });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    todo.isDeleted = true;
    await todoRepository.save(todo);
    res.json({ message: 'Todo soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get todos by client ID
router.get('/clients/:id/todos', async (req: AuthRequest, res: Response) => {
  try {
    const todoRepository = AppDataSource.getRepository(Todo);
    const todos = await todoRepository.find({
      where: { client: { id: parseInt(req.params.id) } },
      relations: ['client']
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get online users (simulated - in production, use WebSocket or session tracking)
router.get('/statistics/online-users', async (req: AuthRequest, res: Response) => {
  try {
    const clientRepository = AppDataSource.getRepository(Client);
    const adminRepository = AppDataSource.getRepository(Admin);

    const clientCount = await clientRepository.count();
    const adminCount = await adminRepository.count();

    // In a real application, you would track active sessions
    // For now, we'll return all registered users as a placeholder
    res.json({
      totalClients: clientCount,
      totalAdmins: adminCount,
      totalUsers: clientCount + adminCount,
      onlineClients: clientCount, // Placeholder - implement actual session tracking
      onlineAdmins: adminCount // Placeholder - implement actual session tracking
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get keyword statistics from task names
router.get('/statistics/keywords', async (req: AuthRequest, res: Response) => {
  try {
    const todoRepository = AppDataSource.getRepository(Todo);
    const todos = await todoRepository.find({
      select: ['titulo']
    });

    const keywordMap = new Map<string, number>();

    todos.forEach(todo => {
      const words = todo.titulo.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 2) { // Ignore very short words
          keywordMap.set(word, (keywordMap.get(word) || 0) + 1);
        }
      });
    });

    const keywords = Array.from(keywordMap.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 keywords

    res.json({
      totalTasks: todos.length,
      topKeywords: keywords
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- NEW ANALYTICS ROUTES ---

router.get('/statistics/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const clientRepository = AppDataSource.getRepository(Client);
    const todoRepository = AppDataSource.getRepository(Todo);

    const totalUsers = await clientRepository.count();
    const totalTasks = await todoRepository.count();
    const completedTasks = await todoRepository.count({ where: { status: TodoStatus.COMPLETED } });
    
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) + '%' : '0%';

    // Most active users (by number of tasks)
    const clients = await clientRepository.find({ relations: ['todos'] });
    const activeUsers = clients.map(client => ({
        id: client.id,
        nome: `${client.nome} ${client.sobrenome}`,
        taskCount: client.todos ? client.todos.length : 0
    })).sort((a, b) => b.taskCount - a.taskCount).slice(0, 5);

    res.json({
      totalUsers,
      totalTasks,
      completedTasks,
      completionRate,
      activeUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/statistics/charts', async (req: AuthRequest, res: Response) => {
  try {
    const todoRepository = AppDataSource.getRepository(Todo);
    
    // Get tasks grouped by creation date (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const todos = await todoRepository.find({
        where: { createdAt: MoreThanOrEqual(sevenDaysAgo) }
    });

    const dailyMap = new Map<string, number>();
    // initialize last 7 days with 0
    for(let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyMap.set(d.toISOString().split('T')[0], 0);
    }

    todos.forEach(todo => {
        const dateStr = todo.createdAt.toISOString().split('T')[0];
        if (dailyMap.has(dateStr)) {
            dailyMap.set(dateStr, dailyMap.get(dateStr)! + 1);
        }
    });

    const dailyStats = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));

    // Blocked content metrics (Tasks flagged)
    const blockedCount = await todoRepository.count({ where: { isFlagged: true } });

    res.json({
      dailyStats,
      blockedContentTotal: blockedCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- NEW USER MANAGEMENT ROUTES ---

router.put('/clients/:id/block', async (req: AuthRequest, res: Response) => {
  try {
    const clientRepository = AppDataSource.getRepository(Client);
    const client = await clientRepository.findOne({ where: { id: parseInt(req.params.id) } });
    if (!client) return res.status(404).json({ error: 'Client not found' });

    client.isBlocked = !client.isBlocked;
    await clientRepository.save(client);
    res.json({ message: client.isBlocked ? 'Client blocked' : 'Client unblocked', isBlocked: client.isBlocked });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/clients/:id/reset-password', async (req: AuthRequest, res: Response) => {
  try {
    const clientRepository = AppDataSource.getRepository(Client);
    const client = await clientRepository.findOne({ where: { id: parseInt(req.params.id) } });
    if (!client) return res.status(404).json({ error: 'Client not found' });

    client.senha = await hashPassword('Mudar@123');
    await clientRepository.save(client);
    res.json({ message: 'Password reset to default (Mudar@123)' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/clients/:id/promote', async (req: AuthRequest, res: Response) => {
  try {
    const clientRepository = AppDataSource.getRepository(Client);
    const adminRepository = AppDataSource.getRepository(Admin);
    
    const client = await clientRepository.findOne({ where: { id: parseInt(req.params.id) } });
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const existingAdmin = await adminRepository.findOne({ where: { email: client.email } });
    if (existingAdmin) return res.status(400).json({ error: 'An admin with this email already exists' });

    const newAdmin = adminRepository.create({
      nome: client.nome,
      sobrenome: client.sobrenome,
      email: client.email,
      senha: client.senha,
      theme: client.theme,
      profileImage: client.profileImage
    });

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(newAdmin);
      await transactionalEntityManager.remove(client);
    });

    res.json({ message: 'Client promoted to Admin successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- NEW TASK MANAGEMENT ROUTES ---

router.put('/todos/:id/restore', async (req: AuthRequest, res: Response) => {
  try {
    const todoRepository = AppDataSource.getRepository(Todo);
    const todo = await todoRepository.findOne({ where: { id: parseInt(req.params.id) } });
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    todo.isDeleted = false;
    await todoRepository.save(todo);
    res.json({ message: 'Todo restored successfully', todo });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/todos/:id/flag', async (req: AuthRequest, res: Response) => {
  try {
    const todoRepository = AppDataSource.getRepository(Todo);
    const todo = await todoRepository.findOne({ where: { id: parseInt(req.params.id) } });
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    todo.isFlagged = !todo.isFlagged;
    await todoRepository.save(todo);
    res.json({ message: 'Todo flag toggled', isFlagged: todo.isFlagged });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
