const express = require("express");
const app = express();
app.use(express.json());

const { Pool } = require("pg");
const pool = new Pool({
  user: "cyf45",
  host: "database-1.c7jkbbjyxtpj.us-east-1.rds.amazonaws.com",
  database: "cyf45",
  password: "iWOKSlde",
  port: 5432,
});

app.get("/customers", (req, res) => {
  pool
    .query("SELECT * FROM customers ORDER BY name ASC")
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    });
});

app.get("/customers/:customerId", (req, res) => {
  const { id } = req.params;
  console.log(id);
});

app.get("/hotels", (req, res) => {
  pool
    .query("SELECT * FROM hotels")
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    });
});

app.get("/hotels/:hotelId", (req, res) => {
  const id = req.params.hotelId;

  pool
    .query("SELECT * FROM hotels WHERE id=$1;", [id])
    .then((result) => res.json(result))
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    });
});

app.post("/hotels", (req, res) => {
  const newHotelName = req.body.name;
  const newHotelRooms = req.body.rooms;
  const newHotelPostcode = req.body.postcode;
  console.log(newHotelName);
  if (!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
    return res
      .status(400)
      .send(
        "The number of rooms should be a positive integer. Found " + req.body
      );
  }

  if (newHotelName.length <= 0) {
    return res.status(400).send("The name of hotel could not be empty ");
  }

  pool
    .query("SELECT * FROM hotels WHERE name=$1", [newHotelName])
    .then((result) => {
      if (result.rows.length > 0) {
        return res
          .status(400)
          .send("An hotel with the same name already exists!");
      } else {
        const query =
          "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";
        pool
          .query(query, [newHotelName, newHotelRooms, newHotelPostcode])
          .then(() => res.send("Hotel created!"))
          .catch((error) => {
            console.error(error);
            res.status(500).json(error);
          });
      }
    });
});

app.get("/customers/:customersId", (req, res) => {
  const { customersId } = req.params;

  pool
    .query("SELECT * FROM customers WHERE id=$1;", [customersId])
    .then((result) => res.json(result))
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    });
});

app.get("/customers/:customersId/bookings", (req, res) => {
  const { customersId } = req.params;

  pool
    .query(
      "select customers.name, bookings.checkin_date, bookings.nights,hotels.name, hotels.postcode from customers inner join bookings on bookings.customer_id=customers.id inner join hotels on customers.id=hotels.id where customers.id=$1;",
      [customersId]
    )
    .then((result) => res.json(result))
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    });
});

app.delete("/customers/:customerId", (req, res) => {
  const { customersId } = req.params;
  pool
    .query(`delete from customers where id=${customerId}`)
    .then((result) => res.json(result))
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    });
});

app.listen(5000, () => {
  console.log("Serevr is working");
});
