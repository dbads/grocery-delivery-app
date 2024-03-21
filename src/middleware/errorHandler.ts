import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Handle the error here
  console.log(`Error occurred: ${err}`);
  res.status(500).send('Something went wrong');
}

export default errorHandler;