"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const projects_controller_1 = require("../controllers/projects.controller");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Project CRUD routes
router.get('/', auth_1.authenticated, projects_controller_1.getAllProjects);
router.post('/', auth_1.authenticated, (0, validate_1.validate)(schemas_1.createProjectSchema), projects_controller_1.createProject);
router.get('/:id', auth_1.authenticated, auth_1.canAccessProject, (0, validate_1.validate)(schemas_1.projectIdSchema), projects_controller_1.getProjectById);
router.put('/:id', auth_1.authenticated, auth_1.canModifyProject, (0, validate_1.validate)(schemas_1.updateProjectSchema), projects_controller_1.updateProject);
router.delete('/:id', auth_1.authenticated, auth_1.isAdmin, (0, validate_1.validate)(schemas_1.projectIdSchema), projects_controller_1.deleteProject);
// Student-Project relationship routes
router.get('/:id/students', auth_1.authenticated, auth_1.canAccessProject, (0, validate_1.validate)(schemas_1.projectIdSchema), projects_controller_1.getProjectStudents);
router.post('/:id/students', auth_1.authenticated, auth_1.canModifyProject, (0, validate_1.validate)(schemas_1.addStudentToProjectSchema), projects_controller_1.addStudentToProject);
router.delete('/:id/students/:studentId', auth_1.authenticated, auth_1.canModifyProject, (0, validate_1.validate)(schemas_1.removeStudentFromProjectSchema), projects_controller_1.removeStudentFromProject);
router.put('/:id/students', auth_1.authenticated, auth_1.canModifyProject, (0, validate_1.validate)(schemas_1.updateProjectStudentsSchema), projects_controller_1.updateProjectStudents);
exports.default = router;
