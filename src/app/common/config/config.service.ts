import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Joi from 'joi';

export interface EnvConfig {
    [key: string]: string;
}

export class ConfigService {
    private readonly envConfig: EnvConfig;

    constructor() {
        const config = dotenv.parse(fs.readFileSync(__dirname + '/../../../../.env.' + process.env.NODE_ENV));
        this.envConfig = this.validateInput(config);
    }

    /**
     * Ensures all needed variables are set, and returns the validated JavaScript object
     * including the applied default values.
     */
    private validateInput(envConfig: EnvConfig): EnvConfig {
        const envVarsSchema: Joi.ObjectSchema = Joi.object({
            APP_PORT: Joi.number().default(3000),
            APP_VERSION: Joi.string().default('v1'),
            JWT_SECRET_KEY: Joi.string(),
            JWT_EXPIRES_IN: Joi.number().default(3600),

            DATABASE_HOST: Joi.string(),
            DATABASE_PORT: Joi.number().default(5432),
            DATABASE_USERNAME: Joi.string().default('postgres'),
            DATABASE_PASSWORD: Joi.string().default('postgres'),
            DATABASE_NAME: Joi.string().default('hihg_customers'),
            DATABASE_ENTITIES: Joi.string(),
            DATABASE_MIGRATIONS: Joi.string(),
            DATABASE_ENTITIES_DIR: Joi.string(),
            DATABASE_MIGRATIONS_DIR: Joi.string(),

            MAIL_SMTP_HOST: Joi.string().default('smtp.gmail.com'),
            MAIL_USER: Joi.string(),
            MAIL_PASSWORD: Joi.string(),
        });

        const { error, value: validatedEnvConfig } = Joi.validate(
            envConfig,
            envVarsSchema,
        );
        if (error) {
            throw new Error(`Config validation error: ${error.message}`);
        }
        return validatedEnvConfig;
    }

    get(key: string): string {
        return this.envConfig[key];
    }
}
