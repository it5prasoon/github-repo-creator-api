import { Controller, Get, Post, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GithubService } from '../services/github.service';
import { UserService } from '../services/user.service';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/interfaces';
import { CommonUtils } from 'src/utils/common.utils';

@Controller('github')
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly userService: UserService,
    private configService: ConfigService<AppConfig>,
  ) {}

  @Get('auth')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Initiates the GitHub OAuth flow
  }

  @Get('auth/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Request() req, @Res() res) {
    const { accessToken, profile } = req.user;

    // Store the access token in sqlite db
    await this.userService.createUser({
      userName: profile.username,
      accessToken,
      refreshToken: null, // Set the refresh token if applicable
      profile: profile, // Store the profile as JSON string
    });

    // Set the access token as a cookie in the response
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true, // Set to true if using HTTPS
    });

    // Set the username as a cookie in the response
    res.cookie('userName', profile.username, {
      httpOnly: true,
      secure: true, // Set to true if using HTTPS
    });

    const frontendURL = this.configService.get<string>('frontend.url'); // Replace with your frontend URL
    return res.redirect(`${frontendURL}`);
  }

  @Post('create-repo')
  async createRepositoryAndAddFiles(@Request() req, @Res() res) {
    const cookiesString = req.headers.cookie;
    const accessTokenUserNameMap =
      await new CommonUtils().getAccessTokenAndUser(cookiesString);
    const accessToken = accessTokenUserNameMap.accessToken;

    console.log(accessTokenUserNameMap);
    const repoName = req.body.repoName;
    const repositoryCreatedDataPromise = new Promise((resolve, reject) => {
      this.githubService
        .createRepository(accessToken, repoName)
        .then(() => {
          console.log('Repository created successfully.');
          resolve({ success: true });
        })
        .catch((error) => {
          reject(error);
        });
    });

    repositoryCreatedDataPromise
      .then((repositoryCreatedData) => {
        res.cookie('repoName', repoName, {
          httpOnly: true,
          secure: true, // Set to true if using HTTPS
        });
        res.json(repositoryCreatedData);
      })
      .catch((error) => {
        console.log(error);
        res
          .status(500)
          .json({ error: 'Failed to create repository and add files.' });
      });
  }

  @Post('upload-files')
  async uploadFiles(@Request() req, @Res() res) {
    const cookiesString = req.headers.cookie;
    const accessTokenUserNameMap = await new CommonUtils().getAccessTokenAndUser(cookiesString); 
    const accessToken = accessTokenUserNameMap.accessToken;
    const userName = accessTokenUserNameMap.userName;
    const repoName = accessTokenUserNameMap.repoName;

    const data = await this.githubService.addSampleCode(
      accessToken,
      repoName,
      userName,
    );
    res.json(data);
  }

  @Post('check-auth')
  async checkAuth(@Request() req, @Res() res) {
    const cookiesString = req.headers.cookie;
    const accessTokenUserNameMap =
      await new CommonUtils().getAccessTokenAndUser(cookiesString);

    let responseData;

    if (accessTokenUserNameMap.accessToken != null) {
      responseData = {
        authorized: true,
        message: 'Authorized',
      };
    } else {
      responseData = {
        authorized: false,
        message: 'Unauthorized',
      };
    }

    res.json(responseData);
  }
}
