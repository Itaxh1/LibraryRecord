// const { Router } = require('express');
// const { ObjectId } = require('mongodb');
// const jwt = require('jsonwebtoken');
// const router = Router();

// const { validateAgainstSchema } = require('../lib/validation');
// const { generateAuthToken } = require('../lib/auth');
// const User = require('../models/user');
// const Course = require('../models/course');
// const Enrollment = require('../models/enrollment');



// /*
//  * POST /users/login - Route to authenticate a user.
//  */
// router.post('/', async (req, res, next) => {
//     if (req.body && req.body.email && req.body.password) {
//       try {
//         const user = await User.authenticateUser(req.body.email, req.body.password);
//         if (user) {
//           console.log(user);
//           const token = generateAuthToken(user._id, user.role);
//           res.status(200).json({
//             token: token
//           });
//         } else {
//           res.status(401).json({
//             error: "Invalid credentials"
//           });
//         }
//       } catch (err) {
//         next(err);
//       }
//     } else {
//       res.status(400).json({
//         error: "Request body is missing email or password."
//       });
//     }
//   });
  
  
// module.exports = router;
