import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../apps/user';
const { AUTH_TOKEN_KEY } = process.env;

export const checkAuthToken = async (req: any, res: any, next: any) => {
  const authoken = req.headers["x-access-token"];

  try {
    if (!authoken) {
      throw new Error('Unauthorized');
    }

    const decodedUserInfo = jwt.verify(authoken, AUTH_TOKEN_KEY!) as JwtPayload;
    // Check if user actually exist in db
    const { phoneNumber } =  decodedUserInfo;
    const user = await User.findOne({ phoneNumber });
    if(!user) {
      throw new Error('Unauthorized');
    }

    req.user = { ...user.toObject(), ...decodedUserInfo };

  } catch (error) {
    console.log(`Error in Authorizing request ${error}`);
    return res.status(403).json({ error: 'Unauthorized' });
  }

  next();
};