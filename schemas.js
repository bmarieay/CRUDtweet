const Joi = require("joi");

module.exports.tweetSchema = Joi.object({
    tweet: Joi.object({
        username: Joi.string()
        .min(3)
        .max(10)
        .required(),
    text: Joi.string()
        .required()
    }).required()
})