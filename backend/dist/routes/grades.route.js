"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const grades_controller_1 = require("../controllers/grades.controller");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Get all grades for a project
router.get('/:id/grades', auth_1.authenticated, auth_1.canAccessProject, (0, validate_1.validate)(schemas_1.projectIdSchema), grades_controller_1.getProjectGrades);
// Get a specific grade
router.get('/:id/grades/:gradeId', auth_1.authenticated, auth_1.canAccessProject, (0, validate_1.validate)(schemas_1.gradeIdSchema), grades_controller_1.getGradeById);
// Create a new grade
router.post('/:id/grades', auth_1.authenticated, auth_1.canModifyProject, (0, validate_1.validate)(schemas_1.createGradeSchema), grades_controller_1.createGrade);
// Update a grade
router.put('/:id/grades/:gradeId', auth_1.authenticated, auth_1.canModifyProject, (0, validate_1.validate)(schemas_1.updateGradeSchema), grades_controller_1.updateGrade);
// Delete a grade
router.delete('/:id/grades/:gradeId', auth_1.authenticated, auth_1.canModifyProject, (0, validate_1.validate)(schemas_1.gradeIdSchema), grades_controller_1.deleteGrade);
exports.default = router;
