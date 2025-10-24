"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllScales = getAllScales;
exports.getScaleById = getScaleById;
exports.createScale = createScale;
exports.updateScale = updateScale;
exports.deleteScale = deleteScale;
const scales_service_1 = require("../services/scales.service");
async function getAllScales(req, res) {
    try {
        const scales = await scales_service_1.ScaleService.getAllScales();
        return res.status(200).json(scales);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch scales' });
    }
}
async function getScaleById(req, res) {
    try {
        const id = BigInt(req.params.id);
        const scale = await scales_service_1.ScaleService.getScaleById(id);
        if (!scale) {
            return res.status(404).json({ error: 'Scale not found' });
        }
        return res.status(200).json(scale);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch scale' });
    }
}
async function createScale(req, res) {
    try {
        const scale = await scales_service_1.ScaleService.createScale({
            name: req.body.name,
            desc: req.body.desc,
            maxVal: BigInt(req.body.maxVal),
        });
        return res.status(201).json(scale);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create scale' });
    }
}
async function updateScale(req, res) {
    try {
        const id = BigInt(req.params.id);
        const scale = await scales_service_1.ScaleService.updateScale(id, {
            name: req.body.name,
            desc: req.body.desc,
            maxVal: req.body.maxVal ? BigInt(req.body.maxVal) : undefined,
        });
        if (!scale) {
            return res.status(404).json({ error: 'Scale not found' });
        }
        return res.status(200).json(scale);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update scale' });
    }
}
async function deleteScale(req, res) {
    try {
        const id = BigInt(req.params.id);
        const deleted = await scales_service_1.ScaleService.deleteScale(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Scale not found' });
        }
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to delete scale' });
    }
}
