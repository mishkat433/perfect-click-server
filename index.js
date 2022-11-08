require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DBUSER_NAME}:${process.env.DBUSER_PASSWORD}@cluster0.twfgu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.get("/", (req, res) => {
    res.send("server is running")
})


async function run() {
    try {
        const servicesCollection = client.db("perfectClick").collection("services");
        const reviewCollection = client.db("perfectClick").collection("review");
        const albumCollection = client.db("perfectClick").collection("album");
        const workInfoCollection = client.db("perfectClick").collection("workInfo");

        // service start

        app.get("/services", async (req, res) => {
            const query = {}
            if (req.query.limit) {
                const cursor = servicesCollection.find(query).limit(parseInt(req.query.limit))
                const result = await cursor.toArray()
                return res.send(result)
            }
            const cursor = servicesCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get("/singleService/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const cursor = servicesCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // service end

        // comments start

        app.post("/addComment", async (req, res) => {
            const data = req.body
            const cursor = await reviewCollection.insertOne(data)
            res.send(cursor)
        })
        // comments end



        // Other start

        app.get("/workInfo", async (req, res) => {
            const query = {}
            const cursor = workInfoCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get("/album", async (req, res) => {
            const query = {}
            const cursor = albumCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // Other end

    }
    finally { }
}
run().catch(err => { console.log(err) })


app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
})