import {MigrationInterface, QueryRunner} from "typeorm";

export class addCustomerRole1584379962406 implements MigrationInterface {
    name = 'addCustomerRole1584379962406'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`, undefined);
        await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM('root', 'customer')`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "user_role_enum" USING "role"::"text"::"user_role_enum"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'root'`, undefined);
        await queryRunner.query(`DROP TYPE "user_role_enum_old"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TYPE "user_role_enum_old" AS ENUM('root')`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" TYPE "user_role_enum_old" USING "role"::"text"::"user_role_enum_old"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'root'`, undefined);
        await queryRunner.query(`DROP TYPE "user_role_enum"`, undefined);
        await queryRunner.query(`ALTER TYPE "user_role_enum_old" RENAME TO  "user_role_enum"`, undefined);
    }

}
