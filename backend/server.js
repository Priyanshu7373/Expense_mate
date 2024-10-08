const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user'); // Assuming user routes
const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors({
//     origin: 'http://localhost:3000', // Your frontend URL
//     credentials: true // Allow cookies to be sent with requests
// }));

app.use(express.json());
app.use(cookieParser());

mongoose.connect('mongodb://localhost:27017/splitWise', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection failed:', err));

app.use(userRoutes); // Routes
// app.use((req, res) => {
//     res.send('Not found');
// });

app.listen(5000, () => {
    console.log(`Server is running on port 5000`);
});
