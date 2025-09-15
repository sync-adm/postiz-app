import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { CheckPolicies } from '@gitroom/backend/services/auth/permissions/permissions.ability';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFactory } from '@gitroom/nestjs-libraries/upload/upload.factory';
import { MediaService } from '@gitroom/nestjs-libraries/database/prisma/media/media.service';
import { GetPostsDto } from '@gitroom/nestjs-libraries/dtos/posts/get.posts.dto';
import {
  AuthorizationActions,
  Sections,
} from '@gitroom/backend/services/auth/permissions/permission.exception.class';
import { VideoDto } from '@gitroom/nestjs-libraries/dtos/videos/video.dto';
import { VideoFunctionDto } from '@gitroom/nestjs-libraries/dtos/videos/video.function.dto';

@ApiTags('Public API')
@Controller('/public/v1')
export class PublicIntegrationsController {
  private storage = UploadFactory.createStorage();

  constructor(
    private _integrationService: IntegrationService,
    private _postsService: PostsService,
    private _mediaService: MediaService
  ) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSimple(
    @GetOrgFromRequest() org: Organization,
    @UploadedFile('file') file: Express.Multer.File
  ) {
    if (!file) {
      throw new HttpException({ msg: 'No file provided' }, 400);
    }

    const getFile = await this.storage.uploadFile(file);
    return this._mediaService.saveFile(
      org.id,
      getFile.originalname,
      getFile.path
    );
  }

  @Get('/posts')
  async getPosts(
    @GetOrgFromRequest() org: Organization,
    @Query() query: GetPostsDto
  ) {
    const posts = await this._postsService.getPosts(org.id, query);
    return {
      posts,
      // comments,
    };
  }

  @Post('/posts')
  @CheckPolicies([AuthorizationActions.Create, Sections.POSTS_PER_MONTH])
  async createPost(
    @GetOrgFromRequest() org: Organization,
    @Body() rawBody: any
  ) {
    const body = await this._postsService.mapTypeToPost(
      rawBody,
      org.id,
      rawBody.type === 'draft'
    );
    body.type = rawBody.type;

    console.log(JSON.stringify(body, null, 2));
    return this._postsService.createPost(org.id, body);
  }

  @Delete('/posts/:id')
  async deletePost(
    @GetOrgFromRequest() org: Organization,
    @Param() body: { id: string }
  ) {
    const getPostById = await this._postsService.getPost(org.id, body.id);
    return this._postsService.deletePost(org.id, getPostById.group);
  }

  @Get('/is-connected')
  async getActiveIntegrations(@GetOrgFromRequest() org: Organization) {
    return { connected: true };
  }

  @Get('/integrations')
  async listIntegration(@GetOrgFromRequest() org: Organization) {
    return (await this._integrationService.getIntegrationsList(org.id)).map(
      (org) => ({
        id: org.id,
        name: org.name,
        identifier: org.providerIdentifier,
        picture: org.picture,
        disabled: org.disabled,
        profile: org.profile,
        customer: org.customer
          ? {
              id: org.customer.id,
              name: org.customer.name,
            }
          : undefined,
      })
    );
  }

  @Post('/generate-video')
  generateVideo(
    @GetOrgFromRequest() org: Organization,
    @Body() body: VideoDto
  ) {
    return this._mediaService.generateVideo(org, body);
  }

  @Get('/instagram-posts')
  async getInstagramPosts(
    @GetOrgFromRequest() org: Organization,
    @Query('integrationId') integrationId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
    @Query('after') after?: string,
    @Query('fields') fields?: string
  ) {
    if (!integrationId) {
      throw new HttpException({ msg: 'Integration ID is required' }, 400);
    }

    const integration = await this._integrationService.getIntegrationById(
      org.id,
      integrationId
    );

    if (!integration) {
      throw new HttpException({ msg: 'Integration not found' }, 404);
    }

    try {
      const defaultFields =
        'id,caption,media_type,media_url,thumbnail_url,timestamp,permalink';
      const fieldsToUse = fields || defaultFields;

      const baseUrl = 'https://graph.instagram.com/me/media';
      const params = new URLSearchParams({
        fields: fieldsToUse,
        access_token: integration.token,
      });

      if (limit) {
        params.append('limit', limit);
      }

      if (before) {
        params.append('before', before);
      }

      if (after) {
        params.append('after', after);
      }

      const response = await fetch(`${baseUrl}?${params.toString()}`);

      if (!response.ok) {
        throw new HttpException(
          {
            msg: 'Failed to fetch Instagram media',
            status: response.status,
            statusText: response.statusText,
          },
          response.status
        );
      }

      const instagramData = await response.json();

      return instagramData;
    } catch (error) {
      throw new HttpException(
        {
          msg: 'Error fetching Instagram data',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  }

  @Post('/video/function')
  videoFunction(@Body() body: VideoFunctionDto) {
    return this._mediaService.videoFunction(
      body.identifier,
      body.functionName,
      body.params
    );
  }
}
