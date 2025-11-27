import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Miner, MinerDocument } from 'src/schemas/miner.schema';
import { CreateMinerDto } from './dto/miners.dto';
import { Hilti, HiltiDocument } from 'src/schemas/hilti.schema';
import { CreateHiltiDto } from './dto/hiltis.dto';
import { CreateBoosterDto } from './dto/boosters.dto';
import { Booster, BoosterDocument } from 'src/schemas/booster.schema';
import { MarketItem, MarketItemDocument } from 'src/schemas/market.schema';
import { CreateMarketItemDto } from './dto/market.dto';
import { Task, TaskDocument } from 'src/schemas/task.schema';
import { CreateTaskDto } from './dto/tasks.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Miner.name) private minerModel: Model<MinerDocument>,
    @InjectModel(Hilti.name) private hiltiModel: Model<HiltiDocument>,
    @InjectModel(Booster.name) private boosterModel: Model<BoosterDocument>,
    @InjectModel(MarketItem.name)
    private marketItemModel: Model<MarketItemDocument>,
    @InjectModel(Task.name)
    private taskModel: Model<TaskDocument>,
  ) {}

  //! HILTIS
  async getHiltis() {
    try {
      return this.hiltiModel.find();
    } catch (error) {
      console.log('Error: ', error);
      return {
        error: error,
      };
    }
  }

  async createHilti(hilti: CreateHiltiDto) {
    try {
      const createdHilti = await this.hiltiModel.create(hilti);
      return {
        hilti: createdHilti,
        message: 'Hilti created successfully',
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        error: error,
      };
    }
  }
  async updateHilti(id: string, hilti: CreateHiltiDto) {
    try {
      const updatedHilti = await this.hiltiModel.findOneAndUpdate(
        { _id: id },
        hilti,
        {
          new: true,
        },
      );
      return {
        hilti: updatedHilti,
        message: 'Hilti updated successfully',
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        error: error,
      };
    }
  }

  //! MINERS
  async getMiners() {
    try {
      return this.minerModel.find();
    } catch (error) {
      console.log('Error: ', error);
      return {
        error: error,
      };
    }
  }
  async createMiner(miner: CreateMinerDto) {
    try {
      const createdMiner = await this.minerModel.create(miner);
      return {
        miner: createdMiner,
        message: 'Miner created successfully',
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        error: error,
      };
    }
  }
  async updateMiner(id: string, miner: CreateMinerDto) {
    try {
      const updatedMiner = await this.minerModel.findOneAndUpdate(
        { _id: id },
        miner,
        {
          new: true,
        },
      );
      return {
        miner: updatedMiner,
        message: 'Miner updated successfully',
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        error: error,
      };
    }
  }

  //! BOOSTERS
  async getBoosters() {
    try {
      return this.boosterModel.find();
    } catch (error) {
      console.log('Error: ', error);
      return {
        error: error,
      };
    }
  }

  async createBooster(booster: CreateBoosterDto) {
    try {
      const createdBooster = await this.boosterModel.create(booster);
      return {
        booster: createdBooster,
        message: 'Booster created successfully',
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        error: error,
      };
    }
  }
  async updateBooster(id: string, booster: CreateBoosterDto) {
    try {
      const updatedBooster = await this.boosterModel.findOneAndUpdate(
        { _id: id },
        booster,
        {
          new: true,
        },
      );
      return {
        booster: updatedBooster,
        message: 'Booster updated successfully',
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        error: error,
      };
    }
  }

  //! MARKET
  async getMarket() {
    try {
      return this.marketItemModel.find();
    } catch (error) {
      console.log('Error: ', error);
      return {
        error: error,
      };
    }
  }

  async createMarketItem(marketItem: CreateMarketItemDto) {
    try {
      const createdMarketItem = await this.marketItemModel.create(marketItem);
      return {
        marketItem: createdMarketItem,
        message: 'Market item created successfully',
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        error: error,
      };
    }
  }

  async updateMarketItem(id: string, marketItem: CreateMarketItemDto) {
    try {
      const updatedMarketItem = await this.marketItemModel.findOneAndUpdate(
        { _id: id },
        marketItem,
        {
          new: true,
        },
      );
      return {
        marketItem: updatedMarketItem,
        message: 'Market item updated successfully',
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        error: error,
      };
    }
  }

  //! TASKS
  async getTasks() {
    try {
      return this.taskModel.find();
    } catch (error) {
      console.log('Error: ', error);
      return {
        error: error,
      };
    }
  }

  async createTask(task: CreateTaskDto) {
    try {
      const createdTask = await this.taskModel.create(task);
      return {
        task: createdTask,
        message: 'Task created successfully',
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        error: error,
      };
    }
  }

  async updateTask(id: string, task: CreateTaskDto) {
    try {
      const updatedTask = await this.taskModel.findOneAndUpdate(
        { _id: id },
        task,
        {
          new: true,
        },
      );
      return {
        task: updatedTask,
        message: 'Task updated successfully',
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        error: error,
      };
    }
  }
}
