const twilio = require("twilio")

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const createVerification = async (phone) => {
  const verification = await client.verify.v2
    .services(process.env.TWILIO_SERVICE_SID)
    .verifications.create({
      channel: "sms",
      to: "+91"+phone,
    });

  console.log(verification.status);
  return verification.status  
}

const verifyOTP = async (phone, OTP) => {
    const verificationCheck = await client.verify.v2
    .services(process.env.TWILIO_SERVICE_SID)
    .verificationChecks.create({
      code: OTP,
      to: "+91"+phone,
    });

  console.log("is user verified: ",verificationCheck.status);
  return verificationCheck.status
}

module.exports = {createVerification, verifyOTP}