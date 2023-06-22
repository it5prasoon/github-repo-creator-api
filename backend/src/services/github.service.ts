import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubService {
  async createRepository(accessToken: string, repoName: string) {
    const octokit = new Octokit({ auth: accessToken });
    try {
      await octokit.repos.createForAuthenticatedUser({
        name: repoName,
      });
      return {
        statusCode: 200,
        message: 'Repository created successfully.',
      };
    } catch (error) {
      if (error.status === 422) {
        throw {
          statusCode: 422,
          message: 'Repository name already exists.',
        };
      } else {
        throw error; // rethrow the error if it's not related to repository name existence
      }
    }
  }

  async addSampleCode(accessToken: string, repoName: string, userName: string) {
    const octokit = new Octokit({ auth: accessToken });

    const content =
      'console.log("Hello, World! - From Github Repository Creator");';
    await octokit.repos.createOrUpdateFileContents({
      owner: userName, // Replace with the repository owner
      repo: repoName,
      path: 'sample.js',
      message: 'Add sample file',
      content: Buffer.from(content).toString('base64'),
    });

    return {
      statusCode: 200,
      message: 'File added successfully.',
    };
  }
}
