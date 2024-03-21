import mongoose from 'mongoose';
import { commonSchema } from '../../common';
import { UserType } from '../user/constants';
import { User } from '../user/model';

interface ProfileI {
  phoneNumber: string;
  email: string;
  type: UserType;
  name: string;
  address: object;
  managerName: string;
  gstNo: string;
  panNo: string;
  images: [string];
  createdBy: string;
  user: mongoose.mongo.ObjectId;
}

const profileSchema = new mongoose.Schema({
  ...commonSchema.commonProperties,
  user: {
    type: mongoose.mongo.ObjectId,
    requried: true,
    unique: true,
    index: true,
    ref: User
  },
  createdBy: {
    type: mongoose.mongo.ObjectId,
    ref: User
  },
  phoneNumber: {
    type: String,
    unique: true,
    index: true,
    required: true,
  },
  email: String,
  type: {
    type: String,
    enum: UserType,
    default: UserType.Restaurant
  },
  name: String,
  address: {
    type: Object,
  },
  managerName: String,
  gstNo: String,
  panNo: String,
  images: {
    type: [String]
  },
  restaurantId: String
}, commonSchema.commonOptions);

const Profile = mongoose.model<ProfileI>('Profile', profileSchema);
export { Profile, ProfileI, profileSchema };