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
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  /*
  .get('/data', async (request, response) =>
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
  	

  	 try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM sf WHERE externalID=\'' + request.query.person + '\';');
      } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }

    response.json(result);
    response.end();

  })
  */
  //.get('/searchUserPage', getPersonPage)
  .get('/searchUser', getPerson)

  //.get('/newUserPage', createNewUserPage)
  .get('/newUser', createNewUser)
  //.get('/back', 'searchUser.html')

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

//createNewUserPage() {}

    // Connects with our new user form submission
  function createNewUser(request, response) {

  const externalID = request.query.externalID;
	const firstName = request.query.firstName;
	const lastName = request.query.lastName;
	const city = request.query.city;

	insertResult = insertToDatabase(externalID, firstName, lastName, city);
	//selectResult = viewDatabase();


    // Set up a JSON object of the values we want to pass along to the EJS result page
	const params = {insertResult: insertResult, externalID: externalID, firstName: firstName, lastName: lastName, city: city};
  console.log("Found result: " + JSON.stringify(params));
	// Render the response, using the EJS page "result.ejs" in the pages directory
	response.render('pages/result', params);
  }

// This function handles requests to the /getPerson endpoint
// it expects to have an id on the query string, such as: http://localhost:5000/getPerson?id=1
function getPerson(request, response) 
{
	// First get the person's id
	const id = request.query.externalID;

	// TODO: We should really check here for a valid id before continuing on...

	// use a helper function to query the DB, and provide a callback for when it's done
  /*
	getPersonFromDb(id, function(error, result) 
  {
		// This is the callback function that will be called when the DB is done.
		// The job here is just to send it back.
    //const params = {externalID: externalID, firstName: firstName, lastName: lastName, city: city}
		// Make sure we got a row with the person, then prepare JSON to send back
		/*
    if (error || result == null) { // result.length != 1) {
			response.status(500).json({success: false, data: error});
		} else {
			const person = result.rows;//[0];
			//response.status(200).json(person);
      //const params = {firstname: person.firstname}
      console.log("logger: " + JSON.stringify(person));
      response.render('pages/search', person);
		}
    
	});
  */

  console.log("Getting person from DB with id: " + id);

  // Set up the SQL that we will use for our query. Note that we can make
  // use of parameter placeholders just like with PHP's PDO.
  const sql = "SELECT * FROM sf WHERE external_ID = $1::text" //'" + id + "';";

  // We now set up an array of all the parameters we will pass to fill the
  // placeholder spots we left in the query.
  const params = [id];

  // This runs the query, and then calls the provided anonymous callback function
  // with the results.
  pool.query(sql, params, function(err, result) {
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

// This function gets a person from the DB.
// By separating this out from the handler above, we can keep our model
// logic (this function) separate from our controller logic (the getPerson function)
function getPersonFromDb(id, callback) {
	console.log("Getting person from DB with id: " + id);

	// Set up the SQL that we will use for our query. Note that we can make
	// use of parameter placeholders just like with PHP's PDO.
	const sql = "SELECT * FROM sf WHERE external_ID = $1::text" //'" + id + "';";

	// We now set up an array of all the parameters we will pass to fill the
	// placeholder spots we left in the query.
	const params = [id];

	// This runs the query, and then calls the provided anonymous callback function
	// with the results.
	pool.query(sql, params, function(err, result) {
		// If an error occurred...
		if (err) {
			console.log("Error in query: ")
			console.log(err);
			callback(err, null);
		}

		// Log this to the console for debugging purposes.
		console.log("Found result: " + JSON.stringify(result.rows));


		// When someone else called this function, they supplied the function
		// they wanted called when we were all done. Call that function now
		// and pass it the results.

		// (The first parameter is the error variable, so we will pass null.)
		//callback(null, result.rows);
	});
}
