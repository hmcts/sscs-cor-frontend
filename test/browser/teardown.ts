import * as sidam from 'test/fixtures/sidam';

export async function deleteIdamUser(user) {
  try {
    return await sidam.deleteUser(user);
  } catch (error) {
    return await Promise.reject(error);
  }
}
