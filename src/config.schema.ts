import * as joi from '@hapi/joi';

export const configValidationSchema = joi.object({
	STAGE: joi.string().required(),
	DB_USERNAME: joi.string().required(),
	DB_PASSWORD: joi.string().required(),
	DB_HOST: joi.string().required(),
	DB_PORT: joi.string().default(5432).required(),
	DB_NAME: joi.string().required(),
	DB_CA_CERT: joi.string()
});
