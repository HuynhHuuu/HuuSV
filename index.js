const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const admin = require("firebase-admin");
var key = require("./keys/key.json");
const { request, response } = require("express");

admin.initializeApp({
    credential: admin.credential.cert(key)
  });
  
  const firestore = admin.firestore();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());


app.get("/", (request, response) => {
    response.send({
      'name': 'Quý',
      'age': '29'
    });
  });

  app.get("/api/:name", async function (request, response) {
    let params = request.params.name;
    let querySnapshot = await firestore.collection(params).get();

    let datas = await querySnapshot.docs.map((value) => {
      let temp = value.data();
      return temp;
    })
    response.send(datas);
  });

  app.get("/api/:collection/:docId", async function (request, response) {
    let collectionName = request.params.collection;
    let docId = request.params.docId;
    let querySnapshot = await firestore.collection(collectionName).doc(docId).get();
    let result = querySnapshot.data();
    console.log(result);
    response.send(result);
  });
  
  
  app.get("/api", async function (request, response) {
    let temp = request.query.data;
    console.log("API 2 " + JSON.stringify(temp));
    try {
      let querySnapshot = await (
        await firestore.collection(temp).get()
      ).docs.map((value) => {
        let temp = value.data();
        return temp;
      });
      response.send(querySnapshot);
    } catch (error) {
      console.log("Lỗi không lấy được data");
    }
  });
  
  app.post("/api", async (req, res) => {
    let body = req.body;
    console.log(body);
  
    let docName = body.data.name;
  
    let result = await firestore
      .collection(body.collectionName)
      .doc(docName)
      .set(body.data);
  
    res.send({
      message: "Successful!!!",
    });
  });

  app.put("/api/:collection/:docId", async (request,response) => {
    let collectionName = request.body.collectionName;
    let docId = request.body.docId;

    let data = await firestore.collection(collectionName).doc(docId).update(request.body.data);
    response.send({
      message: "Update successful!!",
      updateTime: data.writeTime,
    });
  })

  app.put("/api/update", async (request,response) => {
    let collectionName = request.body.collectionName;
    let docId = request.body.docId;
    try{
    let data = await firestore.collection(collectionName).doc(docId).set(request.body.data);
    response.send(data);
   }catch(error){
    response.send({
      error:error.toString()
      });
    }
  });


  app.delete("/api/deletefield", async (request, response) => {
    let collectionName = request.body.collectionName;
    let docId = request.body.docId;
    let fields = request.body.fields;

    for (let field of fields) {
      let result = await firestore
        .collection(collectionName)
        .doc(docId)
        .update({ [field]: admin.firestore.FieldValue.delete() });
      console.log(result);
    }
    response.send("ahihihihih!!!!!");
  });


  app.delete("/api/delete", async (request,response) => {
    let collectionName = request.body.collectionName;
    let docId = request.body.docId;
      let data = await firestore.collection(collectionName).doc(docId).delete();
      response.send(data);
  })

 
  app.delete("/api/deletedocument", async (request,response) => {
    let collectionName = request.body.collectionName;
    let docIds = request.body.docIds;
    for(let docId of docIds){
      try{
      let data = await firestore.collection(collectionName).doc(docId).delete();
      response.send(data);
    }catch(error){
      response.send({
        error:error.toString()
        });
    }
    }
  })

 
  app.delete("/api/:name", async function (request, response) {
    let params = request.params.name;
    let querySnapshot = firestore.collection(params).get()
    .then(res => {
        
      res.forEach(element => {
        element.ref.delete();
      });
    });
    response.send(querySnapshot);
  });

let Port = 3000;
app.listen(Port, () => {
    console.log(`Server is running on port http://localhost:${Port}/`);
})