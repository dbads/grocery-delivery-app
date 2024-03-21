import mongoose from 'mongoose';
import { commonProperties } from '../../common/commonSchema';
import { User } from '../user';

interface FeedbackI {
  feedback: string;
  user: mongoose.mongo.ObjectId;
}

const feedbackSchema = new mongoose.Schema({
  ...commonProperties,
  feedback: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.mongo.ObjectId,
    requried: true,
    ref: User
  },
});

const Feedback = mongoose.model<FeedbackI>('Feedback', feedbackSchema);
export { Feedback , feedbackSchema, FeedbackI };