import { Feedback, FeedbackI } from ".";

async function getFeedbacks() {
  const feedbacks = await Feedback.find({ isDeleted: false });
  return feedbacks;
}

async function createFeedback(
  feedbackData: Partial<FeedbackI>, 
) {


  let feedback = new Feedback({
    ...feedbackData
  });
    
  feedback = await feedback.save();

  return feedback;
}

export { createFeedback, getFeedbacks };
