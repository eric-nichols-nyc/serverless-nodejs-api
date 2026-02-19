/**
 * Secrets helpers: read/write the app database URL from AWS Systems Manager
 * Parameter Store (SSM). Used at runtime for DB connection and by CLI to set
 * the value for a given stage.
 */
const {
  SSMClient,
  GetParameterCommand,
  PutParameterCommand,
} = require("@aws-sdk/client-ssm");

const AWS_REGION = "us-east-1";
const STAGE = process.env.STAGE || "prod";

/**
 * Fetches the database URL for the current STAGE from SSM Parameter Store.
 * Parameter path: /serverless-nodejs-api/{stage}/database-url
 * @returns {Promise<string>} The decrypted parameter value (connection string).
 */
async function getDatabaseUrl() {
  const DATABASE_URL_SSM_PARAM = `/serverless-nodejs-api/${STAGE}/database-url`;
  const client = new SSMClient({ region: AWS_REGION });
  const paramStoreData = {
    Name: DATABASE_URL_SSM_PARAM,
    WithDecryption: true,
  };
  const command = new GetParameterCommand(paramStoreData);
  const result = await client.send(command);
  return result.Parameter.Value;
}

/**
 * Writes the database URL for a given stage to SSM Parameter Store as a
 * SecureString. No-op for prod (avoids overwriting prod from CLI) and when
 * dbUrlVal is missing.
 * @param {string} [stage] - Stage name (defaults to 'dev').
 * @param {string} [dbUrlVal] - Database connection string to store.
 * @returns {Promise<object | undefined>} SSM PutParameter result, or undefined if skipped.
 */
async function putDatabaseUrl(stage, dbUrlVal) {
  const paramStage = stage ?? "dev";
  if (paramStage === "prod") return;
  if (!dbUrlVal) return;

  const DATABASE_URL_SSM_PARAM = `/serverless-nodejs-api/${paramStage}/database-url`;
  const client = new SSMClient({ region: AWS_REGION });
  const paramStoreData = {
    Name: DATABASE_URL_SSM_PARAM,
    Value: dbUrlVal,
    Type: "SecureString",
    Overwrite: true,
  };
  const command = new PutParameterCommand(paramStoreData);
  const result = await client.send(command);
  return result;
}

module.exports.getDatabaseUrl = getDatabaseUrl;
module.exports.putDatabaseUrl = putDatabaseUrl;