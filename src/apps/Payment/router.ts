import { Router } from 'express';
import { 
  paymentService
} from '.';
const paymentRouter = Router();


paymentRouter.patch('/', async (req, res) => {
  const paymentData = req.body;

  const response: { data?: any, error?: any } = { };
  try {
    const category = await paymentService.updatePaymentDetails(
      paymentData?._id,
      paymentData
    );
    res.status(200);
    response['data'] = { category };
  } catch(error) {
    console.log(`Error in updating category: ${error}`);
    res.status(500);
    response['error'] = `Error in updating category: ${error}`;
  }
  
  res.send(response);
});


export default paymentRouter;