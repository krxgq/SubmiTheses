"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_route_1 = __importDefault(require("./users.route"));
const projects_route_1 = __importDefault(require("./projects.route"));
const reviews_route_1 = __importDefault(require("./reviews.route"));
const external_links_route_1 = __importDefault(require("./external-links.route"));
const grades_route_1 = __importDefault(require("./grades.route"));
const roles_route_1 = __importDefault(require("./roles.route"));
const scales_route_1 = __importDefault(require("./scales.route"));
const years_route_1 = __importDefault(require("./years.route"));
const attachments_route_1 = __importDefault(require("./attachments.route"));
const apiRouter = (0, express_1.Router)();
apiRouter.use('/users', users_route_1.default);
apiRouter.use('/projects', projects_route_1.default);
apiRouter.use('/roles', roles_route_1.default);
apiRouter.use('/scales', scales_route_1.default);
apiRouter.use('/years', years_route_1.default);
// Project-related nested routes
apiRouter.use('/projects', reviews_route_1.default);
apiRouter.use('/projects', external_links_route_1.default);
apiRouter.use('/projects', grades_route_1.default);
apiRouter.use('/projects', attachments_route_1.default);
exports.default = apiRouter;
