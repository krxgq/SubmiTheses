import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// Load the OpenAPI spec
const openApiSpec = YAML.load(path.join(__dirname, '../../openapi.yaml'));

export const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SumbiTheses API Documentation',
};

export { openApiSpec, swaggerUi };