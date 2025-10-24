"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const scales_controller_1 = require("../controllers/scales.controller");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Get all scales
router.get('/', auth_1.authenticated, scales_controller_1.getAllScales);
// Get a specific scale
router.get('/:id', auth_1.authenticated, (0, validate_1.validate)(schemas_1.scaleIdSchema), scales_controller_1.getScaleById);
// Create a new scale
router.post('/', auth_1.authenticated, auth_1.isAdmin, (0, validate_1.validate)(schemas_1.createScaleSchema), scales_controller_1.createScale);
// Update a scale
router.put('/:id', auth_1.authenticated, auth_1.isAdmin, (0, validate_1.validate)(schemas_1.updateScaleSchema), scales_controller_1.updateScale);
// Delete a scale
router.delete('/:id', auth_1.authenticated, auth_1.isAdmin, (0, validate_1.validate)(schemas_1.scaleIdSchema), scales_controller_1.deleteScale);
exports.default = router;
