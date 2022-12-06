const express = require("express");


const app = express();
app.use(express.json());

const {open} = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
const initializeDbAndServer = ()=>{
    try{
        db = open({
            filename:dbPath,
            driver:sqlite3.Database,
        })
        app.listen(3000, ()=>{
            console.log("server running at portal");
        })
    }catch(err){
        console.log(`DB error: ${err.message}`);
        process.exit(1)        
    }
}


initializeDbAndServer();

const snkCaseTCmlCase = (obj)=>{
    return{
        movieId: obj.movie_id,
        directorId: obj.director_id,
        movieName : obj.movie_name,
        leadActor : obj.lead_actor
    }
}


app.get('/movies/', async (request, response)=>{

    const allMovies = `
        SELECT  
        *
        FROM 
            movie;`;
        
    const movieDetails = await db.all(allMovies);
    movieDetails.map((each)=>{
        response.send(snkCaseTCmlCase(each.movie_name));
    })
    
})


app.post('/movies/', async(request, response)=>{
    const { movieId } = request.params;
    const {directorId, movieName, leadActor} = request.body;
    const creatingANewOne = `
        INSERT 
        INTO 
            movie(director_id, movie_name, lead_actor)
        VALUES(${directorId}, '${movieName}', ${leadActor})
        WHERE 
            movie_id = ${movieId};
        `;

    await db.run(creatingANewOne);
    response.send("Movie Details Updated");

})


app.get('/movies/:movieId/', async(request, response)=>{
    const {movieId} = request.params;
    const movieDetails = `
        SELECT
         * FROM 
         movie
         WHERE 
         movie_id = ${movieID};`;

    const movie = await db.get(movieDetails);
    response.send(movie);             
})


app.put('/movies/:movieId/', async(request, response)=>{
    const { movieId }= request.params;
    const {directorId, movieName, leadActor} = request.body;
    const updateQuery = `
        UPDATE 
        movie 
        SET 
        directorId = ${directorId},
        movieName = '${movieName}',
        leadActor = ${leadActor};`;
        
    await db.run(updateQuery);
    response.send("Movie Details Updated");    
})


app.delete('/movies/:movieId/', async(request, response)=>{
    const { movieId } = request.params;
    const removing = `
        DELETE FROM 
        movie 
        WHERE movie_id = ${movieId};`;

    await db.run(removing);
    response.send("Movie Removed");
})



const directorsTopic = (dbObj)=>{
    return{
        directorId: dbObj.director_id,
        directorName: dbObj.director_name
    }
}




app.get('/directors/', async(request, response)=>{
    const getDetails = `
        SELECT 
        * FROM
        director;`;

    const detailsOfDirectors = await db.run(getDetails);
    detailsOfDirectors.map((each)=>{
        response.send(directorsTopic(each));
    })
})


app.get('/directors/:directorId/movies/', async(request, response)=>{
    const { directorId } =request.params;
    const director = `
        SELECT
        * 
        FROM
        director 
        WHERE 
        director_id = ${directorId};`;

    const movieNm = await db.run(director);
    movieNm.map((each)=>{
        response.send(directorsTopic(each.movie_name));
    })
})

module.exports = app;