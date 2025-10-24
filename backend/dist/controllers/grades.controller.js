"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectGrades = getProjectGrades;
exports.getGradeById = getGradeById;
exports.createGrade = createGrade;
exports.updateGrade = updateGrade;
exports.deleteGrade = deleteGrade;
const grades_service_1 = require("../services/grades.service");
async function getProjectGrades(req, res) {
    try {
        const projectId = BigInt(req.params.id);
        const grades = await grades_service_1.GradeService.getGradesByProjectId(projectId);
        return res.status(200).json(grades);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch grades' });
    }
}
async function getGradeById(req, res) {
    try {
        const id = BigInt(req.params.gradeId);
        const grade = await grades_service_1.GradeService.getGradeById(id);
        if (!grade) {
            return res.status(404).json({ error: 'Grade not found' });
        }
        return res.status(200).json(grade);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch grade' });
    }
}
async function createGrade(req, res) {
    try {
        const projectId = BigInt(req.params.id);
        const grade = await grades_service_1.GradeService.createGrade({
            project_id: projectId,
            reviewer_id: req.body.reviewer_id,
            value: BigInt(req.body.value),
            year_id: BigInt(req.body.year_id),
            scale_id: req.body.scale_id ? BigInt(req.body.scale_id) : undefined,
        });
        return res.status(201).json(grade);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create grade' });
    }
}
async function updateGrade(req, res) {
    try {
        const id = BigInt(req.params.gradeId);
        const grade = await grades_service_1.GradeService.updateGrade(id, {
            value: BigInt(req.body.value),
            scale_id: req.body.scale_id ? BigInt(req.body.scale_id) : undefined,
        });
        if (!grade) {
            return res.status(404).json({ error: 'Grade not found' });
        }
        return res.status(200).json(grade);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update grade' });
    }
}
async function deleteGrade(req, res) {
    try {
        const id = BigInt(req.params.gradeId);
        const deleted = await grades_service_1.GradeService.deleteGrade(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Grade not found' });
        }
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to delete grade' });
    }
}
