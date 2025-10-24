"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const users_service_1 = require("../services/users.service");
async function getAllUsers(req, res) {
    try {
        const users = await users_service_1.UserService.getAllUsers();
        return res.status(200).json(users);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
}
async function getUserById(req, res) {
    try {
        const id = req.params.id;
        const user = await users_service_1.UserService.getUserById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch user' });
    }
}
async function updateUser(req, res) {
    try {
        const id = req.params.id;
        const updatedUser = await users_service_1.UserService.updateUser(id, req.body);
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(updatedUser);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update user' });
    }
}
async function deleteUser(req, res) {
    try {
        const id = req.params.id;
        const deleted = await users_service_1.UserService.deleteUser(id);
        if (!deleted) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to delete user' });
    }
}
