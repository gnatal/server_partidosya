import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockProfileRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return a profile if found', async () => {
      const mockProfile = {
        id: 'p-1',
        userId: 'u-1',
        location: 'NYC',
      } as Profile;
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.getProfile('u-1');
      expect(result).toBe(mockProfile);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'u-1' },
      });
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('u-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('upsertProfile', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.upsertProfile('u-1', { name: 'John' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update existing profile if it exists', async () => {
      const mockUser = { id: 'u-1' } as User;
      const mockProfile = {
        id: 'p-1',
        userId: 'u-1',
        name: 'Old Name',
      } as Profile;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockProfileRepository.save.mockImplementation((x) => Promise.resolve(x));

      const result = await service.upsertProfile('u-1', {
        name: 'New Name',
        age: 30,
      });
      expect(result.name).toBe('New Name');
      expect(result.age).toBe(30);
      expect(mockProfileRepository.save).toHaveBeenCalledWith(mockProfile);
    });

    it('should create new profile if it does not exist', async () => {
      const mockUser = { id: 'u-1' } as User;
      const mockProfileData = { name: 'John', age: 30 };
      const newProfile = { userId: 'u-1', ...mockProfileData } as Profile;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockProfileRepository.findOne.mockResolvedValue(null);
      mockProfileRepository.create.mockReturnValue(newProfile);
      mockProfileRepository.save.mockImplementation((x) => Promise.resolve(x));

      const result = await service.upsertProfile('u-1', mockProfileData);
      expect(result).toBe(newProfile);
      expect(mockProfileRepository.create).toHaveBeenCalledWith({
        ...mockProfileData,
        userId: 'u-1',
      });
      expect(mockProfileRepository.save).toHaveBeenCalledWith(newProfile);
    });
  });

  describe('updateLocation', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.updateLocation('u-1', 'Boston')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update location of existing profile', async () => {
      const mockUser = { id: 'u-1' } as User;
      const mockProfile = {
        id: 'p-1',
        userId: 'u-1',
        location: 'NYC',
      } as Profile;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockProfileRepository.save.mockImplementation((x) => Promise.resolve(x));

      const result = await service.updateLocation('u-1', 'Boston');
      expect(result.location).toBe('Boston');
      expect(mockProfileRepository.save).toHaveBeenCalledWith(mockProfile);
    });

    it('should automatically create profile if not exists', async () => {
      const mockUser = { id: 'u-1' } as User;
      const newProfile = { userId: 'u-1', location: 'Boston' } as Profile;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockProfileRepository.findOne.mockResolvedValue(null);
      mockProfileRepository.create.mockReturnValue(newProfile);
      mockProfileRepository.save.mockImplementation((x) => Promise.resolve(x));

      const result = await service.updateLocation('u-1', 'Boston');
      expect(result).toBe(newProfile);
      expect(mockProfileRepository.create).toHaveBeenCalledWith({
        userId: 'u-1',
        location: 'Boston',
      });
      expect(mockProfileRepository.save).toHaveBeenCalledWith(newProfile);
    });
  });

  describe('updateUsername', () => {
    it('should throw ConflictException if username is already taken by another user', async () => {
      const existingUser = { id: 'u-2', username: 'taken' } as User;
      mockUserRepository.findOne.mockResolvedValueOnce(existingUser); // findOne for uniqueness

      await expect(service.updateUsername('u-1', 'taken')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if current user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null); // not taken
      mockUserRepository.findOne.mockResolvedValueOnce(null); // user does not exist

      await expect(
        service.updateUsername('u-1', 'newusername'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update username successfully', async () => {
      const mockUser = {
        id: 'u-1',
        username: 'oldname',
        password: 'hashedpassword',
      } as User;
      mockUserRepository.findOne.mockResolvedValueOnce(null); // not taken
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser); // user exists
      mockUserRepository.save.mockImplementation((x) => Promise.resolve(x));

      const result = await service.updateUsername('u-1', 'newname');
      expect(result.username).toBe('newname');
      expect(result.password).toBeUndefined(); // Check that password is deleted from response
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should allow current user to keep/update their own username without conflict', async () => {
      const mockUser = { id: 'u-1', username: 'myname' } as User;
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser); // first query returns mockUser itself
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser); // user exists query
      mockUserRepository.save.mockImplementation((x) => Promise.resolve(x));

      const result = await service.updateUsername('u-1', 'myname');
      expect(result.username).toBe('myname');
    });
  });
});
