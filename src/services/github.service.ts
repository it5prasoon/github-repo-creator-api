import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubService {
  async createRepository(accessToken: string, repoName: string) {
    const octokit = new Octokit({ auth: accessToken });
    try {
      const { data } = await octokit.repos.createForAuthenticatedUser({
        name: repoName,
      });
      return {
        statusCode: 200,
        body: JSON.stringify(data),
        message: 'Repository created successfully',
        repository: {
          name: JSON.stringify(repoName),
        },
      };
    } catch (error) {
      if (error.status === 422) {
        throw {
          statusCode: 422,
          message: 'Repository name already exists',
          errors: JSON.stringify(error.errors),
        };
      } else {
        throw error; // rethrow the error if it's not related to repository name existence
      }
    }
  }

  async addSampleCode(accessToken: string, repoName: string, userName: string) {
    const octokit = new Octokit({ auth: accessToken });

    const content = 'console.log("Hello, World!");';
    await octokit.repos.createOrUpdateFileContents({
      owner: userName, // Replace with the repository owner
      repo: repoName,
      path: 'sample.js',
      message: 'Add sample file',
      content: Buffer.from(content).toString('base64'),
    });
  }
}
