import { Router } from 'express'
import userRoutes from './users.route'
import schoolRoutes from './schools.route'
import projectRoutes from './projects.route'

const apiRouter = Router()

apiRouter.use('/users', userRoutes)
apiRouter.use('/schools', schoolRoutes)
apiRouter.use('/projects', projectRoutes)

export default apiRouter
