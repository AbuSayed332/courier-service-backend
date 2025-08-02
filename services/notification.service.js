const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendParcelStatusEmail = async (email, parcelId, status) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Parcel Status Update - ${status}`,
      text: `Your parcel ${parcelId} status has been updated to ${status}`,
      html: `<p>Your parcel <strong>${parcelId}</strong> status has been updated to <strong>${status}</strong></p>`,
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending error:', error);
  }
};

exports.sendAssignmentEmail = async (email, parcelId, agentName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Parcel Assigned to Delivery Agent`,
      text: `Your parcel ${parcelId} has been assigned to agent ${agentName}`,
      html: `<p>Your parcel <strong>${parcelId}</strong> has been assigned to agent <strong>${agentName}</strong></p>`,
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending error:', error);
  }
};