require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
const uri = process.env.DATABASE_URI;
let moment = require("./node_modules/moment");
let validator = require("email-validator");
const { response } = require("express");
const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use(cors());

// read bookings with specific ids
app.get("/bookings/:id", (req, res) => {
  const client = new mongodb.MongoClient(uri, { useUnifiedTopology: true });
  client.connect(() => {
    const db = client.db("Hotel");
    const collection = db.collection("Data");
    const { id } = req.params;
    console.log(typeof id);
    let newId;
    if (mongodb.ObjectID.isValid(id)) {
      newId = mongodb.ObjectID(id);
      collection.findOne({ _id: newId }, (err, data) => {
        if (err) {
          res.send("Error", err);
          client.close();
        } else {
          res.send(data);
          client.close();
        }
      });
    } else {
      res.send("id is not valid");
      client.close();
    }
  });
});

// read all bookings
app.get("/bookings", (req, res) => {
  const client = new mongodb.MongoClient(uri, { useUnifiedTopology: true });
  client.connect(() => {
    const db = client.db("Hotel");
    const collection = db.collection("Data");
    collection.find().toArray((err, data) => {
      if (err) {
        res.send("Error", err);
        client.close();
      } else {
        res.json(data);
        client.close();
      }
    });
  });
});

//level 1
app.get("/", (req, res) => {
  const client = new mongodb.MongoClient(uri);
  client.connect(() => {
    res.json("Hey! Ellie ' s server is working :)");
  });
});

// create new bookings
// level 2 & level 4
app.post("/bookings/newBooking", (req, res) => {
  const client = new mongodb.MongoClient(uri, { useUnifiedTopology: true });
  client.connect(() => {
    const db = client.db("Hotel");
    const collection = db.collection("Data");
    const newData = {
      title: req.body.title,
      firstName: req.body.firstName,
      surName: req.body.surName,
      email: req.body.email,
      roomId: req.body.roomId,
      checkIn: req.body.checkIn,
      checkOut: req.body.checkOut,
    };
    collection.insertOne(newData, (err, data) => {
      if (
        req.body.title === "" ||
        req.body.firstName === "" ||
        req.body.surName === "" ||
        req.body.email === "" ||
        req.body.roomId === "" ||
        req.body.checkIn === "" ||
        req.body.checkOut === ""
      ) {
        res
          .status(400)
          .json("Please make sure all fields are filled in correctly");
        client.close();
      } else if (
        validator.validate(req.body.email) &&
        moment(req.body.checkOut).diff(moment(req.body.checkIn)) > 0
      ) {
        res.json(data);
        client.close();
      } else {
        res.json("Your information is not correct");
        client.close();
      }
    });
  });
});

// delete one booking
app.delete("/bookings/remove/:id", (req, res) => {
  const client = new mongodb.MongoClient(uri, { useUnifiedTopology: true });
  client.connect(() => {
    const db = client.db("Hotel");
    const collection = db.collection("Data");
    let { id } = req.params;
    let newId;
    if (mongodb.ObjectID.isValid(id)) {
      newId = mongodb.ObjectID(id);
      collection.deleteOne({ _id: newId }, (err, newData) => {
        if (err) {
          res.send("ERROR", err);
          client.close();
        } else {
          res.send("it is removed successfully");
          client.close();
        }
      });
    } else {
      res.status(404).json("Sorry can not find any data with this id");
    }
  });
});

// level 3
// if the customer write down another type how can I convert it to this type?
app.get("/bookings/search/:date", (req, res) => {
  const client = new mongodb.MongoClient(uri, { useUnifiedTopology: true });
  client.connect(() => {
    const db = client.db("Hotel");
    const collection = db.collection("Data");
    let { date } = req.params;
    date = moment(date).format("YYYY-MM-DD");
    collection.findOne({ checkIn: `${date}` }, (err, data) => {
      if (err) {
        res.send(err);
        client.close();
      } else {
        res.json(data);
        client.close();
      }
    });
  });
});

// level 5
// Cannot set headers after they are sent to the client
app.post("/bookings/search", (req, res) => {
  const client = new mongodb.MongoClient(uri, { useUnifiedTopology: true });
  client.connect(() => {
    const db = client.db("Hotel");
    const collection = db.collection("Data");
    let surName = req.body.surName;
    let firstName = req.body.firstName;
    let email = req.body.email;
    const searchObject = {
      $or: [{ email: email }, { surName: surName }, { firstName: firstName }],
    };

    collection.find(searchObject).toArray((err, data) => {
      if (err) {
        res.json("Error", err);
        client.close();
      } else {
        res.json(data);
        client.close;
      }
    });
  });
});

const listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
