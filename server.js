const express = require("express");
const multer = require("multer");
var bodyParser = require("body-parser");
const rekognitionController = require("./rekognition");
const multerMiddleware = multer();
const server = express();
const { SERVER_PORT = 8080 } = process.env;

//serve html file for the client
server.use(bodyParser.json()); // support json encoded bodies
server.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
server.use(express.static("public"));
server.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

server.post("/text", [
  multerMiddleware.single("fileToUpload"),
  rekognitionController.rekognizeText,
]);
server.post("/face", [
  multerMiddleware.single("faceToUpload"),
  rekognitionController.rekognizeFace,
]);
server.post("/compare", [
  multerMiddleware.array("faceCompare", 2),
  rekognitionController.rekognizeCompare,
]);
server.post("/create", (req, res) => {
  const data = rekognitionController.createCollection(req, res);
  res.send({ data });
});
server.post("/delete", (req, res) => {
  const data = rekognitionController.deleteCollection(req, res);
  res.send({ data });
});
server.get("/list", async (_, res) => {
  const data = await rekognitionController.listCollection();
  res.send({ data });
});
server.listen(SERVER_PORT, () => {
  console.log("Rekognition API Started at port 8080");
});
