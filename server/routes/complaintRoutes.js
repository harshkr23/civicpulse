const express = require('express');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
} = require('../controllers/complaintController');

const router = express.Router();

router.route('/').post(createComplaint).get(getComplaints);

router
  .route('/:id')
  .get(getComplaintById)
  .patch(updateComplaint)
  .delete(deleteComplaint);

module.exports = router;
