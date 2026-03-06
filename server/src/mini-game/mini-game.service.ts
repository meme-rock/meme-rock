import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import {
  MiniGameCatalog,
  MiniGameCatalogDocument,
  MiniGameConfig,
  MiniGameConfigDocument,
  MiniGameProgress,
  MiniGameProgressDocument,
} from 'src/schemas/mini-games';
import { User, UserDocument } from 'src/schemas/user.schema';
import { GameEngine } from './engines/base.engine';
import { DrillEngine } from './engines/drill.engine';
import { DRILL_CATALOG_SEED, DRILL_CONFIG_SEED } from './seed/drill-seed';

@Injectable()
export class MiniGameService implements OnModuleInit {
  private readonly logger = new Logger(MiniGameService.name);

  /** Registry: game_type → engine instance */
  private readonly engines = new Map<string, GameEngine>();

  /** Cached configs: game_type → config document */
  private readonly configs = new Map<string, MiniGameConfigDocument>();

  constructor(
    @InjectModel(MiniGameCatalog.name)
    private catalogModel: Model<MiniGameCatalogDocument>,
    @InjectModel(MiniGameConfig.name)
    private configModel: Model<MiniGameConfigDocument>,
    @InjectModel(MiniGameProgress.name)
    private progressModel: Model<MiniGameProgressDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    // Auto-seed catalog & config (upsert - won't overwrite existing)
    await this.catalogModel
      .updateOne(
        { _id: DRILL_CATALOG_SEED._id },
        { $setOnInsert: DRILL_CATALOG_SEED },
        { upsert: true },
      )
      .exec();

    await this.configModel
      .updateOne(
        { _id: DRILL_CONFIG_SEED._id },
        { $setOnInsert: DRILL_CONFIG_SEED },
        { upsert: true },
      )
      .exec();

    // Load all configs and initialize engines
    await this.loadConfigs();
    this.logger.log(
      `Mini-game engines initialized: ${[...this.engines.keys()].join(', ')}`,
    );
  }

  private async loadConfigs() {
    const allConfigs = await this.configModel.find().exec();

    for (const config of allConfigs) {
      this.configs.set(config._id, config);

      let engine: GameEngine | undefined;
      switch (config._id) {
        case 'DRILL':
          engine = new DrillEngine();
          break;
        // Future: case 'SLOTS': engine = new SlotsEngine(); break;
      }

      if (engine) {
        engine.loadConfig(config);
        this.engines.set(config._id, engine);
      }
    }
  }

  async reloadConfigs() {
    this.engines.clear();
    this.configs.clear();
    await this.loadConfigs();
  }

  private getEngine(gameType: string): GameEngine {
    const engine = this.engines.get(gameType);
    if (!engine) {
      throw new BadRequestException(`Unknown game type: ${gameType}`);
    }
    return engine;
  }

  private getConfig(gameType: string): MiniGameConfigDocument {
    const config = this.configs.get(gameType);
    if (!config) {
      throw new BadRequestException(`No config for game type: ${gameType}`);
    }
    return config;
  }

  private needsDailyReset(state: MiniGameProgressDocument): boolean {
    const today = new Date().toISOString().split('T')[0];
    const lastReset = state.last_reset_date
      ? new Date(state.last_reset_date).toISOString().split('T')[0]
      : '';
    return lastReset !== today;
  }

  private async findOrCreateState(
    userId: string,
    gameType: string,
  ): Promise<MiniGameProgressDocument> {
    const engine = this.getEngine(gameType);
    const config = this.getConfig(gameType);

    let state = await this.progressModel
      .findOne({ user_id: userId, game_type: gameType })
      .exec();

    if (!state) {
      state = await this.progressModel.create({
        _id: `${userId}_${gameType}`,
        user_id: userId,
        game_type: gameType,
        daily_plays_left: config.daily_plays,
        ads_watched_today: 0,
        last_reset_date: new Date(),
        active_session: null,
        game_data: engine.getDefaultGameData(),
      });
    }

    // Lazy daily reset
    if (this.needsDailyReset(state)) {
      state = (await this.progressModel
        .findByIdAndUpdate(
          state._id,
          {
            $set: {
              daily_plays_left: config.daily_plays,
              ads_watched_today: 0,
              last_reset_date: new Date(),
              active_session: null,
            },
          },
          { new: true },
        )
        .exec())!;
    }

    return state;
  }

  async getCatalog() {
    const catalog = await this.catalogModel
      .find()
      .sort({ sort_order: 1 })
      .exec();

    return {
      success: true,
      data: catalog.map((item) => ({
        id: item._id,
        title: item.title,
        icon: item.icon,
        path: item.path,
        is_locked: item.is_locked,
        description: item.description,
      })),
    };
  }

  async getState(userId: string, gameType: string) {
    const state = await this.findOrCreateState(userId, gameType);
    const config = this.getConfig(gameType);

    return {
      success: true,
      data: {
        daily_plays_left: state.daily_plays_left,
        ads_watched_today: state.ads_watched_today,
        game_data: state.game_data,
        has_active_session: !!state.active_session,
        config: {
          daily_plays: config.daily_plays,
          max_ads_per_day: config.max_ads_per_day,
          plays_per_ad: config.plays_per_ad,
          max_upgrade_level: config.max_upgrade_level,
          upgrades: config.upgrades.map((u) => ({
            id: u.id,
            name: u.name,
            description: u.description,
            icon: u.icon,
            base_cost: u.base_cost,
            cost_multiplier: u.cost_multiplier,
          })),
        },
      },
    };
  }

  async startSession(userId: string, gameType: string) {
    const engine = this.getEngine(gameType);
    const state = await this.findOrCreateState(userId, gameType);

    if (state.daily_plays_left <= 0) {
      throw new BadRequestException('No daily plays remaining');
    }

    if (state.active_session) {
      throw new BadRequestException('Session already active');
    }

    const { sessionPayload, clientPayload } = engine.generateSession(
      state.daily_plays_left,
      state.game_data,
    );

    const sessionId = randomUUID();

    await this.progressModel
      .findByIdAndUpdate(
        state._id,
        {
          $set: {
            active_session: {
              session_id: sessionId,
              started_at: new Date(),
              ...sessionPayload,
            },
          },
        },
        { new: true },
      )
      .exec();

    return {
      success: true,
      data: {
        session_id: sessionId,
        ...clientPayload,
      },
    };
  }

  async endSession(
    userId: string,
    gameType: string,
    clientReport: Record<string, any>,
  ) {
    const engine = this.getEngine(gameType);

    const state = await this.progressModel
      .findOne({ user_id: userId, game_type: gameType })
      .exec();

    if (!state) {
      throw new NotFoundException('Game state not found');
    }

    if (!state.active_session) {
      throw new BadRequestException('No active session');
    }

    const session = state.active_session;

    // Delegate settlement to the engine
    const result = engine.settleSession(session, state.game_data, clientReport);

    // If time validation failed (playsUsed === 0 and no rewards)
    if (
      result.playsUsed === 0 &&
      result.rewards.stones === 0 &&
      result.rewards.rock_coins === 0
    ) {
      await this.progressModel.findByIdAndUpdate(state._id, {
        $set: { active_session: null },
      });
      throw new BadRequestException('Session completed too quickly');
    }

    // Build atomic update
    const updateSet: Record<string, any> = {
      active_session: null,
      daily_plays_left: state.daily_plays_left - result.playsUsed,
    };

    const updateInc: Record<string, number> = {};
    for (const [key, value] of Object.entries(result.gameDataInc)) {
      if (value !== 0) updateInc[`game_data.${key}`] = value;
    }

    for (const [key, value] of Object.entries(result.gameDataSet)) {
      updateSet[`game_data.${key}`] = value;
    }

    const updatedState = (await this.progressModel
      .findByIdAndUpdate(
        state._id,
        {
          $set: updateSet,
          ...(Object.keys(updateInc).length > 0 ? { $inc: updateInc } : {}),
        },
        { new: true },
      )
      .exec())!;

    // Update user balance atomically
    const userUpdateFields: Record<string, number> = {};
    if (result.rewards.stones > 0)
      userUpdateFields['balance_data.stone'] = result.rewards.stones;
    if (result.rewards.rock_coins > 0)
      userUpdateFields['airdrop_data.rock_coins'] = result.rewards.rock_coins;

    if (Object.keys(userUpdateFields).length > 0) {
      await this.userModel.findByIdAndUpdate(userId, {
        $inc: userUpdateFields,
      });
    }

    return {
      success: true,
      data: {
        rewards: result.rewards,
        new_state: {
          daily_plays_left: updatedState.daily_plays_left,
          ads_watched_today: updatedState.ads_watched_today,
          game_data: updatedState.game_data,
          has_active_session: false,
        },
      },
    };
  }

  async upgrade(userId: string, gameType: string, upgradeId: string) {
    const engine = this.getEngine(gameType);
    const config = this.getConfig(gameType);
    const maxLevel = config.max_upgrade_level;
    const currencyField = config.upgrade_currency_field;

    const state = await this.progressModel
      .findOne({ user_id: userId, game_type: gameType })
      .exec();

    if (!state) {
      throw new NotFoundException('Game state not found');
    }

    const currentLevel = state.game_data?.upgrade_levels?.[upgradeId] || 0;
    if (currentLevel >= maxLevel) {
      throw new BadRequestException('Upgrade already at max level');
    }

    const cost = engine.calculateUpgradeCost(upgradeId, currentLevel);
    if (cost === null) {
      throw new BadRequestException('Invalid upgrade');
    }

    const currency = state.game_data?.[currencyField] || 0;
    if (currency < cost) {
      throw new BadRequestException(`Insufficient ${currencyField}`);
    }

    const updatedState = (await this.progressModel
      .findByIdAndUpdate(
        state._id,
        {
          $inc: {
            [`game_data.${currencyField}`]: -cost,
          },
          $set: {
            [`game_data.upgrade_levels.${upgradeId}`]: currentLevel + 1,
          },
        },
        { new: true },
      )
      .exec())!;

    return {
      success: true,
      data: {
        new_level: currentLevel + 1,
        [`new_${currencyField}`]: updatedState.game_data[currencyField],
        upgrade_levels: updatedState.game_data.upgrade_levels,
      },
    };
  }

  async claimAdReward(userId: string, gameType: string) {
    const config = this.getConfig(gameType);

    const state = await this.progressModel
      .findOne({ user_id: userId, game_type: gameType })
      .exec();

    if (!state) {
      throw new NotFoundException('Game state not found');
    }

    if (state.ads_watched_today >= config.max_ads_per_day) {
      throw new BadRequestException('Daily ad limit reached');
    }

    if (state.active_session) {
      throw new BadRequestException(
        'Cannot claim ad reward during active session',
      );
    }

    const updatedState = (await this.progressModel
      .findByIdAndUpdate(
        state._id,
        {
          $inc: {
            daily_plays_left: config.plays_per_ad,
            ads_watched_today: 1,
          },
        },
        { new: true },
      )
      .exec())!;

    return {
      success: true,
      data: {
        daily_plays_left: updatedState.daily_plays_left,
        ads_watched_today: updatedState.ads_watched_today,
      },
    };
  }
}
