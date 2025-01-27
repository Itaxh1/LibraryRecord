const { Router } = require('express');
const { ObjectId } = require('mongodb');
const router = Router();
const path = require('path');

const { requireAuthentication } = require('../lib/auth');
const Course = require('../models/course');
const Assignment = require('../models/assignment');
const Submission = require('../models/submission');

/*
 * PATCH /submissions/:id - Update data for a specific Submission.
 */
router.patch('/:id', requireAuthentication, async (req, res, next) => {
    try {
        const submissionId = req.params.id;
        if (!ObjectId.isValid(submissionId)) {
            res.status(400).json({ error: "Invalid submission ID" });
            return;
        }

        const submission = await Submission.getSubmissionById(submissionId);
        if (!submission) {
            res.status(404).json({ error: "Submission not found" });
            return;
        }

        const assignment = await Assignment.getAssignmentById(submission.assignmentId);
        if (!assignment) {
            res.status(404).json({ error: "Associated assignment not found" });
            return;
        }

        const course = await Course.getCourseById(assignment.courseId);
        if (!course) {
            res.status(404).json({ error: "Associated course not found" });
            return;
        }

        // Only allow admins or the instructor of the course to update submissions
        if (req.role !== 'admin' && req.role !== 'instructor' && req.user !== course.instructorId.toString()) {
            res.status(403).json({ error: "Unauthorized to update submission" });
            return;
        }

        const updates = req.body;
        const success = await Submission.updateSubmissionById(submissionId, updates);
        if (success) {
            res.status(200).json({ message: "Submission updated successfully" });
        } else {
            res.status(404).json({ error: "Submission not found" });
        }
    } catch (err) {
        next(err);
    }
});

/*
 * GET /media/submissions/:filename - Download the file for a specific Submission.
 */
router.get('/media/submissions/:filename', requireAuthentication, async (req, res, next) => {
    try {
        const filename = req.params.filename;

        const submission = await Submission.getSubmissionByFilename(filename);
	console.log(submission);
	    if (!submission) {
            res.status(404).json({ error: "Submission not found" });
            return;
        }

        const assignment = await Assignment.getAssignmentById(submission.assignmentId);
        if (!assignment) {
            res.status(404).json({ error: "Associated assignment not found" });
            return;
        }

        const course = await Course.getCourseById(assignment.courseId);
        if (!course) {
            res.status(404).json({ error: "Associated course not found" });
            return;
        }

        // Only allow admins or the instructor of the course to download the submission file
        if (req.role !== 'admin' && req.role !== 'instructor' && req.user !== course.instructorId.toString()) {
            res.status(403).json({ error: "Unauthorized to download submission file" });
            return;
        }

        const filePath = path.join(__dirname, 'uploads/', filename);
        res.download(filePath);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
