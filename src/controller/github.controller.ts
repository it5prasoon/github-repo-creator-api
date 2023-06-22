import { Controller, Get, Post, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GithubService } from '../services/github.service';
import { UserService } from '../services/user.service';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/interfaces';

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
    console.log(req);
    const cookiesString = req.headers.cookie;
    let accessToken, userName;
    if (cookiesString) {
      const cookies = cookiesString.split(';').map((cookie) => cookie.trim());
      cookies.forEach((cookie) => {
        if (cookie.startsWith('accessToken=')) {
          accessToken = cookie.substring('accessToken='.length);
        } else if (cookie.startsWith('userName=')) {
          userName = cookie.substring('userName='.length);
        }
      });
    } else {
      console.log('No cookies found.');
    }

    const repoName = req.body.repoName;
    const repositoryCreatedData = await this.githubService.createRepository(
      accessToken,
      repoName,
    );

    await this.githubService.addSampleCode(accessToken, repoName, userName);
    res.json(repositoryCreatedData);
  }
}
