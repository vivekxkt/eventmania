const cors = require('cors');
const express = require('express');
const dotenv = require ('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/booking');

dotenv.config();


//app req
const app  = express();
app.use(cors());
app.use(express.json());


//routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);



//mongo
mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log("Connected to mongoDB");
})
.catch((error)=>{
    console.log("Error connecting to MongoDB",error);
})


//connection
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`)
});