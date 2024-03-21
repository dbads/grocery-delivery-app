import { Router } from 'express';
import { profileService } from '.';
import { s3 } from '../../common';
const profileRouter = Router();

profileRouter.get('/:userId', async (req, res) => {

  const response: { data?: any, error?: any } = { };
  try {
    const profile = await profileService.getProfile(req.params?.userId);
    res.status(200);
    response['data'] = { profile };
  } catch(error) {
    console.log(`Error in fetching profile: ${error}`);
    res.status(500);
    response['error'] = `Error in fetching profile: ${error}`;
  }
  
  res.send(response);
});

profileRouter.post('/account', s3.upload.single('picture'), async (req, res) => {
  const accountData = req.body;
  
  // accountData.createdBy = req.user;

  const response: { data?: any, error?: any } = { };
  try {
    if (!req.file) throw new Error('Please upload restaurant image.');
    const fileMimeType = req.file?.mimetype;
    if (fileMimeType && 
      !['image/png', 'image/jpeg', 'image/jpg'].includes(fileMimeType)) {
      throw new Error('Invalid file type');
    }

    req.file.filename = 
      // eslint-disable-next-line max-len
      `${process.env.NODE_ENV}/restaurant/${s3.generateCustomFilename(req.file?.originalname)}`;

    const profile = await profileService.creatAccount(accountData, req.file);
    res.status(200);
    response['data'] = { profile };
  } catch(error) {
    console.log(`Error in creating account: ${error}`);
    res.status(500);
    response['error'] = `Error in creating account: ${error}`;
  }
  
  res.send(response);
});

profileRouter.post('/', async (req, res) => {
  const profileData = req.body;

  const response: { data?: any, error?: any } = { };
  try {
    const profile = await profileService.createProfile(
      profileData?.userId,
      profileData
    );
    res.status(200);
    response['data'] = { profile };
  } catch(error) {
    console.log(`Error in creating profile: ${error}`);
    res.status(500);
    response['error'] = `Error in creating profile: ${error}`;
  }
  
  res.send(response);
});

profileRouter.patch('/', async (req, res) => {
  const profileData = req.body;

  const response: { data?: any, error?: any } = { };
  try {
    const profile = await profileService.updateProfile(profileData?.userId, profileData);
    res.status(200);
    response['data'] = { profile };
  } catch(error) {
    console.log(`Error in updating profile: ${error}`);
    res.status(500);
    response['error'] = `Error in updating profile: ${error}`;
  }
  
  res.send(response);
});

profileRouter.delete('/:userId', async (req, res) => {
  const response: { data?: any, error?: any } = { };

  try {
    const profile = await profileService.deleteProfile(req.params?.userId);
    res.status(200);
    response['data'] = { profile };
  } catch(error) {
    console.log(`Error in deleting profile: ${error}`);
    res.status(500);
    response['error'] = `Error in deleting profile: ${error}`;
  }
  
  res.send(response);
});

profileRouter.post('/verify-account-otp', async (req, res) => {
  const { phoneNumber, otp, profileId } = req.body;
  const response: { data?: any, error?: any } = { };
  
  res.status(200);

  try {
    const verificationData = await profileService.verifyAccountOtp(
      profileId,
      phoneNumber,
      otp
    );
    response['data'] = { ...verificationData }; 
  } catch (error) {
    res.status(500);
    response['error'] = `Otp verification failed with error ${error}`;
  }

  res.send(response);
});

profileRouter.delete('/account/:userId', async (req, res) => {
  const response: { data?: any, error?: any } = { };
  
  res.status(200);

  try {
    const deletionResponse = await profileService.deleteAccount(req.params.userId);
    response['data'] = { deletionResponse }; 
  } catch (error) {
    res.status(500);
    response['error'] = `Account deletion failed with error ${error}`;
  }

  res.send(response);
});

profileRouter.post('/invite', async (req, res) => {
  const response: { data?: any, error?: any } = { };
  
  const { phoneNumber, userType } = req.body;

  res.status(200);

  try {
    const inviteResponse = await profileService.inviteAgent(phoneNumber, userType);
    response['data'] = { inviteResponse }; 
  } catch (error) {
    res.status(500);
    response['error'] = `Invitation failed with error ${error}`;
  }

  res.send(response);
});

export default profileRouter;
