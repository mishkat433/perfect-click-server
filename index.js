require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
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
        const albumCollection = client.db("perfectClick").collection("album");
        const workInfoCollection = client.db("perfectClick").collection("workInfo");


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

    }
    finally { }
}
run().catch(err => { console.log(err) })


app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
})