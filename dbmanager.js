var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');

//################### DROP DB ####################
async function dropTable() {
    let connection;
    try {

        let sql, binds, options, result;

        connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        });

        // Create a table

        await connection.execute(
            `BEGIN
         EXECUTE IMMEDIATE 'DROP TABLE pizzaOrder';
         EXCEPTION
         WHEN OTHERS THEN
           IF SQLCODE NOT IN (-00942) THEN
             RAISE;
           END IF;
       END;`);

    } catch (err) {
        console.error(err);
        return error
    } finally {
        if (connection) {
            try {
                await connection.close();
                return "Deleted"
            } catch (err) {
                console.error(err);
                return error
            }
        }
    }
}

//################### DROP DB ####################
async function createTable() {
    let connection;
    try {

        let sql, binds, options, result;

        connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        });

        // Create a table

        await connection.execute(
            `CREATE TABLE pizzaOrder (id VARCHAR2(20), data VARCHAR2(910), timestamp NUMBER)`);

    } catch (err) {
        console.error(err);
        return error
    } finally {
        if (connection) {
            try {
                await connection.close();
                return "Created"
            } catch (err) {
                console.error(err);
                return error
            }
        }
    }
}

//################### Insert Value ####################
async function insertValue(id,data) {
    let connection;
    let result;
    try {

        let sql, binds, options;

        connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        });

        // Insert some data

        sql = `INSERT INTO pizzaOrder VALUES (:1, :2, :3)`;
        console.log("Insert: id: " + id, "Data: " + data)
        let date = Date.now()
        binds = [[id, JSON.stringify(data), date]];

        // For a complete list of options see the documentation.
        options = {
            autoCommit: true,
            // batchErrors: true,  // continue processing even if there are data errors
            bindDefs: [
                { type: oracledb.STRING, maxSize: 20 },
                { type: oracledb.STRING, maxSize: 32767 },
                { type: oracledb.NUMBER }
            ]
        };

        result = await connection.executeMany(sql, binds, options);
        console.log("Number of rows inserted:", result.rowsAffected);

    } catch (err) {
        console.error(err);
        return error
    } finally {
        if (connection) {
            try {
                await connection.close();
                return result
            } catch (err) {
                console.error(err);
                return error
            }
        }
    }
}


//################### Insert Value ####################
async function queryTable(id) {
    let connection;
    let result;
    try {

        let sql, binds, options;

        connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        });

        // Query the data

        sql = "SELECT id, data FROM pizzaOrder WHERE id = '"+ id +"' AND data IS JSON";

        binds = {};

        // For a complete list of options see the documentation.
        options = {
            outFormat: oracledb.OBJECT   // query result format
            // extendedMetaData: true,   // get extra metadata
            // fetchArraySize: 100       // internal buffer allocation size for tuning
        };

        result = await connection.execute(sql, binds, options);

        console.log("Column metadata: ", result.metaData);
        console.log("Query results: ");
        console.log(JSON.parse(result.rows[0].DATA));

    } catch (err) {
        console.error(err);
        return error
    } finally {
        if (connection) {
            try {
                await connection.close();
                return JSON.parse(result.rows[0].DATA)
            } catch (err) {
                console.error(err);
                return error
            }
        }
    }
}

async function queryTableAll() {
    let connection;
    let result;
    try {

        let sql, binds, options;

        connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        });

        // Query the data

        sql = "SELECT id, data FROM pizzaOrder WHERE data IS JSON";

        binds = {};

        // For a complete list of options see the documentation.
        options = {
            outFormat: oracledb.OBJECT   // query result format
            // extendedMetaData: true,   // get extra metadata
            // fetchArraySize: 100       // internal buffer allocation size for tuning
        };

        result = await connection.execute(sql, binds, options);

        console.log("Column metadata: ", result.metaData);
        console.log("Query results: ");
        console.log(result);

    } catch (err) {
        console.error(err);
        return error
    } finally {
        if (connection) {
            try {
                await connection.close();
                return result
            } catch (err) {
                console.error(err);
                return error
            }
        }
    }
}

module.exports.createTable = createTable;
module.exports.dropTable = dropTable;
module.exports.insertValue = insertValue;
module.exports.queryTable = queryTable;
module.exports.queryTableAll = queryTableAll;