var nodemailer = require('nodemailer');

const sendPassResVerification =async (emailId,token)=>{
    //const verificationLink = `http://localhost:5000/users/resetpassword?token=${token}`;
    const verificationLink = `https://co-write.online/resetpassword/${token}`;


    var transporter = nodemailer.createTransport({
 	host: 'smtp.ionos.com', // Replace with your domain's SMTP host
        port: 587, // or 587 depending on your provider's requirements
        secure: false, // true for port 465, false for port 587 (or adjust as needed)
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
      });
      
    var mailOptions = {
    from:  process.env.EMAIL_USER,
    to: emailId,
    subject: 'Password Reset Link',
    html: `
      <p>Click the link below to reset your password:</p>
      <a href="${verificationLink}" target="_blank">${verificationLink}</a>
      <p>This link will expire in 15 min.</p>
    `,
    };
    
    await transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
}

module.exports=sendPassResVerification;
