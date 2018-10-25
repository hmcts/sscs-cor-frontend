const config = require('config');
const request = require('request-promise');

const apiUrl = config.get('api.url');
const httpProxy = config.get('httpProxy');

export async function uploadEvidence(hearingId, questionId, file) {
  try {
    const body = await request.post({
      url: `${apiUrl}/continuous-online-hearings/${hearingId}/questions/${questionId}/evidence`,
      formData: {
        file: {
          value: file.buffer,
          options: {
            filename: file.originalname,
            contentType: file.mimetype
          }
        }
      }
    });
    return Promise.resolve(body);
  } catch (error) {
    return Promise.reject(error);
  }
}
