import { Router } from 'express';
import { 
  enquiryService
} from '.';
const enquiryRouter = Router();


enquiryRouter.get('/:enquiryId', async (req, res) => {

  const response: { data?: any, error?: any } = { };
  try {
    const enquiry = await enquiryService.getEnquiry(req.params?.enquiryId);
    res.status(200);
    response['data'] = { enquiry };
  } catch(error) {
    console.log(`Error in fetching enquiry: ${error}`);
    res.status(500);
    response['error'] = `Error in fetching enquiry ${error}`;
  }
  
  res.send(response);
});

enquiryRouter.get('/agent/:agentId', async (req, res) => {

  const response: { data?: any, error?: any } = { };
  try {
    const enquiries = await enquiryService.getEnquiriesByAgent(req.params?.agentId);
    res.status(200);
    response['data'] = { enquiries };
  } catch(error) {
    console.log(`Error in fetching enquiries: ${error}`);
    res.status(500);
    response['error'] = `Error in fetching enquiries: ${error}`;
  }
  
  res.send(response);
});

enquiryRouter.post('/', async (req: any, res) => {
  console.log('enquiry create ---', req.user._id, 'userid');
  const enquiryData = req.body;

  const response: { data?: any, error?: any } = { };
  try {
    const enquiry = await enquiryService.createEnquiry(
      { ...enquiryData, agent: req.user?._id }
    );
    res.status(200);
    response['data'] = { enquiry };
  } catch(error) {
    console.log(`Error in creating enquiry: ${error}`);
    res.status(500);
    response['error'] = `Error in creating enquiry: ${error}`;
  }
  
  res.send(response);
});

enquiryRouter.patch('/', async (req, res) => {
  const enquiryData = req.body;
  console.log(enquiryData, '--data enquiry--', req.body);

  const response: { data?: any, error?: any } = { };
  try {
    const enquiry = await enquiryService.updateEnquiry(
      enquiryData?._id,
      enquiryData
    );
    res.status(200);
    response['data'] = { enquiry };
  } catch(error) {
    console.log(`Error in updating enquiry: ${error}`);
    res.status(500);
    response['error'] = `Error in updating enquiry: ${error}`;
  }
  
  res.send(response);
});

enquiryRouter.delete('/:enquiryId', async (req, res) => {

  const response: { data?: any, error?: any } = { };
  try {
    const enquiry = await enquiryService.deleteEnquiry(req.params?.enquiryId);
    res.status(200);
    response['data'] = { enquiry };
  } catch(error) {
    console.log(`Error in deleting enquiry: ${error}`);
    res.status(500);
    response['error'] = `Error in deleting enquiry: ${error}`;
  }
  
  res.send(response);
});

export default enquiryRouter;