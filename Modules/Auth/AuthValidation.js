const Joi = require('joi');
const { confirmEmail } = require('./AuthController');

const schema = Joi.object({
    body:Joi.object().required().keys({
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        password: Joi.string().min(3).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
        confirmPassword: Joi.ref("password")
    }),
    qparams:Joi.object().required().keys({

    })
})

module.exports = schema