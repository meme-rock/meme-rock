import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Miner, MinerDocument } from 'src/schemas/miner.schema';
import { CreateMinerDto } from './dto/miners.dto';
import { Hilti, HiltiDocument } from 'src/schemas/hilti.schema';
import { CreateHiltiDto } from './dto/hiltis.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Miner.name) private minerModel: Model<MinerDocument>,
    @InjectModel(Hilti.name) private hiltiModel: Model<HiltiDocument>,
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
}
