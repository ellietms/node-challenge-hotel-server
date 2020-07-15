const express = require("express");
const cors = require("cors");
let bookings = require("./bookings.json");
let moment = require("./node_modules/moment")

const app = express();

app.use(express.json());
app.use(cors());

// level 1

app.get("/", (req, res) => {
  res.json("Hey! Ellie ' s server is working :)");
});

// read all bookings
app.get("/bookings", function (req, res) {
  res.json(bookings);
});

// read bookings with specific ids
app.get("/bookings/:id", (req, res) => {
  const { id } = req.params;
  const bookingWithId = bookings.find((booking) => booking.id === Number(id));
  console.log(bookingWithId);
  if (bookingWithId) {
    res.json(bookingWithId);
  } else {
    res.status(404).json("Sorry can not find any data with this id");
  }
});

// create new bookings
app.post("/bookings/newBooking", (req, res) => {
  // level 2
  if (
    req.body.title === "" ||
    req.body.firstName === "" ||
    req.body.surname === "" ||
    req.body.email === "" ||
    req.body.checkInDate === "" ||
    req.body.checkOutDate === ""
  ) 
  {
    res.send(400).json("Please make sure all fields are filled in correctly");
  } 
  else {
    let ID = newId(bookings);
    let RoomId = newRoomId(bookings);
    bookings.push({
      id: ID,
      title: req.body.title,
      firstName: req.body.firstName,
      surname: req.body.surname,
      email: req.body.email,
      roomId: RoomId,
      checkInDate: req.body.checkInDate,
      checkOutDate: req.body.checkOutDate,
    });
  }
  res.json(bookings);
});

// Make new Id
function newId(arr) {
  if (arr.length !== 0) {
    return Math.max(...Object.values(arr.map((element) => element.id))) + 1;
  } else {
    return 0;
  }
}

// Make new roomId
function newRoomId(arr) {
  if (arr.length !== 0) {
    return Math.max(...Object.values(arr.map((element) => element.roomId))) + 1;
  } else {
    return 0;
  }
}

// delete one booking
app.delete("/bookings/remove/:id", (req, res) => {
  let { id } = req.params;
  bookings = bookings.filter((booking) => booking.id !== Number(id));
  if (bookings) {
    res.json(bookings);
  } else {
    res.send(404).json("Sorry can not find any data with this id");
  }
});

// level 3
app.get("/bookings/search/:date",(req,res) => {
  let {date} = req.params
  console.log(date)
  date = moment(date).format("YYYY-MM-DD");
  console.log(date)
  bookings = bookings.filter(booking => booking.checkInDate === date)
  res.json(bookings);
})


const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
