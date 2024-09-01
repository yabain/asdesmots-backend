import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JsonResponse } from 'src/shared/helpers/json-response';
import { UsersService } from 'src/user/services';
import { CompetitionGameService } from '../services';
import { Request, Response } from 'express';
import { GameSubscriptionService } from '../services/game-subscription.service';
import { AuthGuard } from 'src/authorization/guards/auth.guard';
import { PlayerUnSubscriptionDTO } from '../dtos';

@Controller('game-subscriptions')
export class GameSubscriptionController {
  constructor(
    private jsonResponse: JsonResponse,
    private usersService: UsersService,
    private gameSubscriptionService: GameSubscriptionService,
    private competitionGameService: CompetitionGameService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async subscribeToCompetition(
    @Req() request: Request,
    @Body() data: any,
    @Res() res: Response,
  ) {
    const user = request.authUser;
    const authenticatedUser = await this.usersService.findOneByField({
      email: user.email,
    });
    await this.gameSubscriptionService.subscribePlayer(
      data.gameId,
      authenticatedUser._id,
    );

    return res
      .status(HttpStatus.OK)
      .json(this.jsonResponse.success('Subscription procced successfully'));
  }

  @Get('/arcade/:arcadeId')
  async getArcadeSubscribers(
    @Param('arcadeId') arcadeId: string,
    @Res() res: Response,
  ) {
    const data = await this.gameSubscriptionService.getArcadeSubscribers(
      arcadeId,
    );
    return res
      .status(HttpStatus.OK)
      .json(this.jsonResponse.success('Competition subscribers', data));
  }

  @Get('/competition/:competitionId')
  async getCompetitionSubscribers(
    @Param('competitionId') competitionId: string,
    @Res() res: Response,
  ) {
    const data = await this.gameSubscriptionService.getCompetitionSubscribers(
      competitionId,
    );
    return res
      .status(HttpStatus.OK)
      .json(this.jsonResponse.success('Competition subscribers', data));
  }

  @Post('/unsubscribe')
  async unsubscribePlayer(
    @Res() res: Response,
    @Body() gameSubscriptionDTO: PlayerUnSubscriptionDTO
  ) {
    await this.gameSubscriptionService.unsubscribePlayer(gameSubscriptionDTO);
    return res
      .status(HttpStatus.OK)
      .json(this.jsonResponse.success('Player successfully unsubscribed'));
  }
}
