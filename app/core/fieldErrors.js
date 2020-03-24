const setErrorFields = (field, fields, result, errors) => {
  fields.error = true;
  fields[field].error = true;
  fields[field].errorMessage = result.error.message;

  const type = result.error.details[0].type;
  if (type === 'any.empty') {
    fields[field].errorHeading = errors.emptyStringHeading;
  } else {
    fields[field].errorHeading = errors.notValidHeading;
  }
  return fields;
};

module.exports = { setErrorFields };
