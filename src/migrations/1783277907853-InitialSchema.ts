import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1783277907853 implements MigrationInterface {
  name = 'InitialSchema1783277907853';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "age" integer, "name" character varying NOT NULL, "location" character varying, "picture" character varying, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_315ecd98bd1a42dcf2ec4e2e98" UNIQUE ("userId"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "stands" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP, "result" character varying, "championshipId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6aba2e4805d7572165a079ef621" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "stats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "goals" integer NOT NULL DEFAULT '0', "redCards" integer NOT NULL DEFAULT '0', "yellowCards" integer NOT NULL DEFAULT '0', "assists" integer NOT NULL DEFAULT '0', "championshipId" uuid NOT NULL, "teamId" uuid, "userId" uuid, "visitorId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c76e93dfef28ba9b6942f578ab1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "staff" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "privileges" character varying NOT NULL, "userId" uuid NOT NULL, "championshipId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e4ee98bb552756c180aec1e854a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "championships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "rules" text, "startDate" TIMESTAMP, "endDate" TIMESTAMP, "prize" character varying, "banner" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0f99e3669ee9b045b47cc8c916d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "captainUserId" uuid, "captainVisitorId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "visitors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "age" integer, "name" character varying NOT NULL, "location" character varying, "userId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_d304d8c2a659134be8eb3fdf26" UNIQUE ("userId"), CONSTRAINT "PK_d0fd6e34a516c2bb3bbec71abde" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "username" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "stands_teams" ("standId" uuid NOT NULL, "teamId" uuid NOT NULL, CONSTRAINT "PK_0e9741199a0b783a63e52f1f5e0" PRIMARY KEY ("standId", "teamId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3c4d7aa9223415f3171648f8f6" ON "stands_teams"  ("standId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_109307de9f4520c1869eff3b6e" ON "stands_teams"  ("teamId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "championship_teams" ("championshipId" uuid NOT NULL, "teamId" uuid NOT NULL, CONSTRAINT "PK_9b9fdf4a88beeeaa1ac0bb42d79" PRIMARY KEY ("championshipId", "teamId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ee04875d0c993bb084d63bcd42" ON "championship_teams"  ("championshipId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4734e0ad6546b7ca5d830a4c69" ON "championship_teams"  ("teamId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "team_users" ("teamId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_823499dc944d60b2b9f58119050" PRIMARY KEY ("teamId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0dc2044024bf4e74c54762606b" ON "team_users"  ("teamId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_27d553c71d87166762da402a7f" ON "team_users"  ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "team_visitors" ("teamId" uuid NOT NULL, "visitorId" uuid NOT NULL, CONSTRAINT "PK_958bb39dcb9a03e291b857f6382" PRIMARY KEY ("teamId", "visitorId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c49ac45d151314d447e3e78363" ON "team_visitors"  ("teamId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8596d7f40e4475a8023b4be12f" ON "team_visitors"  ("visitorId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD CONSTRAINT "FK_315ecd98bd1a42dcf2ec4e2e985" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stands" ADD CONSTRAINT "FK_69b04be2801c9ea67e8ffb34de1" FOREIGN KEY ("championshipId") REFERENCES "championships"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stats" ADD CONSTRAINT "FK_aae5cad1be5d2f21f32c1bd8cf0" FOREIGN KEY ("championshipId") REFERENCES "championships"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stats" ADD CONSTRAINT "FK_ae75df01c5ae30cdfc5e3986154" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stats" ADD CONSTRAINT "FK_071bcb8dd9f9511a3880c34c385" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stats" ADD CONSTRAINT "FK_2db6e085692641a83ae9c5a1646" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff" ADD CONSTRAINT "FK_eba76c23bcfc9dad2479b7fd2ad" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff" ADD CONSTRAINT "FK_66206a56a11d4495bfc08b53f97" FOREIGN KEY ("championshipId") REFERENCES "championships"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ADD CONSTRAINT "FK_264c4f6b3a4d57d9c2dfb1c4b5c" FOREIGN KEY ("captainUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ADD CONSTRAINT "FK_218e5788dd5610384aa6165a964" FOREIGN KEY ("captainVisitorId") REFERENCES "visitors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" ADD CONSTRAINT "FK_d304d8c2a659134be8eb3fdf266" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stands_teams" ADD CONSTRAINT "FK_3c4d7aa9223415f3171648f8f69" FOREIGN KEY ("standId") REFERENCES "stands"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "stands_teams" ADD CONSTRAINT "FK_109307de9f4520c1869eff3b6ef" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "championship_teams" ADD CONSTRAINT "FK_ee04875d0c993bb084d63bcd423" FOREIGN KEY ("championshipId") REFERENCES "championships"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "championship_teams" ADD CONSTRAINT "FK_4734e0ad6546b7ca5d830a4c69b" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_users" ADD CONSTRAINT "FK_0dc2044024bf4e74c54762606b7" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_users" ADD CONSTRAINT "FK_27d553c71d87166762da402a7fe" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_visitors" ADD CONSTRAINT "FK_c49ac45d151314d447e3e78363b" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_visitors" ADD CONSTRAINT "FK_8596d7f40e4475a8023b4be12f8" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "team_visitors" DROP CONSTRAINT "FK_8596d7f40e4475a8023b4be12f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_visitors" DROP CONSTRAINT "FK_c49ac45d151314d447e3e78363b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_users" DROP CONSTRAINT "FK_27d553c71d87166762da402a7fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_users" DROP CONSTRAINT "FK_0dc2044024bf4e74c54762606b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "championship_teams" DROP CONSTRAINT "FK_4734e0ad6546b7ca5d830a4c69b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "championship_teams" DROP CONSTRAINT "FK_ee04875d0c993bb084d63bcd423"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stands_teams" DROP CONSTRAINT "FK_109307de9f4520c1869eff3b6ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stands_teams" DROP CONSTRAINT "FK_3c4d7aa9223415f3171648f8f69"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" DROP CONSTRAINT "FK_d304d8c2a659134be8eb3fdf266"`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" DROP CONSTRAINT "FK_218e5788dd5610384aa6165a964"`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" DROP CONSTRAINT "FK_264c4f6b3a4d57d9c2dfb1c4b5c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff" DROP CONSTRAINT "FK_66206a56a11d4495bfc08b53f97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff" DROP CONSTRAINT "FK_eba76c23bcfc9dad2479b7fd2ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stats" DROP CONSTRAINT "FK_2db6e085692641a83ae9c5a1646"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stats" DROP CONSTRAINT "FK_071bcb8dd9f9511a3880c34c385"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stats" DROP CONSTRAINT "FK_ae75df01c5ae30cdfc5e3986154"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stats" DROP CONSTRAINT "FK_aae5cad1be5d2f21f32c1bd8cf0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stands" DROP CONSTRAINT "FK_69b04be2801c9ea67e8ffb34de1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "FK_315ecd98bd1a42dcf2ec4e2e985"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8596d7f40e4475a8023b4be12f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c49ac45d151314d447e3e78363"`,
    );
    await queryRunner.query(`DROP TABLE "team_visitors"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_27d553c71d87166762da402a7f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0dc2044024bf4e74c54762606b"`,
    );
    await queryRunner.query(`DROP TABLE "team_users"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4734e0ad6546b7ca5d830a4c69"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ee04875d0c993bb084d63bcd42"`,
    );
    await queryRunner.query(`DROP TABLE "championship_teams"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_109307de9f4520c1869eff3b6e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3c4d7aa9223415f3171648f8f6"`,
    );
    await queryRunner.query(`DROP TABLE "stands_teams"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "visitors"`);
    await queryRunner.query(`DROP TABLE "teams"`);
    await queryRunner.query(`DROP TABLE "championships"`);
    await queryRunner.query(`DROP TABLE "staff"`);
    await queryRunner.query(`DROP TABLE "stats"`);
    await queryRunner.query(`DROP TABLE "stands"`);
    await queryRunner.query(`DROP TABLE "profiles"`);
  }
}
