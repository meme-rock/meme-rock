import { Controller, Get, Param } from '@nestjs/common';
import { RanksService } from './ranks.service';

@Controller('ranks')
export class RanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Get('get-leaderboard/:user_id')
  async getLeaderboard(@Param('user_id') user_id: string) {
    return await this.ranksService.getLeaderBoard(user_id);
  }

  @Get('get-weekly-invites-leaderboard')
  async getWeeklyInvitesLeaderboard() {
    return await this.ranksService.getWeeklyInvitesLeaderboard();
  }
}
