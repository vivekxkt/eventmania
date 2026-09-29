const express = require('express');
const router = express.Router();
const {protect, admin} = require ('../middleware/auth')
const {getAllEvents,getEventById,createEvent,updateEvent,deleteEvent} = require('../controllers/eventController');
//routes
router.get('/',getAllEvents);

router.get('/:id',getEventById);

//Events for admin only
router.post('/:id',protect,admin,createEvent);
router.put('/:id',protect,admin,updateEvent);
router.put('/:id',protect,admin,deleteEvent);

module.exports = router;