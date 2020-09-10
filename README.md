# Leam
`Leam` is a research prototype for integrated visual text analytics that aims to combine the advantages of computational notebooks, spreadsheets, and visualization tools.

## System Archictecture

`Leam` backend features an in-memory dataframe, a versioning database, a compiler for translating visual text algebra (`vta`) commands that the execution engine runs, and a session manager to manage data, code, and visualizations. The following figure shows the overview of the `Leam` system architecture. The components with dashed borders ("--") are partially implemented and require further refinement.

![Alt text](/images/leam-arch.png?raw=true "Leam System Architecture")

##  Building the app

1. Do `cd frontend` to move into the react folder
2. Run `yarn install` - if you don't have yarn you can install via brew or other popular package managers (https://classic.yarnpkg.com/en/docs/install#mac-stable). Sorry this step is a workaround that should be fixed soon!
3. Move back to root folder (`cd ..` if you are in frontend folder) and run `docker-compose up` 

This will create three containers
- React (the frontend container running a React.js app)
- Flask (the backend container running a Flask web server)
- Postgres (the DB container running a Postgres instance)

After these containers are fully started, you should be able to visit the frontend by visiting the following url in your browser: http://localhost:3000

## Meet Leam

![Alt text](/images/leam.jpeg?raw=true "Leam <3")

### License

MIT



