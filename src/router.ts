import { Router } from 'express';
import feedbackRouter from './apps/feedback/router';
import { categoryRouter } from './apps/category';
import { enquiryRouter } from './apps/Enquiry';
import { orderRouter } from './apps/order';
import { orderProductRouter } from './apps/OrderProduct';
import { paymentRouter } from './apps/Payment';
import { productRouter } from './apps/product';
import { profileRouter } from './apps/profile';
import { subscriptionRouter } from './apps/subscription';
const appRouter = Router();

appRouter.use('/profile', profileRouter);
appRouter.use('/category', categoryRouter);
appRouter.use('/product', productRouter);
appRouter.use('/subscription', subscriptionRouter);
appRouter.use('/enquiry', enquiryRouter);
appRouter.use('/order', orderRouter);
appRouter.use('/order-product', orderProductRouter);
appRouter.use('/payment', paymentRouter);
appRouter.use('/feedback', feedbackRouter);

export default appRouter;