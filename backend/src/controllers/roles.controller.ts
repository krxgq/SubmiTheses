import { Request, Response } from 'express';
import { RoleService } from '../services/roles.service';

export async function getAllRoles(req: Request, res: Response) {
  try {
    const roles = await RoleService.getAllRoles();
    return res.status(200).json(roles);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch roles' });
  }
}

export async function getRoleById(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.id);
    const role = await RoleService.getRoleById(id);

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    return res.status(200).json(role);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch role' });
  }
}

export async function createRole(req: Request, res: Response) {
  try {
    const role = await RoleService.createRole({
      name: req.body.name,
      description: req.body.description,
    });

    return res.status(201).json(role);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create role' });
  }
}

export async function updateRole(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.id);

    const role = await RoleService.updateRole(id, {
      name: req.body.name,
      description: req.body.description,
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    return res.status(200).json(role);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update role' });
  }
}

export async function deleteRole(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.id);
    const deleted = await RoleService.deleteRole(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Role not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete role' });
  }
}
