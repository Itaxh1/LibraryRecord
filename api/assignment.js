const { Router } = require('express');
const { ObjectId } = require('mongodb');
const router = Router();
const { parse } = require('json2csv');
const path = require('path');

const { validateAgainstSchema } = require('../lib/validation');
const { requireAuthentication } = require('../lib/auth');
const Course = require('../models/course');
const User = require('../models/user');
const Assignment = require('../models/assignment');
const Submission = require('../models/submission'); // Assuming you have a submission model


/*
 * POST /assignments - Create a new Assignment.
 */
router.post('/', requireAuthentication, async (req, res, next) => {
    try {
        const { courseId, title, points ,description, due } = req.body;

        if (!ObjectId.isValid(courseId)) {
            res.status(400).json({ error: "Invalid course ID" });
            return;
        }

        const course = await Course.getCourseById(courseId);
        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }
        // console.log(req.role,req.user ,course.instructorId.toString())
        // Only allow admins or the instructor of the course to create assignments
        if (req.role !== 'admin' && req.role !== 'instructor'  && req.user !== course.instructorId.toString()) {
            res.status(403).json({ error: "Unauthorized to create assignment" });
            return;
        }

        const assignment = {
            courseId: new ObjectId(courseId),
            title,
            description,
            points,
            due: new Date(due)
        };

        if (validateAgainstSchema(assignment, Assignment.AssignmentSchema)) {
            const assignmentId = await Assignment.insertNewAssignment(assignment);
            res.status(201).json({ id: assignmentId });
        } else {
            res.status(400).json({ error: "Request body is not a valid assignment object." });
        }
    } catch (err) {
        next(err);
    }
});

/*
 * GET /assignments/:id - Fetch data about a specific Assignment.
 */
router.get('/:id', requireAuthentication, async (req, res, next) => {
    try {
        const assignmentId = req.params.id;
        if (!ObjectId.isValid(assignmentId)) {
            res.status(400).json({ error: "Invalid assignment ID" });
            return;
        }

        const assignment = await Assignment.getAssignmentById(assignmentId);
        if (assignment) {
            res.status(200).json(assignment);
        } else {
            res.status(404).json({ error: "Assignment not found" });
        }
    } catch (err) {
        next(err);
    }
});

/*
 * PATCH /assignments/:id - Update data for a specific Assignment.
 */
router.patch('/:id', requireAuthentication, async (req, res, next) => {
    try {
        const assignmentId = req.params.id;
        if (!ObjectId.isValid(assignmentId)) {
            res.status(400).json({ error: "Invalid assignment ID" });
            return;
        }

        const assignment = await Assignment.getAssignmentById(assignmentId);
        if (!assignment) {
            res.status(404).json({ error: "Assignment not found" });
            return;
        }

        // Only allow admins or the instructor of the course to update assignments
        if (req.role !== 'admin'  && req.role !== 'instructor'  && req.user !== assignment.instructorId.toString()) {
            res.status(403).json({ error: "Unauthorized to update assignment" });
            return;
        }

        const updates = req.body;
        const success = await Assignment.updateAssignmentById(assignmentId, updates);
        if (success) {
            res.status(200).json({ message: "Assignment updated successfully" });
        } else {
            res.status(404).json({ error: "Assignment not found" });
        }
    } catch (err) {
        next(err);
    }
});

/*
 * DELETE /assignments/:id - Remove a specific Assignment from the database.
 */
router.delete('/:id', requireAuthentication, async (req, res, next) => {
    try {
        const assignmentId = req.params.id;
        if (!ObjectId.isValid(assignmentId)) {
            res.status(400).json({ error: "Invalid assignment ID" });
            return;
        }

        const assignment = await Assignment.getAssignmentById(assignmentId);
        if (!assignment) {
            res.status(404).json({ error: "Assignment not found" });
            return;
        }

        // Only allow admins or the instructor of the course to delete assignments
        if (req.role !== 'admin' && req.role !== 'instructor' && req.user !== assignment.instructorId.toString()) {
            res.status(403).json({ error: "Unauthorized to delete assignment" });
            return;
        }

        const success = await Assignment.deleteAssignmentById(assignmentId);
        if (success) {
            res.status(204).end();
        } else {
            res.status(404).json({ error: "Assignment not found" });
        }
    } catch (err) {
        next(err);
    }
});

/*
 * GET /assignments/:id/submissions - Fetch the list of all Submissions for an Assignment with pagination.
 */
router.get('/assignments/:id/submissions', requireAuthentication, async (req, res, next) => {
    try {
        const assignmentId = req.params.id;
        if (!ObjectId.isValid(assignmentId)) {
            res.status(400).json({ error: "Invalid assignment ID" });
            return;
        }

        // Extract pagination parameters from the query string
        let page = parseInt(req.query.page) || 1;
        let pageSize = parseInt(req.query.pageSize) || 10;

        // Ensure page and pageSize are positive integers
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;

        // Get paginated submissions
        const { submissions, totalCount } = await Submission.getSubmissionsByAssignmentId(assignmentId, page, pageSize);
        
        res.status(200).json({
            submissions,
            totalPages: Math.ceil(totalCount / pageSize),
            currentPage: page
        });
    } catch (err) {
        next(err);
    }
});


/*
 * POST /assignments/:id/submissions - Create a new Submission for an Assignment.
 */


const multer = require('multer');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


router.post('/:id/submissions', requireAuthentication, upload.single('file'), async (req, res, next) => {
    try {
      const assignmentId = req.params.id;
      if (!ObjectId.isValid(assignmentId)) {
        res.status(400).json({ error: "Invalid assignment ID" });
        return;
      }
  
      const userRole = req.role;
      if (userRole !== 'student') {
        res.status(403).json({ error: "Unauthorized to submit assignment" });
        return;
      }
  
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
  
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
  
      const submission = {
        assignmentId: new ObjectId(assignmentId),
        studentId: new ObjectId(req.userId),
        timestamp: new Date(),
        filename: file.filename,
        fileUrl: fileUrl,
        content:req.body.content
      };
      console.log(submission,Submission.SubmissionSchema)
      if (validateAgainstSchema(submission, Submission.SubmissionSchema)) {
        const submissionId = await Submission.insertNewSubmission(submission);
        res.status(201).json({ id: submissionId, fileUrl: fileUrl });
      } else {
        res.status(400).json({ error: "Request body is not a valid submission object." });
      }
    } catch (err) {
      next(err);
    }
  });

module.exports = router;