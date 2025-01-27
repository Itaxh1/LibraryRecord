const { Router } = require('express')

const userRouter = require('./user')
const courseRouter = require('./courses')
const SubmissionRouter = require('./submission')
const AssignmentRouter = require('./assignment')
// const AuthRouter = require('./login');
const router = Router()


router.use('/users', userRouter)
router.use('/courses', courseRouter)
router.use('/submission', SubmissionRouter)
router.use('/assignment', AssignmentRouter)
// router.use('/login',AuthRouter)


module.exports = router
