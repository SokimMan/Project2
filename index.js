//'use strict';
const cool = require('cool-ascii-faces');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const connectionString = process.env.DATABASE_URL || "postgres://ywtcjxlcityric:c361ad6a0fa2a243560478dbcef8c5bb5aad5acefa50e67cf9c43a993a74c270@ec2-54-234-28-165.compute-1.amazonaws.com:5432/d5s7bcbtu1lj5c?ssl=true";
const data = require('postgres://ywtcjxlcityric:c361ad6a0fa2a243560478dbcef8c5bb5aad5acefa50e67cf9c43a993a74c270@ec2-54-234-28-165.compute-1.amazonaws.com:5432/d5s7bcbtu1lj5c?ssl=true');

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
  
  // Dev Path to see DB post
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM sf');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .get('/data', function(request, response) =>
  {
  	let person = request.query.person;
  	// If there is a person, and the raw JSON data has such a key, return the
  	// associated data.
  	// If there is no person, or the raw JSON data has no such key, return
  	// an error object.
  	if (person !== undefined && data.hasOwnProperty(person)) {
    	response.json(data[person]);
  	} else {
    	response.json(data['error']);
  	}

  	// End the response.
  	response.end();
  })

  .get('/newUser', createNewUser)
  .get('/cool', (req, res) => res.send(cool()))


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
      		client.release();
    	}	 	
    	catch (err) 
    	{
      		console.error(err);
      		res.send("Error " + err);
    	}

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

	// Render the response, using the EJS page "result.ejs" in the pages directory
	response.render('pages/result', params);
    }