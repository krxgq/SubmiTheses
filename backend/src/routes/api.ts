import { Router } from 'express'
import authRoutes from './auth.route'
import userRoutes from './users.route'
import projectRoutes from './projects.route'
import reviewRoutes from './reviews.route'
import externalLinksRoutes from './external-links.route'
import gradesRoutes from './grades.route'
import scalesRoutes from './scales.route'
import scaleSetRoutes from './scale-sets.route'
import yearsRoutes from './years.route'
import attachmentsRoutes from './attachments.route'
import subjectsRoutes from './subjects.route'
import notificationsRoutes from './notifications.route'

const apiRouter = Router()

// Auth routes (no auth required for login/register)
apiRouter.use('/auth', authRoutes)

apiRouter.use('/users', userRoutes)
apiRouter.use('/projects', projectRoutes)
apiRouter.use('/subjects', subjectsRoutes)
apiRouter.use('/scales', scalesRoutes)
apiRouter.use('/scale-sets', scaleSetRoutes)
apiRouter.use('/years', yearsRoutes)
apiRouter.use('/notifications', notificationsRoutes)

// Project-related nested routes
apiRouter.use('/projects', reviewRoutes)
apiRouter.use('/projects', externalLinksRoutes)
apiRouter.use('/projects', gradesRoutes)
apiRouter.use('/projects', attachmentsRoutes)

export default apiRouter
