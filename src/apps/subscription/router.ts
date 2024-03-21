import { Router } from 'express';
import { subscriptionService } from '.';
import { UserType } from '../user/constants';
const subscriptionRouter = Router();


subscriptionRouter.get('/:userId', async (req, res) => {

  const response: { data?: any, error?: any } = { };
  try {
    const subscrption = await subscriptionService.getSubscription(req.params?.userId);
    res.status(200);
    response['data'] = { subscrption };
  } catch(error) {
    console.log(`Error in fetching subscrptions: ${error}`);
    res.status(500);
    response['error'] = `Error in fetching subscrptions: ${error}`;
  }
  
  res.send(response);
});

subscriptionRouter.post('/', async (req: any, res: any) => {
  let subscriptionData = req.body;

  if (req.user?.userType === UserType.SalesAgent) {
    subscriptionData = { ...subscriptionData, agent: req.user?._id.toString() }; 
  }

  const response: { data?: any, error?: any } = { };
  try {
    const subscription = await subscriptionService.createSubscription(subscriptionData);
    res.status(200);
    response['data'] = { subscription };
  } catch(error) {
    console.log(`Error in creating subscription: ${error}`);
    res.status(500);
    response['error'] = `Error in creating subscription: ${error}`;
  }
  
  res.send(response);
});

subscriptionRouter.patch('/', async (req, res) => {
  const subscriptionData = req.body;

  const response: { data?: any, error?: any } = { };
  try {
    const subscription = await subscriptionService.updateSubscription(subscriptionData);
    res.status(200);
    response['data'] = { subscription };
  } catch(error) {
    console.log(`Error in updating subscription: ${error}`);
    res.status(500);
    response['error'] = `Error in updating subscription ${error}`;
  }
  
  res.send(response);
});

subscriptionRouter.delete('/:userId', async (req, res) => {

  const response: { data?: any, error?: any } = { };
  try {
    const subscription = await subscriptionService.deleteSubscription(req.params?.userId);
    res.status(200);
    response['data'] = { subscription };
  } catch(error) {
    console.log(`Error in deleting subscription: ${error}`);
    res.status(500);
    response['error'] = `Error in deleting subscription ${error}`;
  }
  
  res.send(response);
});


/**
 * get subscriptions/onboardings done by an agent
 */
subscriptionRouter.get('/agent/:agentId', async (req, res) => {

  const response: { data?: any, error?: any } = { };
  try {
    const onboardings = await subscriptionService.getOnboardingsByAgent(
      req.params?.agentId
    );
    res.status(200);
    response['data'] = { onboardings };
  } catch(error) {
    console.log(`Error in fetching onboardings: ${error}`);
    res.status(500);
    response['error'] = `Error in fetching onboardings ${error}`;
  }
  
  res.send(response);
});


/**
 * get an onboarding/subscription - a subscription is basically an onboarding
 */
subscriptionRouter.get('/onboarding/:subscriptionId', async (req, res) => {

  const response: { data?: any, error?: any } = { };
  try {
    const onboarding = await subscriptionService.getOnboarding(
      req.params?.subscriptionId
    );
    res.status(200);
    response['data'] = { onboarding };
  } catch(error) {
    console.log(`Error in fetching onboarding: ${error}`);
    res.status(500);
    response['error'] = `Error in fetching onboarding ${error}`;
  }
  
  res.send(response);
});


export default subscriptionRouter;