import { Router } from 'express';

const userRouter = Router();

import { userService } from '.';

userRouter.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  const response: { data?: any, error?: any } = { };
  
  res.status(200);

  try {
    await userService.sendOtp(phoneNumber);
    response['data'] = { message: 'Otp sent successfully' }; 
  } catch(error) {
    console.log(`Error in sending otp: ${error}`);
    res.status(500);
    response['error'] = `Error in sending otp: ${error}`;
  }
  
  res.send(response);
});

userRouter.post('/verify-otp', async (req, res) => {
  const { phoneNumber, otp } = req.body;
  const response: { data?: any, error?: any } = { };
  
  res.status(200);

  try {
    const verificationData = await userService.verifyOtp(phoneNumber, otp);
    response['data'] = { message: 'Otp verified successfully', ...verificationData }; 
  } catch (error) {
    res.status(500);
    response['error'] = `Otp verification failed with error ${error}`;
  }

  res.send(response);
});

userRouter.get('/test', (req, res) => { res.status(200).send("Hello Dhoomak");});

export default userRouter;