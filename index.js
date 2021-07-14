

const express = require("express");
const app = express();
const PORT = 3001;

const fs = require("fs");
const path = require("path");
const pathToFile = path.resolve("./data.json")

const getResources = () => JSON.parse(fs.readFileSync(pathToFile));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello word!")
})


app.get("/api/resources", (req, res) => {
    const resources = getResources();
    res.send(resources)
})


app.get("/api/active-resource", (req, res) => {
    const resources = getResources();
    const activeResources = resources.find(resource => resource.status === "active");
    res.send(activeResources)
})


app.get("/api/resources/:id", (req, res) => {
    const resources = getResources();
    const { id } = req.params;
    const resource = resources.find((item) => item.id === id);
    res.send(resource)
})


app.patch("/api/resources/:id", (req, res) => {
    const resources = getResources();
    const { id } = req.params;
    const resourceIndex = resources.findIndex((item) => item.id === id);
    const activeResources = resources.find(resource => resource.status === "active")

    if (resources[resourceIndex].status === "complete") {
        return res.status(422).send("Cannot update because resource has been completed!");
    }

    resources[resourceIndex] = req.body;

    if (req.body.status === "active") {
        if (activeResources) {
            return res.status(422).send("There is active resource already!");
        }

        resources[resourceIndex].status = "active";
        resources[resourceIndex].activationTime = new Date();
    }
    
    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
        if (error) {
            return res.status(422).send("Cannot store data in the file!");
        }
        return res.send("Data has been updated!");
        })
})

app.delete("/api/resources/:id", (req, res) => {
    const resources = getResources();
    const { id } = req.params;
    let remainingResources = resources.filter((item) => item.id !== id);
    
    fs.writeFile(pathToFile, JSON.stringify(remainingResources, null, 2), (error) => {
        if (error) {
            return res.status(422).send("Cannot store data in the file!");
        }
        return res.send("Data has been deleted!");
        })
})


app.post("/api/resources", (req, res) => {
    const resources = getResources();
    const resource = req.body;

    resource.createdAt = new Date();
    resource.status = "inactive";
    resource.id = Date.now().toString();
    resources.unshift(resource);

    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
        return res.status(422).send("Cannot store data in the file!");
    }
    return res.send("Data has been saved!");
    })
})


app.listen(PORT, () => {
    console.log("Server runs on: "+PORT)
})