const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

const connectDB = require('./config/db');
const session = require('express-session');
const petRouter = require('./routes/pets');
const usersRouter = require('./routes/users');
const petyRouter = require('./routes/pety');
const dashboardRouter = require('./routes/dashboard');
const reviewsRouter = require('./routes/reviews');
const notificationRouter = require('./routes/notification');
const historyRouter = require('./routes/History');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

app.use(cors());

//open db connection
connectDB();
// session midlware
app.use(
  session({
    secret: 'Pets Care',
    resave: true,
    saveUninitialized: true,
  }),
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/pets', petRouter);
app.use('/api/users', usersRouter);
app.use('/api/pety', petyRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/notification', notificationRouter);
app.use('/api/history', historyRouter);

app.use('/api/dashboard', dashboardRouter);
app.use((req, res, next) => {
  return next(
    new AppError(`Can't find this ${req.originalUrl} On this server!`, 404),
  );
});
app.use(globalErrorHandler);
module.exports = app;
