const nodeoutlook = require('nodejs-nodemailer-outlook')


const sendEmail = (dest , message) =>{
nodeoutlook.sendEmail({
    auth: {
        user: "iti73@outlook.com",
        pass: "Online10@"
    },
    from: "iti73@outlook.com",
    to: dest,
    subject: 'Hey you, awesome!',
    html: message ,
    onError: (e) => console.log(e),
    onSuccess: (i) => console.log(i)
}
);
}

module.exports = sendEmail