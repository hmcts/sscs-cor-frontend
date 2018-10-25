const config = require('config');
const request = require('request-promise');

const apiUrl = config.get('api.url');

export async function upload(hearingId, questionId, file) {
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

export async function remove(hearingId, questionId, fileId) {
  try {
    await request
      .delete(`${apiUrl}/continuous-online-hearings/${hearingId}/questions/${questionId}/evidence/${fileId}`)
      .set('Content-Length', '0')
      .send();
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}
