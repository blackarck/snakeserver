const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");


class dbhandle {

  constructor() {
    console.log("declaring db ");
    this.db=null;
    this.initdb();
  }//end of constructor

  async initdb() {
    try {
      this.db = await open({
        filename: "./db/database.db",
        driver: sqlite3.cached.Database,
      });
      console.log("Db is open");
    } catch (error) {
      console.error("Error opening the database:", error);
    }
  }//end of initdb

  // Insert data
  async insertData(tableName, data, callback) {
    console.log("DataIns is " + JSON.stringify(data) + " db is "+ this.db);
    if (data) {
      const columns = Object.keys(data).join(", ");
      const placeholders = Object.keys(data).fill("?").join(", ");
      const values = Object.values(data);

      const insertQuery = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    
      if (this.db) {
        console.log(" Messaging1 -" + insertQuery);
        await this.db.run(insertQuery, values, (err) => {
          if (err) {
            console.error("Error inserting data:", err.message);
          } else {
            console.log("Data inserted successfully.");
            callback({ success: true });
          }
        });
      }
    } else {
      console.log("DataIns is null-" + JSON.stringify(data)); //end of if data
    }
  }

  // Query data
  async queryData(tableName, condition, callback) {
    const selectQuery = `SELECT * FROM ${tableName} WHERE ${condition}`;
    if (this.db) {
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
    this.queryData("sessions", "sessionid='" + sessionid +"'", (rows) => {
      console.log("found session id " + JSON.stringify(rows));
      return rows;
    });
  }

  insertsession(sessiondtl) {
    //console.log("inserting " + JSON.stringify(sessiondtl) + " db is " + this.db);
    this.insertData("sessions", sessiondtl, (data) => {
      console.log("inserted post session" + JSON.stringify(data));
      return data;
    });
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

module.exports = dbhandle;
