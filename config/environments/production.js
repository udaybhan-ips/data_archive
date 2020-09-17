module.exports = {
	PORT: (process.env.PORT || 3000),
	DATABASE_URL: (process.env.DATABASE_URL || 'postgres://ips:ips12345@10.168.22.40:5432/ips_portal'),
  SECRET: (process.env.SECRET || 'h3sqq%pb#dHh^XcU8&Uj8brVS_*$LGHW'),
  JWT_EXPIRATION: (process.env.JWT_EXPIRATION || 86400)
};



const MYSQL={
  host     : (process.env.MYSQL_PORT || '10.168.11.252'),
  database : (process.env.MYSQL_DATABASE || 'epart'),
  user     : (process.env.MYSQL_USER ||'ips'),
  password : (process.env.MYSQL_PASSWORD || 'ips0032'),
}


module.exports={MYSQL};