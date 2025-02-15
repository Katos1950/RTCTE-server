var nodemailer = require('nodemailer');

const sendPassResVerification =async (emailId,token)=>{
    //const verificationLink = `http://localhost:5000/users/resetpassword?token=${token}`;
    const verificationLink = `http://localhost:3000/resetpassword/${token}`;


    var transporter = nodemailer.createTransport({
        service: 'gmail',
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