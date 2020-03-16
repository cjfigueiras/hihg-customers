import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialMigration1584376027717 implements MigrationInterface {
    name = 'InitialMigration1584376027717'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM('root')`, undefined);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, "firstName" character varying(50) NOT NULL, "lastName" character varying(50) NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "phone" character varying, "resetPasswordToken" character varying, "resetPasswordExpires" TIMESTAMP, "role" "user_role_enum" NOT NULL DEFAULT 'root', "isDeleted" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "user"`, undefined);
        await queryRunner.query(`DROP TYPE "user_role_enum"`, undefined);
    }

}
