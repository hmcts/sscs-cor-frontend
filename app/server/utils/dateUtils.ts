import moment = require('moment');

function dd_mm_yyyyFormat(dateString: string, format: string) {
  const date = moment(dateString, format);
  return date.format('DD-MM-YYYY');
}

export {
  dd_mm_yyyyFormat
};
