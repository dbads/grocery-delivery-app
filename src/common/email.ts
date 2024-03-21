/* eslint-disable max-len */
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dhoomakinfo@gmail.com',
    pass: process.env.APP_PASSWORD,
  },
});

export { transporter };
