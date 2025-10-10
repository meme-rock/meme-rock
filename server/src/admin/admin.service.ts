import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Miner, MinerDocument } from 'src/schemas/miner.schema';
import { CreateMinerDto } from './dto/miners.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Miner.name) private minerModel: Model<MinerDocument>,
  ) {}
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
      const updatedMiner = await this.minerModel.findByIdAndUpdate(id, miner, {
        new: true,
      });
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
}
