import { Router } from 'express';
import { 
  feedbackService
} from '.';
const businessRouter = Router();

businessRouter.get('/', async (req, res) => {

  const response: { data?: any, error?: any } = { };
  try {
    const feedbacks = await feedbackService.getFeedbacks();
    res.status(200);
    response['data'] = { feedbacks };
  } catch(error) {
    console.log(`Error in fetching feedbacks: ${error}`);
    res.status(500);
    response['error'] = `Error in fetching feedbacks: ${error}`;
  }
  
  res.send(response);
});


businessRouter.post('/', async (req, res) => {
  
  const feedbackData = req.body;
  
  const response: { data?: any, error?: any } = { };
  try {
    const feedback = await feedbackService.createFeedback(feedbackData);
    res.status(200);
    response['data'] = { feedback };
  } catch(error) {
    console.log(`Error in creating feedback: ${error}`);
    res.status(500);
    response['error'] = `Error in creating feedback: ${error}`;
  }
  
  res.send(response);
});

export default businessRouter;