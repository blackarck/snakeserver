const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

class dbhandle {

  constructor() {
    async () => {
      this.db = await open({
        filename: "./db/database.db",
        driver: sqlite3.cached.Database,
      }).then((data)=>{
        console.log("Db is open "+db + " ,data-"+data);
      });
    };
  }

  // Insert data
  async insertData(tableName, data,callback) {
    const columns = Object.keys(data).join(", ");
    const placeholders = Object.keys(data).fill("?").join(", ");
    const values = Object.values(data);

    const insertQuery = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    if(this.db){
    await this.db.run(insertQuery, values, (err) => {
      if (err) {
        console.error("Error inserting data:", err.message);
      } else {
        console.log("Data inserted successfully.");
        callback({success: true});
      }
    });
  }
  }

  // Query data
  async queryData(tableName, condition, callback) {
    const selectQuery = `SELECT * FROM ${tableName} WHERE ${condition}`;
    if(this.db){
    await this.db.all(selectQuery, (err, rows) => {
      if (err) {
        console.error("Error querying data:", err.message);
      } else {
        callback(rows);
      }
    });
  }
  }

  findsession(sessionid) {
    this.queryData("sessions", "sessionid=" + sessionid, (rows) => {
      console.log("found session id " + JSON.stringify(rows));
      return rows;
    });
  }

  insertsession(sessiondtl) {
    console.log("inserting "+JSON.stringify(sessiondtl));
    this.insertData('sessions',{sessiondtl},(data)=>{
        return data;
    }
    );
  }
  // Close the database connection
  close() {
    this.db.close((err) => {
      if (err) {
        console.error("Error closing the database:", err.message);
      } else {
        console.log("Database connection closed.");
      }
    });
  } //close connection
}

module.exports= dbhandle;