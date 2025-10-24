"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const users_controller_1 = require("../controllers/users.controller");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validation/schemas");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const userIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
});
// Get all users (admin only)
router.get('/', auth_1.authenticated, auth_1.isAdmin, users_controller_1.getAllUsers);
// Get user by ID (admin or the user themselves)
router.get('/:id', auth_1.authenticated, auth_1.canAccessUser, (0, validate_1.validate)(userIdSchema), users_controller_1.getUserById);
// Update user profile (self or admin)
router.put('/:id', auth_1.authenticated, auth_1.canAccessUser, (0, validate_1.validate)(schemas_1.updateUserSchema), users_controller_1.updateUser);
// Delete user (admin only)
router.delete('/:id', auth_1.authenticated, auth_1.isAdmin, (0, validate_1.validate)(userIdSchema), users_controller_1.deleteUser);
exports.default = router;
