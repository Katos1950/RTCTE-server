var nodemailer = require('nodemailer');

const sendEmailVerification =async (emailId,token)=>{
    //const verificationLink = `http://3.149.6.22/auth/users/verify/${token}`;
    const verificationLink = `https://api.co-write.online/auth/users/verify/${token}`;

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
    subject: 'Sending Email using Node.js',
    html: `
      <p>Click the link below to verify your email:</p>
      <a href="${verificationLink}" target="_blank">${verificationLink}</a>
      <p>This link will expire in 1 hour.</p>
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

module.exports=sendEmailVerification;
