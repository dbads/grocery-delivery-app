import mongoose from 'mongoose';
import { constants } from '../../common';
import { commonOptions, commonProperties } from '../../common/commonSchema';
import { UserType } from './constants';

interface UserI extends Document {
  phoneNumber: string;
  email: string;
  userType: constants.UserType;
  _id: mongoose.mongo.ObjectId;
}

const userSchema = new mongoose.Schema({
  ...commonProperties,
  phoneNumber: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  email: String,
  userType: {
    type: String,
    enum: UserType,
    default: UserType.Restaurant
  },
}, commonOptions);

const User = mongoose.model<UserI>('User', userSchema);
export { User, UserI, userSchema };