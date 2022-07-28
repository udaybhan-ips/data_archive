const MYSQL={
  host     : (process.env.MYSQL_PORT || '10.168.11.252'),
  database : (process.env.MYSQL_DATABASE || 'epart'),
  user     : (process.env.MYSQL_USER ||'ipstwo'),
  password : (process.env.MYSQL_PASSWORD || 'ipstwo0032'),
  timezone: 'Z'
}
const MYSQL_WITHOUT_TIMEZONE={
  host     : (process.env.MYSQL_PORT || '10.168.11.252'),
  database : (process.env.MYSQL_DATABASE || 'epart'),
  user     : (process.env.MYSQL_USER ||'ipstwo'),
  password : (process.env.MYSQL_PASSWORD || 'ipstwo0032'),  
}

const MSSQLServer = {
  user: 'advent',
  password: 'advent',
  server: '192.168.11.53', // You can use 'localhost\\instance' to connect to named instance
  database: 'EXCEL2DB',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // for azure
    trustServerCertificate: false // change to true for local dev / self-signed certs
  },
  requestTimeout : 500000,
  connectionTimeout: 20000,
}

const IPSPortal={
  host     : (process.env.POSTGRES_PORT || '10.168.11.42'),
  database : (process.env.POSTGRES_DATABASE || 'ips_portal'),
  user     : (process.env.POSTGRES_USER ||'ips'),
  password : (process.env.POSTGRESL_PASSWORD || 'ips12345'),
  timezone: 'Z'
}

const IBS={
  host     : (process.env.POSTGRES_PORT || '10.168.11.42'),
  database : (process.env.POSTGRES_DATABASE || 'ibs'),
  user     : (process.env.POSTGRES_USER ||'ips'),
  password : (process.env.POSTGRESL_PASSWORD || 'ips12345'),
  timezone: 'Z'
}
const Byokakin={
  host     : (process.env.POSTGRES_PORT || '10.168.11.42'),
  database : (process.env.POSTGRES_DATABASE || 'byokakin'),
  user     : (process.env.POSTGRES_USER ||'ips'),
  password : (process.env.POSTGRESL_PASSWORD || 'ips12345'),
  timezone: 'Z',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
}

const SONUSDB={
  host     : (process.env.POSTGRES_PORT || '10.168.11.42'),
  database : (process.env.POSTGRES_DATABASE || 'sonus_db'),
  user     : (process.env.POSTGRES_USER ||'postgres'),
  password : (process.env.POSTGRESL_PASSWORD || ''),
  dialect : (process.env.POSTGRESL_PASSWORD || 'postgres'),
  timezone: 'Z',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}

module.exports = {
	PORT: (process.env.PORT || 3000),
  DATABASE_URL_IPS_PORTAL: (process.env.IPSPortal || IPSPortal),
  DATABASE_URL_SONUS_DB: (process.env.SONUSDB || SONUSDB),
  DATABASE_URL_IBS: (process.env.IBS || IBS),
  DATABASE_URL_BYOKAKIN: (process.env.Byokakin || Byokakin),
  SECRET: (process.env.SECRET || 'h3sqq%pb#dHh^XcU8&Uj8brVS_*$LGHW'),
  JWT_EXPIRATION: (process.env.JWT_EXPIRATION || 86400),
  MYSQL_DATABASE_URL:MYSQL,
  MSSQLServer,
  MYSQL_DATABASE_URL_WITHOUT_TIMEZONE:MYSQL_WITHOUT_TIMEZONE,
  BATCH_SIZE:100000
};




