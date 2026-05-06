const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes')
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const events = require("node:events");
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.json({ message: 'Welcome to SEBS API ' });//testing routes
});

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api/admin', adminRoutes);

app.use('/api/users' , userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);


//Error handling of mutler files updates plus console debuging
//any error fi ay route gets thrown here
//expresss recognize middlware with 4 paramaters( err,req,res,next)
app.use((err, req, res, next) => {
    if (err.name === 'MulterError') {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    if (err.message && err.message.includes('Only types of images are alllowed like jpg png try again')) {
        return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
});
module.exports = app;