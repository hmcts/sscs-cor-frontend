import moment = require('moment');

function dateFormat(dateString: string, format: string) {
  const date = moment(dateString, format);
  return date.format('DD-MM-YYYY');
}

export { dateFormat };
