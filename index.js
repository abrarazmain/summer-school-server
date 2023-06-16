const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const sortBy = require("sort-by");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
const uri =
  "mongodb+srv://summerSchool:8cu4CJymzYtc3CRl@cluster0.wa4fr1c.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  const classCollection = client.db("summerDB").collection("classes");
  const userCollection = client.db("summerDB").collection("users");
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    app.get("/popularClasses", async (req, res) => {
      const result = await classCollection
        .find()
        .sort({ price: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    //   all class
    app.get("/classes", async (req, res) => {
      const result = await classCollection.find().sort({ price: -1 }).toArray();
      res.send(result);
    });

    //   add class
    app.post("/classes", async (req, res) => {
      const newClass = req.body;
      const result = await classCollection.insertOne(newClass);
      res.send(result);
    });

    //   add user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const existingUser = await userCollection.findOne({ email: user.email });

      if (existingUser) {
        res.status(409).send("Email already exists");
      } else {
        const result = await userCollection.insertOne(user);
        res.send(result);
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("toys is running");
});

app.listen(port, () => {
  console.log(`myToys is running on port ${port}`);
});
