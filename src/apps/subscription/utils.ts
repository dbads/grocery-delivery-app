import { transporter } from "../../common/email";


async function sendSubscriptionCreatedEmail(
  receiverEmail: string, 
  emailSubject: string, 
  emailBody: string
) {
  
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: 'dhoomakinfo@gmail.com',
    // from: '"Dhoomak " <dhoomakinfo@gmail.com>', // sender address
    to: receiverEmail, // list of receivers
    bcc: 'deepak@dhoomak.com',
    subject: `${emailSubject} ✔`, // Subject line
    // text: emailBody, // plain text body
    html: emailBody, // html body
  });

  console.log("Email sent: %s", info.messageId);
}

export { sendSubscriptionCreatedEmail };