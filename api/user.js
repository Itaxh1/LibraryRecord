const { Router } = require('express');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const router = Router();

const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const User = require('../models/user');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');


/*
 * POST /users/login - Route to authenticate a user.
 */
router.post('/login', async (req, res, next) => {
  if (req.body && req.body.email && req.body.password) {
    try {
      const user = await User.authenticateUser(req.body.email, req.body.password);
      if (user) {
        console.log(user);
        const token = generateAuthToken(user._id, user.role);
        res.status(200).json({
          token: token
        });
      } else {
        res.status(401).json({
          error: "Invalid credentials"
        });
      }
    } catch (err) {
      next(err);
    }
  } else {
    res.status(400).json({
      error: "Request body is missing email or password."
    });
  }
});



/*
 * POST /users - Route to create a new User.
 */
router.post('/', requireAuthentication, async (req, res, next) => {
  if (req.role !== 'admin') {
    res.status(403).json({
      error: "Unauthorized to create a user"
    });
    return;
  }

  if (validateAgainstSchema(req.body, User.UserSchema)) {
    try {
      const id = await User.insertNewUser(req.body);
      res.status(201).json({
        id: id
      });
    } catch (err) {
      next(err);
    }
  } else {
    res.status(400).json({
      error: "Request body is not a valid user object."
    });
  }
});


/*
 * GET /users/:id - Route to fetch data about a specific User.
 */
router.get('/:id', requireAuthentication, async (req, res, next) => {
  console.log(req.user);
  // Allow access if the user is an admin or the user is requesting their own data
  if (req.role !== 'admin' && req.user !== req.params.id) {
    res.status(403).json({
      error: "Unauthorized to access the specified resource"
    });
    return;
  }

  try {
    const user = await User.getUserById(req.params.id);
    if (user) {
      // Remove password field from the user object
      delete user.password;
      // Fetch course data based on user role
      console.log(user,"...");
        let courses = [];
        if (user.role === 'instructor') {
          // courses = await Enrollment.getEnrollmentsByInstructor(user._id.toString());
          const courses = await Enrollment.getEnrollmentsByInstructor(user._id.toString());

          console.log(courses);
          res.status(200).json({
            ...user,
            courses: courses.map(course => course|| course)
          });
        } else if (user.role === 'student') {
		console.log("Student")
		courses = await Enrollment.getCoursesByStudentId(user._id);
          res.status(200).json({
            ...user,
            courses: courses.map(course => course || course)
          });
        }
        else if(user.role==='admin'){
                  res.status(200).json({
          ...user,
          // courses: courses.map(course => course._id || course)
        });
        }
      } 
     
    else {
      res.status(404).json({
        error: "User not found"
      });
    }
  } catch (err) {
    next(err);
  }
});


module.exports = router;
