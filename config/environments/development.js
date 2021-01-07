
const MYSQL={
  host     : (process.env.MYSQL_PORT || '10.168.11.252'),
  database : (process.env.MYSQL_DATABASE || 'epart'),
  user     : (process.env.MYSQL_USER ||'ips'),
  password : (process.env.MYSQL_PASSWORD || 'ips0032'),
  timezone: 'Z'
}

const IPSPortal={
  host     : (process.env.POSTGRES_PORT || '10.168.22.40'),
  database : (process.env.POSTGRES_DATABASE || 'ips_portal'),
  user     : (process.env.POSTGRES_USER ||'ips'),
  password : (process.env.POSTGRESL_PASSWORD || 'ips12345'),
  timezone: 'Z'
}

const SONUSDB={
  host     : (process.env.POSTGRES_PORT || '10.168.22.40'),
  database : (process.env.POSTGRES_DATABASE || 'sonus_db'),
  user     : (process.env.POSTGRES_USER ||'postgres'),
  password : (process.env.POSTGRESL_PASSWORD || ''),
  timezone: 'Z'
}

module.exports = {
	PORT: (process.env.PORT || 3000),
  DATABASE_URL_IPS_PORTAL: (process.env.IPSPortal || IPSPortal),
  DATABASE_URL_SONUS_DB: (process.env.SONUSDB || SONUSDB),
  SECRET: (process.env.SECRET || 'h3sqq%pb#dHh^XcU8&Uj8brVS_*$LGHW'),
  JWT_EXPIRATION: (process.env.JWT_EXPIRATION || 86400),
  MYSQL_DATABASE_URL:MYSQL,
  BATCH_SIZE:10000
};




