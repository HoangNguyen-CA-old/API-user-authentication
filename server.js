const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('config');
const app = express();

app.use(express.json());
app.use(morgan('dev'));

const userRoute = require('./routes/api/users');
const authRoute = require('./routes/api/auth');

app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);

//catch undefined routes
app.use((req, res, next) => {
  const error = new Error('Route Not Found');
  error.status = 404;
  next(error);
});

//catch route errors
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: { message: err.message } });
});

const db = config.get('mongoURI');
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('connected to mongodb');
  })
  .catch((err) => {
    console.log(`\nerror connecting to mongodb:\n\n ${err}`);
  });

const port = process.env.port || 5000;
app.listen(5000);
console.log(`Server started on port ${port}`);
