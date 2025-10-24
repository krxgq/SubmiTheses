"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const roles_controller_1 = require("../controllers/roles.controller");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Get all roles
router.get('/', auth_1.authenticated, roles_controller_1.getAllRoles);
// Get a specific role
router.get('/:id', auth_1.authenticated, (0, validate_1.validate)(schemas_1.roleIdSchema), roles_controller_1.getRoleById);
// Create a new role
router.post('/', auth_1.authenticated, auth_1.isAdmin, (0, validate_1.validate)(schemas_1.createRoleSchema), roles_controller_1.createRole);
// Update a role
router.put('/:id', auth_1.authenticated, auth_1.isAdmin, (0, validate_1.validate)(schemas_1.updateRoleSchema), roles_controller_1.updateRole);
// Delete a role
router.delete('/:id', auth_1.authenticated, auth_1.isAdmin, (0, validate_1.validate)(schemas_1.roleIdSchema), roles_controller_1.deleteRole);
exports.default = router;
