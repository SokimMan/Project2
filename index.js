//'use strict';
const cool = require('cool-ascii-faces');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const connectionString = process.env.DATABASE_URL || "postgres://ywtcjxlcityric:c361ad6a0fa2a243560478dbcef8c5bb5aad5acefa50e67cf9c43a993a74c270@ec2-54-234-28-165.compute-1.amazonaws.com:5432/d5s7bcbtu1lj5c?ssl=true";
//const data = require('postgres://ywtcjxlcityric:c361ad6a0fa2a243560478dbcef8c5bb5aad5acefa50e67cf9c43a993a74c270@ec2-54-234-28-165.compute-1.amazonaws.com:5432/d5s7bcbtu1lj5c?ssl=true');

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
  //.get('/back', (req, res) => res.render('searchUser'))
  .get('/back', (req, res) => res.render('../../public/searchUser'))
  // Dev Path to see DB post
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM sf');
      const results = { 'results': (result) ? result.rows : null};
      console.log("The complete set of objects: " + JSON.stringify(results));
      console.log("The first object: " + JSON.stringify(result.rows[0]));
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .get('/searchUser', getPerson)

  .get('/deleteUser', deleteContact)

  .get('/newUser', createNewUser)

  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


  async function insertToDatabase(externalID, firstName, lastName, city) 
  {
  		// 'INSERT INTO sf VALUES ('externalID', 'firstName', 'lastName', 'city')
  		command = 'INSERT INTO sf VALUES (\'' + externalID + '\', ' + '\'' + firstName + '\', ' + '\''  + lastName + '\', ' + '\''  + city + '\');';
  		console.log('The db command: ' + command); 
  		
  		try 
  		{
      		const client = await pool.connect();
      		const result = await client.query(command);
      		const results = { 'results': (result) ? result.rows : null};
      		console.log(JSON.stringify(results));
      		//return result;
      		client.release();
    	}	 	
    	catch (err) 
    	{
      		console.error(err);
      		res.send("Error " + err);
    	}
    	//return result;
  }

  // Connects with our new user form submission
  function createNewUser(request, response) {

    const externalID = request.query.externalID;
    const firstName = request.query.firstName;
    const lastName = request.query.lastName;
    const city = request.query.city;

    insertResult = insertToDatabase(externalID, firstName, lastName, city);

    // Set up a JSON object of the values we want to pass along to the EJS result page
    const params = {insertResult: insertResult, externalID: externalID, firstName: firstName, lastName: lastName, city: city};
    console.log("Found result: " + JSON.stringify(params));
    // Render the response, using the EJS page "result.ejs" in the pages directory
    response.render('pages/db', params);
  }

  async function deleteContact(request, response) {

    const external_id = request.query.externalID;
    console.log("To Delete: " + JSON.stringify(external_id));
    console.log("DELETE FROM sf WHERE external_ID = $1::text");
    const command = "DELETE FROM sf WHERE external_ID = \'" + external_id + "\';";
    console.log("Command: " + command);


    try {
      const client = await pool.connect();
      const result = await client.query(command);
      //const results = { 'results': (result) ? result.rows : null};
      //res.render('pages/db', result);
      response.render('pages/db', result);
      client.release();
    } catch (err) {
      console.error(err);
      response.send("Error " + err);
    }
  }
 
  async function viewDatabase()
  {
		try 
		{
			command = 'SELECT * FROM sf;';
			
      const client = await pool.connect();
			const result = await client.query('SELECT * FROM sf');
			
      console.log("Found result: " + JSON.stringify(result.rows));
    	
      const results = { 'results': (result) ? result.rows : null};
    	client.release();
    }
    	catch (err) 
  	{
    		console.error(err);
    		res.send("Error " + err);
    }
  }

  // Connects with our new user form submission
  function createNewUser(request, response) 
  {

    const externalID = request.query.externalID;
  	const firstName = request.query.firstName;
  	const lastName = request.query.lastName;
  	const city = request.query.city;

  	insertResult = insertToDatabase(externalID, firstName, lastName, city);



    // Set up a JSON object of the values we want to pass along to the EJS result page
  	const params = {insertResult: insertResult, externalID: externalID, firstName: firstName, lastName: lastName, city: city};
    
    console.log("Found result: " + JSON.stringify(params));

  	// Render the response, using the EJS page "result.ejs" in the pages directory
  	response.render('pages/new', params);

  }

  // From searchUser.html
  // it expects to have an id on the query string, such as: http://localhost:5000/getPerson?id=1
  function getPerson(request, response) 
  {
  	// First get the person's id
  	const id = request.query.externalID;

    console.log("Getting person from DB with id: " + id);

    // Set up the SQL that we will use for our query. Note that we can make
    // use of parameter placeholders just like with PHP's PDO.
    const sql = "SELECT * FROM sf WHERE external_ID = $1::text";

    // We now set up an array of all the parameters we will pass to fill the
    // placeholder spots we left in the query.
    const params = [id];

    // This runs the query, and then calls the page view file
    pool.query(sql, params, function(err, result) 
    {
      // If an error occurred...
      if (err) {
        console.log("Error in query: ")
        console.log(err);
        callback(err, null);
      }

      // Log this to the console for debugging purposes.
      console.log("Found result: " + JSON.stringify(result.rows[0]));
      response.render('pages/search', result.rows[0]);

    });
  }

  async function getAllContacts(request, response) 
  {
    const sql = "SELECT * FROM sf";

    try 
    {
        const client = await pool.connect();
        const result = await client.query(command);
        const results = { 'results': (result) ? result.rows : null};
        console.log("Entire object" + JSON.stringify(results));
        console.log("First object" + JSON.stringify(results[0]));
        //return result;
        client.release();
    }   
        catch (err) 
    {
        console.error(err);
        res.send("Error " + err);
    }
  }
