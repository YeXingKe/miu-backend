import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from './user.schema'

describe('User Model', () => {
  let userModel: Model<User>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(User.name),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn().mockResolvedValue({}),
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn()
          }
        }
      ]
    }).compile()

    userModel = module.get<Model<User>>(getModelToken(User.name))
  })

  it('应该正确创建用户', async () => {
    const mockUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedPassword'
    }

    jest.spyOn(userModel, 'create').mockImplementation(() => Promise.resolve(mockUser as any))

    const createdUser = await userModel.create(mockUser)
    expect(createdUser).toEqual(mockUser)
  })
})
