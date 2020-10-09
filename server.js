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




// level 1
app.get("/", (req, res) => {
  const client = new mongodb.MongoClient(uri);
  client.connect(() => {
    res.json("Hey! Ellie ' s server is working :)");
  });
});

// read all bookings
app.get("/bookings", (req, res) => {
  const client = new mongodb.MongoClient(uri);
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

// read bookings with specific ids
app.get("/bookings/:id", (req, res) => {
  const client = new mongodb.MongoClient(uri);
  client.connect(() => {
    const db = client.db("Hotel");
    const collection = db.collection("Data");
    const { id } = req.params;
    let newId;
    if (mongodb.ObjectID.isValid(id)) {
      newId = mongodb.ObjectID(id);
      collection.findOne({ _id: newId }, (err, data) => {
        if (err) {
          response.send("Error",err);
          client.close();
        } else {
          response.send(data);
          client.close();
        }
      });
    } else {
      res.send("id is not valid");
      client.close();
    }
  });
});

// create new bookings
// level 2 & level 4
app.post("/bookings/newBooking", (req, res) => {
  const client = new mongodb.MongoClient(uri);
  client.connect(() => {
    const db = client.db("Hotel");
    const collection = db.collection("Data");
    const newData = {
      title: req.body.title,
      firstName: req.body.firstName,
      surname: req.body.surname,
      email: req.body.email,
      checkInDate: req.body.checkInDate,
      checkOutDate: req.body.checkOutDate,
    };
    collection.insertOne(newData, (err, data) => {
      if (
        req.body.title === "" ||
        req.body.firstName === "" ||
        req.body.surname === "" ||
        req.body.email === "" ||
        req.body.checkInDate === "" ||
        req.body.checkOutDate === ""
      ) {
        res
          .status(400)
          .json("Please make sure all fields are filled in correctly");
        client.close();
      } else if (
        validator.validate(req.body.email) &&
        moment(req.body.checkOutDate).diff(moment(req.body.checkInDate)) > 0
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

// Make new Id
// function newId(arr) {
//   if (arr.length !== 0) {
//     return Math.max(...Object.values(arr.map((element) => element.id))) + 1;
//   } else {
//     return 0;
//   }
// }

// Make new roomId
// function newRoomId(arr) {
//   if (arr.length !== 0) {
//     return Math.max(...Object.values(arr.map((element) => element.roomId))) + 1;
//   } else {
//     return 0;
//   }
// }

// delete one booking
app.delete("/bookings/remove/:id", (req, res) => {
  const client = new mongodb.MongoClient(uri);
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
          res.send("NewData", newData);
          client.close();
        }
      });
    } else {
      res.send(404).json("Sorry can not find any data with this id");
    }
  });
});

// level 3
// if the customer write down another type how can I convert it to this type?
app.get("/bookings/search/:date", (req, res) => {
  const client = new mongodb.MongoClient(uri);
  client.connect(() => {
    const db = client.db("Hotel");
    const collection = db.collection("Data");
    let { date } = req.params;
    date = moment(date).format("YYYY-MM-DD");
    collection.findOne().toArray((err, data) => {
      if (err) {
        response.send(err);
        client.close();
      } else {
        const filteredData = data.filter(
          (booking) => booking.checkInDate === date
        );
        res.json(filteredData);
        client.close();
      }
    });
  });
});

// level 5
// Cannot set headers after they are sent to the client
// route names!!
app.post("/bookings/search/info", (req, res) => {
  const client = new mongodb.MongoClient(uri);
  client.connect(() => {
    const db = client.db("Hotel");
    const collection = db.collection("Data");
    let surname = `${req.query.surname}`;
    let firstName = `${req.query.firstName}`;
    let email = `${req.query.email}`;
    collection.find().toArray((err, data) => {
      if (email) {
        let filteredEmail = data.filter((booking) => booking.email === email);
        res.json(filteredEmail);
      }
      if (firstName) {
        let filteredFirstName = data.filter(
          (booking) => booking.firstName === firstName
        );
        res.json(filteredFirstName);
      }
      if (surname) {
        let filteredSurname = bookings.filter(
          (booking) => booking.surname === surname
        );
        res.json(filteredSurname);
      }
      if (err) {
        res.json("Error", err);
      }
    });
  });
});

const listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
