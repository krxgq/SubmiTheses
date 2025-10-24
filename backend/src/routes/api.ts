import { Router } from 'express'
import userRoutes from './users.route'
import projectRoutes from './projects.route'
import reviewRoutes from './reviews.route'
import externalLinksRoutes from './external-links.route'
import gradesRoutes from './grades.route'
import rolesRoutes from './roles.route'
import scalesRoutes from './scales.route'
import yearsRoutes from './years.route'
import attachmentsRoutes from './attachments.route'

const apiRouter = Router()

apiRouter.use('/users', userRoutes)
apiRouter.use('/projects', projectRoutes)
apiRouter.use('/roles', rolesRoutes)
apiRouter.use('/scales', scalesRoutes)
apiRouter.use('/years', yearsRoutes)

// Project-related nested routes
apiRouter.use('/projects', reviewRoutes)
apiRouter.use('/projects', externalLinksRoutes)
apiRouter.use('/projects', gradesRoutes)
apiRouter.use('/projects', attachmentsRoutes)

export default apiRouter
