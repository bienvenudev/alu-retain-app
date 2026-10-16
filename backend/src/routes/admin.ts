import { Router } from 'express'

import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { adminCategoriesRouter } from './adminCategories.js'
import { adminInsightsRouter } from './adminInsights.js'

// Everything mounted here requires a signed-in administrator.
export const adminRouter = Router()

adminRouter.use(requireAuth, requireAdmin)
adminRouter.use('/categories', adminCategoriesRouter)
adminRouter.use('/insights', adminInsightsRouter)
