"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUi = exports.openApiSpec = exports.swaggerUiOptions = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
exports.swaggerUi = swagger_ui_express_1.default;
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
// Load the OpenAPI spec
const openApiSpec = yamljs_1.default.load(path_1.default.join(__dirname, '../../openapi.yaml'));
exports.openApiSpec = openApiSpec;
exports.swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SumbiTheses API Documentation',
};
