/**
 * CLI to write the database URL into AWS SSM Parameter Store for a given stage.
 * Intended for CI (e.g. GitHub Actions) to populate secrets after deployment.
 *
 * Usage: tsx src/cli/putSecrets.js <stage> <dbUrl>
 * Example: tsx src/cli/putSecrets.js dev postgres://user:pass@host/db
 */
const secrets = require("../lib/secrets");
require("dotenv").config();

const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log("Usage: tsx src/cli/putSecrets.js <stage> <dbUrl>");
  process.exit(1);
}

if (require.main === module) {
  console.log("Updating database URL");
  const [stage, dbUrl] = args;
  secrets
    .putDatabaseUrl(stage, dbUrl)
    .then((val) => {
      console.log(val);
      console.log("Secret set");
      process.exit(0);
    })
    .catch((err) => {
      console.log(`Secret not set ${err}`);
      process.exit(1);
    });
}