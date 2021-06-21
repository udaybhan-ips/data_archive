const dbConfig = require("../config/environments/development");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DATABASE_URL_SONUS_DB.database, dbConfig.DATABASE_URL_SONUS_DB.user, dbConfig.DATABASE_URL_SONUS_DB.password, {
  host: dbConfig.DATABASE_URL_SONUS_DB.host,
  dialect: dbConfig.DATABASE_URL_SONUS_DB.dialect,
  operatorsAliases: false,
  define: {
    freezeTableName: true
  },
  pool: {
    max: dbConfig.DATABASE_URL_SONUS_DB.pool.max,
    min: dbConfig.DATABASE_URL_SONUS_DB.pool.min,
    acquire: dbConfig.DATABASE_URL_SONUS_DB.pool.acquire,
    idle: dbConfig.DATABASE_URL_SONUS_DB.pool.idle
  }
});

const dbSqlz = {};

dbSqlz.Sequelize = Sequelize;
dbSqlz.sequelize = sequelize;

dbSqlz.cdr = require("./kickback/schema.cdr")(sequelize, Sequelize);

module.exports = dbSqlz;