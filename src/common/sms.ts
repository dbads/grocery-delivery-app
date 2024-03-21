/* eslint-disable max-len */
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
import { Twilio } from 'twilio';

const twilioClient = new Twilio(accountSid, authToken);

async function sendSms(phoneNumber: string, messageBody: string) {
  if (process.env.INTERNAL_PHONE_NUMBERS?.includes(phoneNumber)) return;

  const message = await twilioClient.messages.create(
    {
      from: twilioNumber,
      body: messageBody,
      to: phoneNumber
    }
  );

  console.log(message.sid, 'message sid');
}

export {
  sendSms
};