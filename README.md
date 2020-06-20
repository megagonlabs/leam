# Explorer

## Building the app
To run the Explorer app, simply run the following command
`docker-compose up` in the root directory. 
This will create three containers
- React (the frontend container running a React.js app)
- Flask (the backend container running a Flask web server)
- Postgres (the DB container running a Postgres instance)

After these containers are fully started, you should be able to visit the frontend by visiting the following url in your browser: http://localhost:3000