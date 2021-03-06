var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');

//################### DROP Table ####################
async function dropTable() {
    let connection;
    try {

        let sql, binds, options, result;

        connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        });

        // Drop a table
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

//################### Create Table ####################
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
        console.log("Insert: id: " + id, "Data: " + JSON.stringify(data))
        let date = Date.now()
        binds = [[id, JSON.stringify(data), date]];
        options = {
            autoCommit: true,
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
        throw Error(err)
    } finally {
        if (connection) {
            try {
                await connection.close();
                return result
            } catch (err) {
                console.error(err);
                throw Error(err)
            }
        }
    }
}

//################### Update Value ####################
async function updateValue (id,field,value) {
    let connection;
    let result;
    try {
        let sql, binds, options;
        connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        });
        //Oracle 18c doesn't have a json_mergepath function, so we have to select the orderId DATA
        //atehn change the status value, and then update the DATA field again, all the json data.
        let jsonData = await queryTableOrderId(id);
        if (jsonData === undefined) 
            throw Error ("orderId not found!");
        console.log("Info: order status-> ", jsonData.status);
        jsonData.status = value;
        console.log("Info: new order status-> ",jsonData.status);
        //Update data field
        sql = "UPDATE pizzaOrder SET data = '" + JSON.stringify(jsonData) + "' WHERE id = " + id;
        console.log("Info: sql update-> " + sql);
        binds = {};
        options = {
            autoCommit: true
            /*bindDefs: [
                { type: oracledb.STRING, maxSize: 20 },
                { type: oracledb.STRING, maxSize: 32767 }                
            ]*/
        };
        result = await connection.execute(sql, binds, options);
        console.log("Info: Number of rows modified:", result.rowsAffected);
    } catch (err) {
        console.error("Error: updateValue-> ", err);
        throw Error(err)
    } finally {
        if (connection) {
            try {
                await connection.close();
                return result
            } catch (err) {
                console.error(err);
                throw Error(err)
            }
        }
    }
}


//################### Get Value ####################
async function queryTableOrderId(id) {
    let connection;
    let result;
    try {
        let binds, options;
        connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        });
        
        let sql    = "SELECT id, data FROM pizzaOrder WHERE id = '"+ id +"' AND data IS JSON";

        binds = {};
        options = {
            outFormat: oracledb.OBJECT  
        };

        result = await connection.execute(sql, binds, options);

        console.log("Column metadat: ", result.metaData);
        console.log("Query results: ", result.rows.length);
        if (result.rows.length == 1)
            console.log(JSON.parse(result.rows[0].DATA));
    } catch (err) {
        console.error(err);
        throw Error(err)
    } finally {
        if (connection) {
            try {
                await connection.close();
                if (result.rows.length == 1)
                    return (JSON.parse(result.rows[0].DATA))
                else
                    return ({"result":"orderId " + id + " not found"})
            } catch (err) {
                console.error(err);
                throw Error(err)
            }
        }
    }
}

async function queryTableWhere(whereClause) {
    let connection;
    let result;
    try {
        let binds, options
        let wherePhrase = "";
        
        connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        });

        //console.log("where clause-> ", JSON.stringify(whereClause))        
        //console.log("where clause-> ", JSON.stringify(whereClause.where))        
        whereClause.where.forEach(element => {
            let strCond = "po.data." + element.cond.field + " " + element.cond.operator + " " + element.cond.value; 
            if (element.relation != ""){
                strCond += " " + element.relation + " ";
            }
            //console.log("where clause-> ", strCond)
            wherePhrase += strCond;
        });
        
        //console.log("where clause-> ", wherePhrase)

        let sql = "SELECT po.data.orderId as id, po.data as data FROM (SELECT TREAT(data as JSON) as data FROM pizzaOrder) po WHERE " + wherePhrase + " ORDER BY 1 DESC";
        console.log("where clause-> ", sql)
        binds = {};
        options = {
            outFormat: oracledb.OBJECT
        };    

        result = await connection.execute(sql, binds, options);

        console.log("Column metadata: ", result.metaData);
        console.log("Query results: ", result.rows.length);
        if (result.rows.length > 0)
            console.log(JSON.stringify(result))
    } catch (err) {
        console.error(err);
        throw Error (err)
    } finally {
        if (connection) {
            try {
                await connection.close();
                if (result.rows.length > 0)
                    return result
                else
                    return ({"result":"order not found"})
                return result
            } catch (err) {
                console.error(err);
                throw Error (err)
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

        sql = "SELECT id, data FROM pizzaOrder WHERE data IS JSON ORDER BY timestamp DESC";
        binds = {};
        options = {
            outFormat: oracledb.OBJECT   // query result format
        };

        result = await connection.execute(sql, binds, options);

        console.log("Column metadata: ", result.metaData);
        console.log("Query results: ", result.rows.length);
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

module.exports.createTable       = createTable;
module.exports.dropTable         = dropTable;
module.exports.insertValue       = insertValue;
//module.exports.queryTable        = queryTable;
module.exports.queryTableAll     = queryTableAll;
module.exports.updateValue       = updateValue;
module.exports.queryTableWhere   = queryTableWhere;
module.exports.queryTableOrderId = queryTableOrderId;
