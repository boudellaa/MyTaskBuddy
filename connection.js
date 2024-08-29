const pg = require("pg");

pg.types.setTypeParser(1082, function (stringValue) {
  return stringValue;
});

const client = new pg.Client({
  host: "aws-0-eu-central-1.pooler.supabase.com",
  user: "postgres.svlrsvxrzxkqrhhpwkzw",
  port: 5432,
  password: "Nsu1ZXxisAkVUtLM",
  database: "postgres",
});

module.exports = client;