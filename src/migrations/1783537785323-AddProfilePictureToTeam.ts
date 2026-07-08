import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfilePictureToTeam1783537785323 implements MigrationInterface {
  name = 'AddProfilePictureToTeam1783537785323';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('teams', 'profilePicture');
    if (!hasColumn) {
      await queryRunner.query(
        `ALTER TABLE "teams" ADD "profilePicture" character varying`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('teams', 'profilePicture');
    if (hasColumn) {
      await queryRunner.query(
        `ALTER TABLE "teams" DROP COLUMN "profilePicture"`,
      );
    }
  }
}
