module.exports = {
    user          : process.env.NODE_ORACLEDB_USER || "microservice",
    password      : process.env.NODE_ORACLEDB_PASSWORD || "AAZZ__welcomedevops123",  
    connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "//cdb.madrid-gigispizza.wedoteam.io:1521/pdbjson.sub03010825490.devopsvcn.oraclevcn.com",
    externalAuth  : process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
  };
