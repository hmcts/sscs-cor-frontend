const Joi = require('joi');

const maxCharacters = 10000;

function answerValidation(answer) {
  const schema = Joi.string()
    .required()
    .max(maxCharacters)
    .options({
      language: {
        any: { empty: '!!Enter some text' },
        string: { max: '!!Too much text' }
      }
    });

  const result = schema.validate(answer);
  let error = false;

  if (result.error) {
    error = result.error.details[0].message;
  }

  return error;
}

module.exports = {
  answerValidation
};
