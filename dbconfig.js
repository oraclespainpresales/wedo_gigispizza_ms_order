module.exports = {
    user          : process.env.NODE_ORACLEDB_USER || "microservice",
    password      : process.env.NODE_ORACLEDB_PASSWORD || "AAZZ__welcomedevops123",  
    connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "//130.61.124.136:1521/pdbjson.sub03010825490.devopsvcn.oraclevcn.com",
    externalAuth  : process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
  };