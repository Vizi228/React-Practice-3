const nodemailer = require('nodemailer')


class mailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: "587",
            secure: false,
            auth: {
                user: "myromnv@gmail.com",
                pass: "Unturnet228",
            }
        })
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: "myromnv@gmail.com",
            to,
            subject: 'Активация аккаунта на' + 'http://localhost:3000',
            text: '',
            html:
                ` 
                <div>
                    <h1>Для активации пройдите по:</h1>
                    <a href='${link}'>${link}</a>
                <div/>
                `
        })
    }
}

module.exports = new mailService()