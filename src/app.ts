/* app.ts */

// global dependencies
import * as dotenv from 'dotenv';
dotenv.config();  // initialise environment variables using a local .env file
import cors from 'cors';

// project dependencies
import appRouter from './router';

// set express app
import express from 'express';
import { checkAuthToken } from './middleware/auth';
import userRouter from './apps/user/router';
import errorHandler from './middleware/errorHandler';
const app = express();

// cors
app.use(cors());

// middlewares
app.use(express.json());

console.log('Starting Request response cycle ...');
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// auth routes or public routes, where no authorization is needed to access that path
app.use('/user', userRouter);

console.log('private request ...');
// check if the user is authorized to access the requested resource/route
app.use(checkAuthToken);

// routes wehre authorization is needed
app.use(appRouter);


// Error-handling middleware
app.use(errorHandler);

export default app;