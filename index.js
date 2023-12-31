const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
const uri =
  `mongodb+srv://${process.env.FIREBASE_NAME}:${process.env.FIREBASE_PUSS}@cluster0.wa4fr1c.mongodb.net/?retryWrites=true&w=majority`;
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
  const selectedClassCollection = client
    .db("summerDB")
    .collection("selectedClassCollection"); // A
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    app.get("/popularClasses", async (req, res) => {
      const result = await classCollection
        .find()
        .sort({ price: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });
    app.get("/popularInstructor", async (req, res) => {
      const query = { position: "instructor" };
      const result = await userCollection.find(query).limit(6).toArray();
      res.send(result);
    });

    //   all class
    app.get("/classes", async (req, res) => {
      const result = await classCollection.find().sort({ price: -1 }).toArray();
      res.send(result);
    });

    //   all user
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // all instructors

    app.get("/Instructor", async (req, res) => {
      const query = { position: "instructor" };
      const result = await userCollection.find(query).toArray();
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

    // update user
    app.put("/updateUser/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const { position } = req.body; 
      
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            position: position, 
          },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.json(result); // Send the result as JSON
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });

    // selected class
    app.post("/selectedClasses", async (req, res) => {
      try {
        const { userId, classId } = req.body;

        const newSelectedClass = {
          userId,
          classId,
        };

        const result = await selectedClassCollection.insertOne(
          newSelectedClass
        );
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });

    // get selected class


    app.get("/selectedClasses/:userId", async (req, res) => {
      try {
        const id = req.params.userId;
        const query = { userId: id };
       
        const result = await selectedClassCollection.find(query).toArray();
        res.json(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });

    // Delete selected class by class ID
    app.delete("/selectedClasses/:classId", async (req, res) => {
      try {
        const classId = req.params.classId;
        const query = { classId: classId };
        const result = await selectedClassCollection.deleteOne(query);

        if (result.deletedCount === 1) {
          res.json({ message: "Selected class deleted successfully" });
        } else {
          res.status(404).json({ error: "Selected class not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });

    // update selected class
    app.post("/selectedClasses", async (req, res) => {
      try {
        const { userId, classId } = req.body;

        const newSelectedClass = {
          userId,
          classId,
        };

        const result = await selectedClassCollection.insertOne(
          newSelectedClass
        );
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });

    // update class

    app.put("/updateClass/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const { status } = req.body; 
   
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            status: status,
          },
        };
        const result = await classCollection.updateOne(filter, updateDoc);
        res.json(result); 
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
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
  res.send("server is running");
});

app.listen(port, () => {

});
