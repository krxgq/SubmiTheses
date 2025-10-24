"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllYears = getAllYears;
exports.getYearById = getYearById;
exports.createYear = createYear;
exports.updateYear = updateYear;
exports.deleteYear = deleteYear;
const years_service_1 = require("../services/years.service");
async function getAllYears(req, res) {
    try {
        const years = await years_service_1.YearService.getAllYears();
        return res.status(200).json(years);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch years' });
    }
}
async function getYearById(req, res) {
    try {
        const id = BigInt(req.params.id);
        const year = await years_service_1.YearService.getYearById(id);
        if (!year) {
            return res.status(404).json({ error: 'Year not found' });
        }
        return res.status(200).json(year);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch year' });
    }
}
async function createYear(req, res) {
    try {
        const year = await years_service_1.YearService.createYear({
            assignment_date: new Date(req.body.assignment_date),
            submission_date: new Date(req.body.submission_date),
            feedback_date: new Date(req.body.feedback_date),
        });
        return res.status(201).json(year);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create year' });
    }
}
async function updateYear(req, res) {
    try {
        const id = BigInt(req.params.id);
        const year = await years_service_1.YearService.updateYear(id, {
            assignment_date: req.body.assignment_date ? new Date(req.body.assignment_date) : undefined,
            submission_date: req.body.submission_date ? new Date(req.body.submission_date) : undefined,
            feedback_date: req.body.feedback_date ? new Date(req.body.feedback_date) : undefined,
        });
        if (!year) {
            return res.status(404).json({ error: 'Year not found' });
        }
        return res.status(200).json(year);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update year' });
    }
}
async function deleteYear(req, res) {
    try {
        const id = BigInt(req.params.id);
        const deleted = await years_service_1.YearService.deleteYear(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Year not found' });
        }
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to delete year' });
    }
}
