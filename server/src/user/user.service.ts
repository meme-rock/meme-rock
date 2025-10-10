import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Miner, MinerDocument } from 'src/schemas/miner.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { EMinerLevel } from 'src/common/enums/miners.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Miner.name) private minerModel: Model<MinerDocument>,
  ) {}

  //! Loading Service
  async loading(_id: string, user: CreateUserDto) {
    try {
      console.log('Loading service started for user:', _id);

      // Find LEVEL_1 miner first
      const level1Miner = await this.minerModel.findOne({
        level: EMinerLevel.LEVEL_1,
      });

      if (!level1Miner) {
        throw new Error('LEVEL_1 miner not found in database');
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
                miner: level1Miner._id,
                stones: 0,
                level: 0,
                profit_per_hour: 0,
                is_premium: false,
                auto_collector: false,
              },
            },
          },
          {
            upsert: true, // Create if doesn't exist
            new: true, // Return updated document
            setDefaultsOnInsert: true, // Apply schema defaults
          },
        )
        .populate('game_data.miner');

      console.log('User loaded/updated successfully:', _id);
      return {
        user: updatedUser,
        message: updatedUser.game_data?.miner
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
}
