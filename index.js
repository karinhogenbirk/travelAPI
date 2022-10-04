const { response } = require("express")
const express = require("express")
const app = express()
const PORT = 4000
const z = require("zod")
let destinations = require("./destinations.json")
let activities = require("./activities.json")
//in order to add bodies to the request (POST):
app.use(express.json());



// app.get("/", (request, response) => {
//     response.send("Hello World");
// });

app.delete("/destinations/:id", (request, response) => {
    console.log(request.params.id)
//method using filter
// let updatedDestinations = destinations.filter((destination) => Number(request.params.id) !== destination.id)
    let deletedId = null;
    let updatedDestinations = [];
        for (let index = 0; index < destinations.length; index++) {
            const destination = destinations[index];
            if (Number(request.params.id) === destination.id) {
            deletedId = destination.id;
            } else {
     updatedDestinations.push(destination);
     }
    
    if(deletedId === null) {
    return response
    .status(400)
    .json({message: "Destination does not exist" });
    }
    
            destinations = updatedDestinations
            return response
            .status(200)
            .json({message: "Destination deleted", id: Number(request.params.id)})
            
}
        })

app.patch("/destinations/:id", (request, response)=> {
    console.log(request.params.id, request.body);
const destinationToUpdate = destinations.find(destination => Number(request.params.id) ===
destination.id)
    for (key in request.body) {
    if (destinationToUpdate.hasOwnProperty(key) && key !== "id") {
        destinationToUpdate[key] = request.body[key];
    }
    }
    return response
    .status(200)
    .json({ message: "Destination updated! ", destination: destinationToUpdate})
})


app.listen(PORT, () => {
    console.log(`I AM ALIVE! on port ${PORT}`);
});

app.get("/destinations", (request, response) => {
    return response.json(destinations)
});

const countries = ["vietnam", "cambodia", "england", "spain", "cuba", "philippines", "australia", "france", "greece", "sweden" ];
const ValidCountry = z.enum(countries)

app.get("/destinations/:country", (request, response) => {
    try {
        console.log(request.params);
        const countryDestination = ValidCountry.parse(request.params.country);
        console.log(countryDestination)
        const destination = destinations.find(
            (destination) => destination.country.toLowerCase() === request.params.country
            );
        return response
        .status(200)
        .json(destination);
    } catch (error) {
        console.log(error.name, error.issues)
        if (error.name === "ZodError") {
    return response.status(404).json({message: "Validation error! I do not have info about this country. ", errors: error.issues});
        }
    }
       
});

//validation, required keys + what kind of keys
const ValidDestination = z.object({
    country: z.string(),
    religion: z.string(),
    language: z.string().array(),
    currency: z.string().array()
   })

app.post("/destinations", (request, response) => {
    try {
        const nextId = destinations.length + 1;
        const newDestinationData = ValidDestination.parse(request.body)
        //parse: uitlezen en controle uitvoeren op validation
        console.log(newDestinationData)
        const newDestination = {...request.body, id: nextId}
        destinations.push(newDestination)
        return response
        .status(201)
        .json(newDestination);  
    } catch (error) {
       console.log(error.name, error.issues) 
    //als je wilt checken welke keys in een object voorkomen, kun je Object.keys() gebruiken: console.log(Object.keys(error))
    if(error.name === "ZodError") {
        return response.status(400).json({message: "Validation error!", error: error.issues})
    } }
}) 

app.get("/activities", (req, res) => {
    return res.json(activities)
})

const categories = ["outdoors", "water activity","culture", "dare devils", "relaxation" ];
const ValidCategory = z.enum(categories)
const activitiesList = ["scuba diving", "rock climbing", "snorkeling", "hiking", "temple visiting", "motor riding", "para gliding", "sun bathing", "spa", "city walks"]
const ValidActivity = z.enum(activitiesList)
const intensities = ["light", "moderate", "vigorous" ]
const ValidIntensity = z.enum(intensities)

app.get("/activities/search", (request, response) => {
    console.log(request.query);
    if (request.query.category) {

        try {
     const filteredCategory = ValidCategory.parse(request.query.category)
     console.log(filteredCategory)
    const activity = activities.filter(
    (activity) => activity.category.toLowerCase() === request.query.category);
         return response.json(activity)
        } catch (error) {
    console.log(error.name, error.issues)
        if (error.name === "ZodError") {
            return response
            .status(400)
            .json({messgae: "Validation error! ", errors: error.issues})
        }
        }

    } else if (request.query.activity) {
try {
    const filteredActivity = ValidActivity.parse(request.query.activity)
    console.log(filteredActivity)
    const activity = activities.filter(
        (activity) => activity.activity.toLowerCase() === request.query.activity);
    return response.json(activity) 
} catch (error) {
    console.log(error.name, error.issues)
    if (error.name === "ZodError") {
        return response
        .status(400)
        .json({messgae: "Validation error! ", errors: error.issues})
    }
}

    } else if (request.query.intensity) {

        try {
            const filteredIntensity = ValidIntensity.parse(request.query.intensity)
            console.log(filteredIntensity) 
            const activity = activities.filter(
                (activity) => activity.intensity.toLowerCase() === request.query.intensity);
            return response.json(activity)    
        } catch (error) {
            console.log(error.name, error.issues)
            if (error.name === "ZodError") {
                return response
                .status(400)
                .json({messgae: "Validation error! ", errors: error.issues})
            }   
        }

    } else if (request.query.country) {


            var capitalizeQuery = request.query.country.charAt(0).toUpperCase() + request.query.country.slice(1);
            const activitiesFilteredByCountry = activities.filter(
                activity => {
                    return activity.country.includes(capitalizeQuery)
                }
            )
            return response.status(200).json(activitiesFilteredByCountry)

        }

    else if (request.query.id) {
        const activity = activities.find(activity => 
            activity.id === Number(request.query.id));
            return response.json(activity)
    } 
    return response.status(400).json({message: "please add a query string"})
})


app.get("/activities/:activity", (req, res) => {
    console.log(req.params);
    const activityType = activities.find(
        (activityType) => 
        activityType.activity.toLowerCase() === req.params.activity
        );
        // console.log(activityType);
        return res.json(activityType)

})

app.patch("/activities/:id", (response, request) => {
    console.log(request.params.id, request.body);
    // //welke activiteit ga je updaten 
    // const activityToUpdate = activities.find(activity => activity.id === Number(request.params.id))
    // //loopen door de activities met for in loop. Key = bijv "category"
    // for(key in request.body) {
    //     if(activityToUpdate.hasOwnProperty(key) && key !== "id") {
    //         activityToUpdate[key] = request.body[key];
    //     //de key uit de activity die je wilt updaten, wordt de key die je in de body hebt gezet in postman
    //     }
    // }
    // //laatste stap: return een response
    // return response
    // .status(200)
    // .json({ message: "Activity updated.", activity: activityToUpdate});

})




