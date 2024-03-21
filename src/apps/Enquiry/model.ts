import mongoose from 'mongoose';
import { commonSchema } from '../../common';
import { commonProperties } from '../../common/commonSchema';
import { User } from '../user';
import { ServiceInterest, ServiceNeeded } from './constants';

interface EnquiryI {
  meetingWith: string;
  restaurantName: string;
  meetingPersonName: string;
  phoneNumber: string;
  email: string;
  address: { city: string, zipcode: string, street: string};
  serviceNeeded: ServiceNeeded;
  nextMeetingSchedule: string;
  serviceComment: string,
  comments: [string];
  interest: string;
  agent: string
}

const enquirySchema = new mongoose.Schema({
  ...commonProperties,
  agent: {
    type: mongoose.mongo.ObjectId,
    requried: true,
    ref: User
  },
  meetingWith: String,
  restaurantName: String,
  meetingPersonName: String,
  phoneNumber: String,
  email: String,
  address: Object,
  serviceNeeded: {
    type: String,
    enum: ServiceNeeded,
    default: ServiceNeeded.Inventory
  },
  serviceComment: String,
  nextMeetingSchedule: Date,
  comments: [String],
  interest: {
    type: String,
    enum: ServiceInterest,
    default: ServiceInterest.High
  }
}, commonSchema.commonOptions);

const Enquiry = mongoose.model<EnquiryI>('Enquiry', enquirySchema);
export { Enquiry , EnquiryI };