# Explorer

## Building the app

1. Do `cd frontend` to move into the react folder
2. Run `yarn install` - if you don't have yarn you can install via brew or other popular package managers (https://classic.yarnpkg.com/en/docs/install#mac-stable). Sorry this step is a workaround that should be fixed soon!
3. Move back to root folder (`cd ..` if you are in frontend folder) and run `docker-compose up` 

This will create three containers
- React (the frontend container running a React.js app)
- Flask (the backend container running a Flask web server)
- Postgres (the DB container running a Postgres instance)

After these containers are fully started, you should be able to visit the frontend by visiting the following url in your browser: http://localhost:3000