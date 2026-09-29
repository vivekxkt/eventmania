const Event = require('../models/Event');

exports.getAllEvents = async(req,res) =>{
    try{
        const filters = {};
        if(req.query.category){
            filters.category = req.query.category;
        }
        if(req.query.location){
            filters.location = req.query.location;
        }
        if(req.query.ticketPrice){
            filters.ticketPrice = req.query.ticketPrice;
        }

        const events = await Event.find(filters);
        res.json(events);
    }
    catch(error){
        res.status(500).json({
            error : error.message
        })
    }
};


exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if(!event){
            return res.status(404).json({
                error : "Event not found"
            })
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//by admin
exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location, category, totalSeats, ticketPrice, image } = req.body;
        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            availableSeats: totalSeats,
            ticketPrice: ticketPrice || 0,
            imageUrl,
            createdBy: req.user.id
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event){
            return res.status(404).json({ 
                message: 'Event not found' 
            });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({
                message: 'Event not found' 
            });
        }
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};