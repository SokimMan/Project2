const cool = require('cool-ascii-faces');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const connectionString = process.env.DATABASE_URL || "postgres://ywtcjxlcityric:c361ad6a0fa2a243560478dbcef8c5bb5aad5acefa50e67cf9c43a993a74c270@ec2-54-234-28-165.compute-1.amazonaws.com:5432/d5s7bcbtu1lj5c?ssl=true";


const { Pool } = require('pg');
/*
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  	}
}); */
const pool = new Pool({connectionString: connectionString});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .get('/cool', (req, res) => res.send(cool()))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
