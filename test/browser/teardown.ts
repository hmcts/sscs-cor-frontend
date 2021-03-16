import * as sidam from 'test/fixtures/sidam';

export async function deleteIdamUser(user) {
  try {
    console.log('user in teardown is..', user);
    return await sidam.deleteUser(user);
  } catch (error) {
    return Promise.reject(error);
  }
}
