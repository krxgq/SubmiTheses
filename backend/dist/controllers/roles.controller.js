"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRoles = getAllRoles;
exports.getRoleById = getRoleById;
exports.createRole = createRole;
exports.updateRole = updateRole;
exports.deleteRole = deleteRole;
const roles_service_1 = require("../services/roles.service");
async function getAllRoles(req, res) {
    try {
        const roles = await roles_service_1.RoleService.getAllRoles();
        return res.status(200).json(roles);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch roles' });
    }
}
async function getRoleById(req, res) {
    try {
        const id = BigInt(req.params.id);
        const role = await roles_service_1.RoleService.getRoleById(id);
        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }
        return res.status(200).json(role);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch role' });
    }
}
async function createRole(req, res) {
    try {
        const role = await roles_service_1.RoleService.createRole({
            name: req.body.name,
            description: req.body.description,
        });
        return res.status(201).json(role);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create role' });
    }
}
async function updateRole(req, res) {
    try {
        const id = BigInt(req.params.id);
        const role = await roles_service_1.RoleService.updateRole(id, {
            name: req.body.name,
            description: req.body.description,
        });
        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }
        return res.status(200).json(role);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update role' });
    }
}
async function deleteRole(req, res) {
    try {
        const id = BigInt(req.params.id);
        const deleted = await roles_service_1.RoleService.deleteRole(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Role not found' });
        }
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to delete role' });
    }
}
