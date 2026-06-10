import { Router } from 'express';
import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Grupo } from '../entities/Grupo';
import { UsuarioGrupo } from '../entities/UsuarioGrupo';
import { Client } from '../entities/Client';
import { Admin } from '../entities/Admin';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Create group
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Nome is required' });
    }

    const grupoRepository = AppDataSource.getRepository(Grupo);
    const clientRepository = AppDataSource.getRepository(Client);
    const adminRepository = AppDataSource.getRepository(Admin);

    let administrador;
    if (req.userType === 'client') {
      administrador = await clientRepository.findOne({ where: { id: req.userId } });
    } else {
      administrador = await adminRepository.findOne({ where: { id: req.userId } });
    }

    if (!administrador) {
      return res.status(404).json({ error: 'User not found' });
    }

    const grupo = grupoRepository.create();
    grupo.nome = nome;
    grupo.descricao = descricao;
    if (req.userType === 'client') {
      grupo.administradorCliente = administrador as Client;
    } else {
      grupo.administradorAdmin = administrador as Admin;
    }

    await grupoRepository.save(grupo);

    // Add the administrator as a member
    const usuarioGrupoRepository = AppDataSource.getRepository(UsuarioGrupo);
    const usuarioGrupo = new UsuarioGrupo();
    usuarioGrupo.grupo = grupo;
    if (req.userType === 'client') {
      usuarioGrupo.cliente = administrador as Client;
    } else {
      usuarioGrupo.admin = administrador as Admin;
    }
    await usuarioGrupoRepository.save(usuarioGrupo);

    res.status(201).json(grupo);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's groups
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const usuarioGrupoRepository = AppDataSource.getRepository(UsuarioGrupo);
    const grupos = await usuarioGrupoRepository.find({
      where: req.userType === 'client' 
        ? { cliente: { id: req.userId } }
        : { admin: { id: req.userId } },
      relations: ['grupo', 'grupo.administradorCliente', 'grupo.administradorAdmin']
    });

    res.json(grupos.map(ug => ug.grupo));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get group details
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const grupoRepository = AppDataSource.getRepository(Grupo);
    const grupo = await grupoRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['administradorCliente', 'administradorAdmin', 'membros', 'membros.cliente', 'membros.admin']
    });

    if (!grupo) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(grupo);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add member to group (only administrator can add)
router.post('/:id/members', async (req: AuthRequest, res: Response) => {
  try {
    const { userId, userType } = req.body;

    if (!userId || !userType) {
      return res.status(400).json({ error: 'UserId and userType are required' });
    }

    const grupoRepository = AppDataSource.getRepository(Grupo);
    const grupo = await grupoRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['administradorCliente', 'administradorAdmin']
    });

    if (!grupo) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is administrator
    const isAdmin = (req.userType === 'client' && grupo.administradorCliente?.id === req.userId) ||
                    (req.userType === 'admin' && grupo.administradorAdmin?.id === req.userId);

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only group administrator can add members' });
    }

    const usuarioGrupoRepository = AppDataSource.getRepository(UsuarioGrupo);
    const clientRepository = AppDataSource.getRepository(Client);
    const adminRepository = AppDataSource.getRepository(Admin);

    let clientUser: Client | null = null;
    let adminUser: Admin | null = null;

    if (userType === 'client') {
      clientUser = await clientRepository.findOne({ where: { id: userId } });
    } else {
      adminUser = await adminRepository.findOne({ where: { id: userId } });
    }

    if (!clientUser && !adminUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    const existingMember = await usuarioGrupoRepository.findOne({
      where: {
        grupo: { id: grupo.id },
        ...(userType === 'client' ? { cliente: { id: userId } } : { admin: { id: userId } })
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    const usuarioGrupo = new UsuarioGrupo();
    usuarioGrupo.grupo = grupo;
    if (userType === 'client' && clientUser) {
      usuarioGrupo.cliente = clientUser;
    } else if (adminUser) {
      usuarioGrupo.admin = adminUser;
    }

    await usuarioGrupoRepository.save(usuarioGrupo);
    res.status(201).json(usuarioGrupo);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove member from group (only administrator can remove)
router.delete('/:id/members/:memberId', async (req: AuthRequest, res: Response) => {
  try {
    const grupoRepository = AppDataSource.getRepository(Grupo);
    const grupo = await grupoRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['administradorCliente', 'administradorAdmin']
    });

    if (!grupo) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is administrator
    const isAdmin = (req.userType === 'client' && grupo.administradorCliente?.id === req.userId) ||
                    (req.userType === 'admin' && grupo.administradorAdmin?.id === req.userId);

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only group administrator can remove members' });
    }

    const usuarioGrupoRepository = AppDataSource.getRepository(UsuarioGrupo);
    const member = await usuarioGrupoRepository.findOne({
      where: { id: parseInt(req.params.memberId) }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    await usuarioGrupoRepository.remove(member);
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete group (only administrator can delete)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const grupoRepository = AppDataSource.getRepository(Grupo);
    const grupo = await grupoRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['administradorCliente', 'administradorAdmin']
    });

    if (!grupo) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is administrator
    const isAdmin = (req.userType === 'client' && grupo.administradorCliente?.id === req.userId) ||
                    (req.userType === 'admin' && grupo.administradorAdmin?.id === req.userId);

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only group administrator can delete the group' });
    }

    await grupoRepository.remove(grupo);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
