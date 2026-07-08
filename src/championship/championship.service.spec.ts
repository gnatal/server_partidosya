import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChampionshipService } from './championship.service';
import { Championship } from './entities/championship.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Team } from '../team/entities/team.entity';
import { User } from '../user/entities/user.entity';
import { Visitor } from '../user/entities/visitor.entity';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('ChampionshipService (Team Operations)', () => {
  let service: ChampionshipService;

  const mockChampionshipRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockStaffRepository = {
    findOne: jest.fn(),
  };

  const mockTeamRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockVisitorRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChampionshipService,
        {
          provide: getRepositoryToken(Championship),
          useValue: mockChampionshipRepository,
        },
        {
          provide: getRepositoryToken(Staff),
          useValue: mockStaffRepository,
        },
        {
          provide: getRepositoryToken(Team),
          useValue: mockTeamRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Visitor),
          useValue: mockVisitorRepository,
        },
      ],
    }).compile();

    service = module.get<ChampionshipService>(ChampionshipService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addTeam', () => {
    const userId = 'user-owner-1';
    const championshipId = 'championship-1';

    it('should throw ForbiddenException if user is not staff', async () => {
      mockStaffRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addTeam(championshipId, { teamId: 'team-1' }, userId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if championship is not found', async () => {
      mockStaffRepository.findOne.mockResolvedValue({ id: 'staff-1' });
      mockChampionshipRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addTeam(championshipId, { teamId: 'team-1' }, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if existing team is not found', async () => {
      mockStaffRepository.findOne.mockResolvedValue({ id: 'staff-1' });
      mockChampionshipRepository.findOne.mockResolvedValue({
        id: championshipId,
        teams: [],
      });
      mockTeamRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addTeam(championshipId, { teamId: 'invalid-team' }, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should add an existing team successfully if not already associated', async () => {
      const mockTeam = { id: 'team-1', name: 'Existing Team' } as Team;
      const mockChampionship = {
        id: championshipId,
        teams: [],
      } as unknown as Championship;

      mockStaffRepository.findOne.mockResolvedValue({ id: 'staff-1' });
      mockChampionshipRepository.findOne
        .mockResolvedValueOnce(mockChampionship) // first find in addTeam
        .mockResolvedValueOnce({
          ...mockChampionship,
          teams: [mockTeam],
        }); // findOne inside return findOne
      mockTeamRepository.findOne.mockResolvedValue(mockTeam);
      mockChampionshipRepository.save.mockResolvedValue({} as any);

      const result = await service.addTeam(
        championshipId,
        { teamId: 'team-1' },
        userId,
      );

      expect(mockChampionshipRepository.save).toHaveBeenCalled();
      expect(mockChampionship.teams).toContain(mockTeam);
      expect(result.teams).toContain(mockTeam);
    });

    it('should create and add a new team successfully', async () => {
      const newTeam = { id: 'new-team-1', name: 'New Team' } as Team;
      const mockChampionship = {
        id: championshipId,
        teams: [],
      } as unknown as Championship;

      mockStaffRepository.findOne.mockResolvedValue({ id: 'staff-1' });
      mockChampionshipRepository.findOne
        .mockResolvedValueOnce(mockChampionship)
        .mockResolvedValueOnce({
          ...mockChampionship,
          teams: [newTeam],
        });

      mockTeamRepository.create.mockReturnValue(newTeam);
      mockTeamRepository.save.mockResolvedValue(newTeam);
      mockChampionshipRepository.save.mockResolvedValue({} as any);

      const result = await service.addTeam(
        championshipId,
        { name: 'New Team' },
        userId,
      );

      expect(mockTeamRepository.create).toHaveBeenCalledWith({
        name: 'New Team',
        profilePicture: undefined,
        captainUserId: undefined,
        captainVisitorId: undefined,
      });
      expect(mockTeamRepository.save).toHaveBeenCalledWith(newTeam);
      expect(mockChampionshipRepository.save).toHaveBeenCalled();
      expect(result.teams).toContain(newTeam);
    });

    it('should throw NotFoundException if captain user does not exist when creating new team', async () => {
      mockStaffRepository.findOne.mockResolvedValue({ id: 'staff-1' });
      mockChampionshipRepository.findOne.mockResolvedValue({
        id: championshipId,
        teams: [],
      });
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addTeam(
          championshipId,
          { name: 'New Team', captainUserId: 'invalid-user' },
          userId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if captain visitor does not exist when creating new team', async () => {
      mockStaffRepository.findOne.mockResolvedValue({ id: 'staff-1' });
      mockChampionshipRepository.findOne.mockResolvedValue({
        id: championshipId,
        teams: [],
      });
      mockVisitorRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addTeam(
          championshipId,
          { name: 'New Team', captainVisitorId: 'invalid-visitor' },
          userId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if neither teamId nor name is provided', async () => {
      mockStaffRepository.findOne.mockResolvedValue({ id: 'staff-1' });
      mockChampionshipRepository.findOne.mockResolvedValue({
        id: championshipId,
        teams: [],
      });

      await expect(service.addTeam(championshipId, {}, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('removeTeam', () => {
    const userId = 'user-owner-1';
    const championshipId = 'championship-1';
    const teamId = 'team-1';

    it('should throw ForbiddenException if user is not staff', async () => {
      mockStaffRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeTeam(championshipId, teamId, userId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if championship not found', async () => {
      mockStaffRepository.findOne.mockResolvedValue({ id: 'staff-1' });
      mockChampionshipRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeTeam(championshipId, teamId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if team is not associated with championship', async () => {
      mockStaffRepository.findOne.mockResolvedValue({ id: 'staff-1' });
      mockChampionshipRepository.findOne.mockResolvedValue({
        id: championshipId,
        teams: [],
      });

      await expect(
        service.removeTeam(championshipId, teamId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should successfully remove team from championship', async () => {
      const mockTeam = { id: teamId, name: 'Team to Remove' } as Team;
      const mockChampionship = {
        id: championshipId,
        teams: [mockTeam],
      } as unknown as Championship;

      mockStaffRepository.findOne.mockResolvedValue({ id: 'staff-1' });
      mockChampionshipRepository.findOne
        .mockResolvedValueOnce(mockChampionship)
        .mockResolvedValueOnce({
          ...mockChampionship,
          teams: [],
        });

      const result = await service.removeTeam(championshipId, teamId, userId);

      expect(mockChampionshipRepository.save).toHaveBeenCalled();
      expect(mockChampionship.teams).not.toContain(mockTeam);
      expect(result.teams).not.toContain(mockTeam);
    });
  });
});
