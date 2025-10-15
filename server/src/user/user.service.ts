import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Miner, MinerDocument } from 'src/schemas/miner.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { EMinerLevel } from 'src/common/enums/miners.enum';
import { EHiltiLevel } from 'src/common/enums/hiltis.enum';
import { Hilti, HiltiDocument } from 'src/schemas/hilti.schema';
import { Booster, BoosterDocument } from 'src/schemas/booster.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Miner.name) private minerModel: Model<MinerDocument>,
    @InjectModel(Hilti.name) private hiltiModel: Model<HiltiDocument>,
    @InjectModel(Booster.name) private boosterModel: Model<BoosterDocument>,
  ) {}

  //! Loading Service
  async loading(_id: string, user: CreateUserDto) {
    try {
      console.log('Loading service started for user:', _id);
      const hiltis = await this.hiltiModel.find();
      // Find LEVEL_1 miner and hilti first
      const level1Miner = await this.minerModel.findOne({
        _id: EMinerLevel.LEVEL_1,
      });

      const level1Hilti = await this.hiltiModel.findOne({
        _id: EHiltiLevel.LEVEL_1,
      });

      if (!level1Miner || !level1Hilti) {
        throw new Error('LEVEL_1 miner or hilti not found in database');
      }

      // Use findOneAndUpdate with upsert to handle race conditions
      const updatedUser = await this.userModel
        .findOneAndUpdate(
          { _id: _id }, // Filter
          {
            // Update telegram data always
            $set: {
              telegram_data: user.telegram_data,
            },
            // Set game_data only if it doesn't exist (for new users)
            $setOnInsert: {
              game_data: {
                stones: 0,
                level: 0,
                profit_per_hour: 0,
                is_premium: false,
                auto_collector: false,
                miner_data: {
                  miner: level1Miner._id,
                  last_mine: new Date(),
                },
                hilti_data: {
                  hilti: level1Hilti._id,
                  last_energy_refill: new Date(),
                },
              },
            },
          },
          {
            upsert: true, // Create if doesn't exist
            new: true, // Return updated document
            setDefaultsOnInsert: true, // Apply schema defaults
          },
        )
        .populate('game_data.miner_data.miner')
        .populate('game_data.hilti_data.hilti');

      console.log('User loaded/updated successfully:', _id);
      return {
        user: updatedUser,
        hiltis: hiltis,
        message:
          updatedUser.game_data?.miner_data && updatedUser.game_data?.hilti_data
            ? 'User updated successfully'
            : 'User created successfully',
      };
    } catch (error) {
      console.error('Error in loading service:', error);

      // Handle duplicate key errors gracefully
      if (error.code === 11000) {
        console.log('Duplicate key error, fetching existing user');
        const existingUser = await this.userModel.findById(_id);
        return {
          user: existingUser,
          message: 'User already exists',
        };
      }

      throw error;
    }
  }
  async getBoosters() {
    try {
      const boosters = await this.boosterModel.find();
      return boosters;
    } catch (error) {
      console.error('Error in getBoosters service:', error);
      throw error;
    }
  }
}
