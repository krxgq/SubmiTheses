"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const years_controller_1 = require("../controllers/years.controller");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Get all years
router.get('/', auth_1.authenticated, years_controller_1.getAllYears);
// Get a specific year
router.get('/:id', auth_1.authenticated, (0, validate_1.validate)(schemas_1.yearIdSchema), years_controller_1.getYearById);
// Create a new year
router.post('/', auth_1.authenticated, auth_1.isAdmin, (0, validate_1.validate)(schemas_1.createYearSchema), years_controller_1.createYear);
// Update a year
router.put('/:id', auth_1.authenticated, auth_1.isAdmin, (0, validate_1.validate)(schemas_1.updateYearSchema), years_controller_1.updateYear);
// Delete a year
router.delete('/:id', auth_1.authenticated, auth_1.isAdmin, (0, validate_1.validate)(schemas_1.yearIdSchema), years_controller_1.deleteYear);
exports.default = router;
