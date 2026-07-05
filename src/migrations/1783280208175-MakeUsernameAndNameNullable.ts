import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeUsernameAndNameNullable1783280208175 implements MigrationInterface {
    name = 'MakeUsernameAndNameNullable1783280208175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "username" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "name" SET NOT NULL`);
    }

}
