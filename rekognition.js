require("dotenv").config();
const {
  RekognitionClient,
  CreateCollectionCommand,
} = require("aws-sdk/clients/rekognition");
const AWS = require("aws-sdk");

const { AWS_KEY_VALUE, AWS_SECRET_KEY_VALUE, AWS_REGION_VALUE } = process.env;

// Necesitamos estas variables de AWS para poder acceder al servicio
if (!AWS_KEY_VALUE || !AWS_REGION_VALUE || !AWS_SECRET_KEY_VALUE)
  throw new Error("Missing aws enviroment vars");
const rekognition = new AWS.Rekognition({
  accessKeyId: AWS_KEY_VALUE,
  secretAccessKey: AWS_SECRET_KEY_VALUE,
  region: AWS_REGION_VALUE,
  // apiVersion: "2016-06-27",
});
const rekognizeText = async (req, res) => {
  const { file } = req;
  if (!file) return res.status(400).send();

  console.log(rekognizeText);
  // Usando un FileStream para enviar a AWS
  const params = {
    Image: {
      Bytes: file.buffer,
    },
  };

  try {
    // Solicitamos el reconocimiento a AWS
    const response = await rekognition.detectText(params).promise();
    const detections = response.TextDetections.map(
      (detects) => detects.DetectedText
    );
    return res.send({
      detections,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error });
  }
};

const rekognizeFace = async (req, res) => {
  const { file } = req;
  console.log(file);
  if (!file) return res.status(400).send();
  //Inicializamos la instancia de AWS Rekognition

  // Usando un FileStream para enviar a AWS
  const params = {
    Image: {
      Bytes: file.buffer,
    },
    Attributes: ["ALL"],
  };

  try {
    // Solicitamos el reconocimiento a AWS
    const response = await rekognition.detectFaces(params).promise();
    const detections = response;
    return res.send({
      detections,
    });
  } catch (error) {
    console.log("ERROR");
    console.error(error);
    return res.status(500).send({ error });
  }
};

const rekognizeCompare = async (req, res) => {
  const { files } = req;
  if (!files) return res.status(400).send();
  // Inicializamos la instancia de AWS Rekognition

  const params = {
    TargetImage: {
      Bytes: files[0].buffer,
    },
    SourceImage: {
      Bytes: files[1].buffer,
    },
    SimilarityThreshold: 0,
  };

  try {
    // Solicitamos el reconocimiento a AWS
    const response = await rekognition.compareFaces(params).promise();
    const detections = response.FaceMatches;
    return res.send({
      detections,
    });
  } catch (error) {
    console.log("ERROR");
    console.error(error);
    return res.status(500).send({ error });
  }
};

const createCollection = async (req, res) => {
  const { collectionName } = req.body;
  try {
    console.log(`creating collection: ${collectionName}`);
    const data = await rekognition
      .createCollection({
        CollectionId: collectionName,
      })
      .promise();
    console.log("Collection ARN:");
    console.log(data.CollectionARN);
    console.log("Status Code:");
    console.log(String(data.StatusCode));
    console.log("Success.", data);
    return data;
  } catch (err) {
    console.log("error", err.stack);
  }
};
const deleteCollection = async (req, res) => {
  const { collectionName } = req.body;
  try {
    console.log(`deleting collection: ${collectionName}`);
    const data = await rekognition
      .deleteCollection({
        CollectionId: collectionName,
      })
      .promise();
    console.log("Collection ARN:");
    console.log(data.CollectionARN);
    console.log("Status Code:");
    console.log(String(data.StatusCode));
    console.log("Success.", data);
    return data;
  } catch (err) {
    console.log("error", err.stack);
  }
};
const addFaceToCollection = async (req, res) => {
  const {
    file,
    body: { collectionName, name_id },
  } = req;
  console.log("NOMBRE DE LA COLLECI??ON", collectionName);
  if (!file) return res.status(400).send();
  //Inicializamos la instancia de AWS Rekognition

  // Usando un FileStream para enviar a AWS
  const params = {
    Image: {
      Bytes: file.buffer,
    },
    ExternalImageId: name_id,
    MaxFaces: 1,
    QualityFilter: "AUTO",
    CollectionId: collectionName,
  };

  try {
    // Solicitamos el reconocimiento a AWS
    console.log(params);
    const response = await rekognition.indexFaces(params).promise();
    console.log(response);
    return res.send({
      response,
    });
  } catch (error) {
    console.log("ERROR");
    console.error(error);
    return res.status(500).send({ error });
  }
};
const searchFaceByImage = async (req, res) => {
  const {
    file,
    body: { collectionName },
  } = req;
  console.log("NOMBRE DE LA COLLECI??ON", collectionName);
  if (!file) return res.status(400).send();
  //Inicializamos la instancia de AWS Rekognition

  // Usando un FileStream para enviar a AWS
  const params = {
    Image: {
      Bytes: file.buffer,
    },
    // MaxFaces: 1,
    // FaceMatchThreshold?: Percent;
    // QualityFilter?: QualityFilter;
    CollectionId: collectionName,
  };

  try {
    // Solicitamos el reconocimiento a AWS
    console.log(params);
    const response = await rekognition.searchFacesByImage(params).promise();
    const faceMatches = response.FaceMatches;
    console.log("faceMatches", faceMatches);
    return res.send({
      faceMatches,
    });
  } catch (error) {
    console.log("ERROR");
    console.error(error);
    return res.status(500).send({ error });
  }
};
const listCollection = async () => {
  try {
    console.log("listing collections");
    const data = await rekognition.listCollections().promise();
    console.log("collections:");
    console.log(data.CollectionIds);
    console.log("success.", data);
    return data;
  } catch (err) {
    console.log("error", err.stack);
  }
};
``;
module.exports = {
  rekognizeText,
  rekognizeFace,
  rekognizeCompare,
  createCollection,
  listCollection,
  deleteCollection,
  addFaceToCollection,
  searchFaceByImage,
};
