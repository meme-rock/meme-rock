import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  //! Loading Service
  async loading(_id: string, user: CreateUserDto) {
    try {
      const dbUser = await this.userModel.findById(_id);
      if (!dbUser) {
        console.log('dbUser not found, creating new user');
        const createdUser = await this.userModel.create({
          _id: _id,
          telegram_data: user.telegram_data,
          game_data: {},
        });
        return {
          user: createdUser,
          message: 'User created successfully',
        };
      }
      console.log('dbUser found, updating user');
      const updatedUser = await this.userModel.findByIdAndUpdate(_id, user, {
        new: true,
      });
      return {
        user: updatedUser,
        message: 'User updated successfully',
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        error: error,
      };
    }
  }
}
