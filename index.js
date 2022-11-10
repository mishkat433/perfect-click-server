require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require("express");
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DBUSER_NAME}:${process.env.DBUSER_PASSWORD}@cluster0.twfgu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.get("/", (req, res) => {
    res.send("server is running")
})

function tokenVerify(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next()
    })
}


async function run() {
    try {
        const servicesCollection = client.db("perfectClick").collection("services");
        const reviewCollection = client.db("perfectClick").collection("review");
        const albumCollection = client.db("perfectClick").collection("album");
        const workInfoCollection = client.db("perfectClick").collection("workInfo");


        app.post("/jwt", (req, res) => {
            const userToken = req.body
            const token = jwt.sign(userToken, process.env.JWT_TOKEN_SECRET, { expiresIn: "1d" })
            res.send({ token })
        })


        // service start

        app.get("/services", async (req, res) => {
            const query = {}
            if (req.query.limit) {
                const cursor = servicesCollection.find(query).sort({ _id: -1 }).limit(parseInt(req.query.limit))
                const result = await cursor.toArray()
                return res.send(result)
            }
            const cursor = servicesCollection.find(query).sort({ _id: -1 })
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

        app.post("/addServices", async (req, res) => {
            const data = req.body
            const cursor = await servicesCollection.insertOne(data)
            res.send(cursor)
        })

        // service end

        // review start

        app.get("/review", async (req, res) => {
            const id = req.query.id;
            let query = {}
            const filter = { serviceId: id }
            const cursor = reviewCollection.find(filter).sort({ time: -1 })
            const result = await cursor.toArray()
            return res.send(result)
        })

        app.get("/myReview", tokenVerify, async (req, res) => {
            const user = req.query.email;
            const decoded = req.decoded
            let query = {}
            if (decoded.email !== null) {
                if (decoded.email !== user) {
                    console.log("logout");
                    return res.status(403).send({ message: "unauthorized access" })
                } else {
                    query = { email: user }
                }
            }
            else {
                if (decoded.name !== user) {
                    console.log("logout");
                    return res.status(403).send({ message: "unauthorized access" })
                }
                else {
                    query = { name: user }
                }
            }

            const cursor = reviewCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post("/addComment", async (req, res) => {
            const data = req.body
            const cursor = await reviewCollection.insertOne(data)
            res.send(cursor)
        })

        app.put("/updateService/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const review = req.body
            const option = { upsert: true };
            const updateReview = {
                $set: {
                    comment: review.comment
                }
            }
            const result = await reviewCollection.updateOne(query, updateReview, option)
            res.send(result);
        })

        app.delete("/deleteReview/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

        // review end



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


