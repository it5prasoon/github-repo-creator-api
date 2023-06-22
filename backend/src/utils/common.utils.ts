export class CommonUtils {
  async getAccessTokenAndUser(cookiesString) {
    let accessToken, userName, repoName;
    if (cookiesString) {
      const cookies = cookiesString.split(';').map((cookie) => cookie.trim());
      cookies.forEach((cookie) => {
        if (cookie.startsWith('accessToken=')) {
          accessToken = cookie.substring('accessToken='.length);
        } else if (cookie.startsWith('userName=')) {
          userName = cookie.substring('userName='.length);
        } else if (cookie.startsWith('repoName=')) {
          repoName = cookie.substring('repoName='.length);
        }
      });
    } else {
      console.log('No cookies found.');
    }

    return {
      accessToken: accessToken,
      userName: userName,
      repoName: repoName,
    };
  }
}
