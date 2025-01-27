const { Router } = require('express');
const { ObjectId } = require('mongodb');
const router = Router();

const { validateAgainstSchema } = require('../lib/validation');
const { requireAuthentication } = require('../lib/auth');
const Course = require('../models/course');
const Assignment = require('../models/assignment')
const Enrollment = require('../models/enrollment');
const User = require('../models/user');
const fs = require('fs');
const { stringify } = require('csv-stringify');
/*
 * GET /courses - Route to fetch a paginated list of courses.
 */
router.get('/', requireAuthentication, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const coursesPage = await Course.getCoursesPage(page);
        res.status(200).json(coursesPage);
    } catch (err) {
        next(err);
    }
});

/*
 * POST /courses - Route to create a new course.
 */
router.post('/', requireAuthentication, async (req, res, next) => {
    try {
        if (req.role !== 'admin') {
            res.status(403).json({ error: "Unauthorized to create a course" });
            return;
        }
        
        if (validateAgainstSchema(req.body, Course.CourseSchema)) {
            const courseId = await Course.insertNewCourse(req.body);
            res.status(201).json({ id: courseId });
        } else {
            res.status(400).json({ error: "Request body is not a valid course object." });
        }
    } catch (err) {
        next(err);
    }
});

/*
 * GET /courses/:id - Route to fetch data about a specific course.
 */
router.get('/:id', requireAuthentication, async (req, res, next) => {
    try {
        const course = await Course.getCourseById(req.params.id);
        if (course) {
            res.status(200).json(course);
        } else {
            res.status(404).json({ error: "Course not found" });
        }
    } catch (err) {
        next(err);
    }
});

/*
 * PATCH /courses/:id - Route to update data for a specific course.
 */
router.patch('/:id', requireAuthentication, async (req, res, next) => {
    try {
        if (req.role !== 'admin' && req.role !== 'instructor') {
            res.status(403).json({ error: "Unauthorized to update a course" });
            return;
        }

        const courseId = req.params.id;
        if (!ObjectId.isValid(courseId)) {
            res.status(400).json({ error: "Invalid course ID" });
            return;
        }
        
        const updates = req.body;
        const success = await Course.updateCourseById(courseId, updates);
        if (success) {
            res.status(200).json({ message: "Course updated successfully" });
        } else {
            res.status(404).json({ error: "Course not found" });
        }
    } catch (err) {
        next(err);
    }
});

/*
 * DELETE /courses/:id - Route to remove a specific course from the database.
 */
router.delete('/:id', requireAuthentication, async (req, res, next) => {
    try {
        if (req.role !== 'admin' && req.role !== 'instructor') {
            res.status(403).json({ error: "Unauthorized to delete a course" });
            return;
        }

        const courseId = req.params.id;
        if (!ObjectId.isValid(courseId)) {
            res.status(400).json({ error: "Invalid course ID" });
            return;
        }
        
        const success = await Course.deleteCourseById(courseId);
        if (success) {
            res.status(204).end();
        } else {
            res.status(404).json({ error: "Course not found" });
        }
    } catch (err) {
        next(err);
    }
});



router.post('/:id/students', requireAuthentication, async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const userId = req.user;
        const userRole = req.role;
        console.log(userRole,userId)
        if (!ObjectId.isValid(courseId)) {
            res.status(400).json({ error: "Invalid course ID" });
            return;
        }

        const course = await Course.getCourseById(courseId);

        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }
       
        if (userRole !== 'admin' && !(userRole === 'instructor' && course.instructorId.toString() === userId)) {
            res.status(403).json({ error: "Unauthorized to update course enrollment" });
            return;
        }

        const { add, remove } = req.body;

        try {
            // Add students
            if(add){
                for (const studentId of add) {
                    const student = await User.getUserById(studentId);
                    if (!student) {
                        res.status(404).json({ error: `Student not found: ${studentId}` });
                        return;
                    }
    
                    const enrollment = {
                        courseId: new ObjectId(courseId),
                        courseName: course.title,
                        userId: new ObjectId(studentId),
                        role: 'student',
                        joinedDate: new Date(),
                        instructorId: new ObjectId(course.instructorId)
                    };
    
                    try {
                        console.log(enrollment);
                        await Enrollment.insertNewEnrollment(enrollment);
                    } catch (err) {
                        if (err.message === 'Duplicate enrollment found') {
                            console.log(`Duplicate enrollment found for student ${studentId} in course ${courseId}`);
                        } else {
                            throw err;
                        }
                    }
                }
            }
         
            if(remove){
                // Remove students
                for (const studentId of remove) {

                    const success = await Enrollment.removeEnrollment(courseId, studentId);
                    if (!success) {
                        console.log(`Failed to remove enrollment for student ${studentId} from course ${courseId}`);
                    }
                }
            }
            

            res.status(200).json({ message: "Course enrollment updated successfully" });
        } catch (err) {
            next(err);
        }
    } catch (err) {
        next(err);
    }
});


router.get('/:id/roster', requireAuthentication, async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const userId = req.user;
        const userRole = req.role;

        if (!ObjectId.isValid(courseId)) {
            res.status(400).json({ error: "Invalid course ID" });
            return;
        }

        const course = await Course.getCourseById(courseId);
        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }

        if (userRole !== 'admin' && !(userRole === 'instructor')) {
            res.status(403).json({ error: "Unauthorized to fetch course roster" });
            return;
        }

        data = await Enrollment.getEnrollmentsByCourseWithUserDetails(courseId);

        if (data.length === 0) {
            res.status(404).json({ error: "No enrollments found for this course" });
            return;
          }
      
      
        //   const records = data.map(enrollment => ({
            const records = data.map(enrollment => ({
                ID: enrollment.user._id.toString(),
                Name: enrollment.user.name,
                Email: enrollment.user.email,
                Role: enrollment.user.role,
                CourseID: enrollment.courseId.toString(),
                CourseName: enrollment.courseName,
                JoinedDate: enrollment.joinedDate.toISOString(),
                InstructorID: enrollment.instructorId.toString()
              }));
          
              stringify(records, { header: true }, (err, output) => {
                if (err) {
                  next(err);
                  return;
                }
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=enrollments.csv');
                res.send(output);

              });
            } catch (err) {
              next(err);
            }
          });
          



/*
 * GET /courses/:id/roster - Fetch a CSV file containing list of the students enrolled in the Course.
 */
router.get('/:id/students', requireAuthentication, async (req, res, next) => {
    const userId = req.user;
    const userRole = req.role;
    if (userRole !== 'admin' && !(userRole === 'instructor')) {
        res.status(403).json({ error: "Unauthorized to fetch course roster" });
        return;
    }

    try {
        const courseId = req.params.id;
        if (!ObjectId.isValid(courseId)) {
            res.status(400).json({ error: "Invalid course ID" });
            return;
        }

        const students = await Enrollment.getEnrollmentsByCourseId(courseId);
        res.status(200).send(students);
    } catch (err) {
        next(err);
    }
});

/*
 * GET /courses/:id/assignments - Fetch a list of the Assignments for the Course.
 */
router.get('/:id/assignments', requireAuthentication, async (req, res, next) => {
    try {
        const courseId = req.params.id;
        if (!ObjectId.isValid(courseId)) {
            res.status(400).json({ error: "Invalid course ID" });
            return;
        }
        const assignments = await Assignment.getAssignmentByCourseId(courseId);
        res.status(200).json(assignments);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
