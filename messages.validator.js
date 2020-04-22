const Joi = require('@hapi/joi');

class BadRequestException extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

const echoAtTimeSchema = Joi.object({
  time: Joi.number().required(),
  message: Joi.string().allow('').required(),
});

const validateEchoAtTime = () => (req, res, next) => {
  const { error, value } = echoAtTimeSchema.validate(req.body, { abortEarly: false });
  if (error) return next(new BadRequestException(error));
  if (value.time < Date.now()) return next(new BadRequestException('ValidationError: "time" has to be in a future'));
  return next();
}

module.exports = validateEchoAtTime;
