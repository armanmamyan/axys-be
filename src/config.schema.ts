import * as joi from 'joi';

export const configValidationSchema = joi.object({
	STAGE: joi.string().required(),
	DB_USERNAME: joi.string().required(),
	DB_PASSWORD: joi.string().required(),
	DB_HOST: joi.string().required(),
	DB_PORT: joi.string().default(5432).required(),
	DB_NAME: joi.string().required(),
	PRIVATE_KEY: joi.string().required(),
	SMTP_PORT: joi.string().required(),
	SMPT_KEY: joi.string().required(),
	EMAIL_FROM: joi.string().default('no-reply@axysbank.io').required(),
	CLIENT_URL: joi.string().required(),
	STRIPE_SECRET: joi.string().required(),
	STRIPE_WEBHOOK_SECRET: joi.string().required(),
	CMC_API_KEY: joi.string().required(),
	VISA_API_KEY: joi.string(),
	KEY_FILENAME: joi.string(),
	BUCKETEER_BUCKET_NAME: joi.string(),
	BUCKETEER_AWS_ACCESS_KEY_ID: joi.string(),
	BUCKETEER_AWS_SECRET_ACCESS_KEY: joi.string(),
	BUCKETEER_AWS_REGION: joi.string(),
});
