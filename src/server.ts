import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send({message: "Hello, Client!"})
})

export default app;