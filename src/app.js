
const express = require('express');
const app = express();
const passport = require('passport');
const userRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const tokenRoutes = require('./routes/tokenRoutes')
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());
require('./config/passport')(passport);
app.use(passport.initialize());



app.use('/api/auth', userRoutes, tokenRoutes);
app.use('/api', taskRoutes);

app.listen(3001, (err) => {
    if (err) {
        console.error('Error starting server:', err);
    } else {
        console.log('Server is running on port 3001');
    }
});
