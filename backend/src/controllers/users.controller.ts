import { Request, Response } from 'express';
import { UserService } from '../services/users.service';

export async function createUser(req: Request, res: Response) {
  const user = await UserService.createUser(req.body);
  return res.status(201).json(user);
}

export async function getAllUsers(req: Request, res: Response) {
  const users = await UserService.getAllUsers();
  return res.status(200).json(users);
}

export async function getUserById(req: Request, res: Response) {
  const id = BigInt(req.params.id);
  const user = await UserService.getUserById(id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json(user);
}

export async function updateUser(req: Request, res: Response) {
  const id = BigInt(req.params.id);
  const updatedUser = await UserService.updateUser(id, req.body);

  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json(updatedUser);
}

export async function deleteUser(req: Request, res: Response) {
  const id = BigInt(req.params.id);
  const deleted = await UserService.deleteUser(id);

  if (!deleted) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({ message: 'User deleted successfully' });
}
