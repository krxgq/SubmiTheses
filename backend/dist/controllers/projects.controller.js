"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProjects = getAllProjects;
exports.getProjectById = getProjectById;
exports.createProject = createProject;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.getProjectStudents = getProjectStudents;
exports.addStudentToProject = addStudentToProject;
exports.removeStudentFromProject = removeStudentFromProject;
exports.updateProjectStudents = updateProjectStudents;
const projects_service_1 = require("../services/projects.service");
async function getAllProjects(req, res) {
    try {
        const projects = await projects_service_1.ProjectService.getAllProjects();
        return res.status(200).json(projects);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch projects' });
    }
}
async function getProjectById(req, res) {
    try {
        const id = BigInt(req.params.id);
        const project = await projects_service_1.ProjectService.getProjectById(id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        return res.status(200).json(project);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch project' });
    }
}
async function createProject(req, res) {
    try {
        const project = await projects_service_1.ProjectService.createProject(req.body);
        return res.status(201).json(project);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create project' });
    }
}
async function updateProject(req, res) {
    try {
        const id = BigInt(req.params.id);
        const project = await projects_service_1.ProjectService.updateProject(id, req.body);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        return res.status(200).json(project);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update project' });
    }
}
async function deleteProject(req, res) {
    try {
        const id = BigInt(req.params.id);
        const deleted = await projects_service_1.ProjectService.deleteProject(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Project not found' });
        }
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to delete project' });
    }
}
async function getProjectStudents(req, res) {
    try {
        const projectId = BigInt(req.params.id);
        const students = await projects_service_1.ProjectService.getProjectStudents(projectId);
        return res.status(200).json(students);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch project students' });
    }
}
async function addStudentToProject(req, res) {
    try {
        const projectId = BigInt(req.params.id);
        const studentId = BigInt(req.body.studentId);
        const projectStudent = await projects_service_1.ProjectService.addStudentToProject(projectId, studentId);
        return res.status(201).json(projectStudent);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to add student to project' });
    }
}
async function removeStudentFromProject(req, res) {
    try {
        const projectId = BigInt(req.params.id);
        const studentId = BigInt(req.params.studentId);
        const removed = await projects_service_1.ProjectService.removeStudentFromProject(projectId, studentId);
        if (!removed) {
            return res.status(404).json({ error: 'Student not found in project' });
        }
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to remove student from project' });
    }
}
async function updateProjectStudents(req, res) {
    try {
        const projectId = BigInt(req.params.id);
        const studentIds = req.body.studentIds.map((id) => BigInt(id));
        const students = await projects_service_1.ProjectService.updateProjectStudents(projectId, studentIds);
        return res.status(200).json(students);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update project students' });
    }
}
