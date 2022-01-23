const Joi = require("joi");

module.exports.tweetSchema = Joi.object({
    tweet: Joi.object({
        username: Joi.string()
            .min(3)
            .max(10),
        text: Joi.string()
            .required()
    }).required()
})


module.exports.userSchema = Joi.object({
    user: Joi.object({
        username: Joi.string()
            .min(3)
            .max(10)
            .required(),
        age: Joi.number()
            .min(10)
            .max(90),
        city: Joi.string()
            .required()
    }).required()
})

