"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const api_1 = __importDefault(require("./routes/api"));
const docs_1 = require("./config/docs");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.json({ message: 'Backend API is running!' });
});
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// API Documentation
app.use('/api-docs', docs_1.swaggerUi.serve, docs_1.swaggerUi.setup(docs_1.openApiSpec, docs_1.swaggerUiOptions));
// Serve the OpenAPI spec as JSON
app.get('/api-docs.json', (req, res) => {
    res.json(docs_1.openApiSpec);
});
app.use('/api', api_1.default);
// 404 handler - must be after all routes
app.use((_req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});
// Error handler - must be last
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
exports.default = app;
