
var express = require("express")
var app = express()
var Users = require("./schema/user");
const { Payload } =require("dialogflow-fulfillment");
var Problem = require("./schema/problem");
var mongoose = require("mongoose");
var randomstring = require("randomstring"); 
var bodyParser = require('body-parser');
var dff = require('dialogflow-fulfillment')
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/chatbot", { useUnifiedTopology: true, useNewUrlParser: true });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



//Request Handler
app.post("/botservice", (req, res) => {

   var username = "none";


   async function verify(agent) {
    var user=await Users.find({contact : agent.parameters.phn});
    
    if(user.length==0){
       agent.add("Please enter registered mobile number")
    }else{
       console.log("username ="+ user[0].uname);
       agent.context.set({
          'name': 'username',
          'lifespan': 50,
          'parameters': {
             'uname': user[0].uname
          }
       });
       agent.add("Greetings "+user[0].uname+" Are u facing any trouble ?");
 
    }
   

 }

 function custom_payload(agent)
 {
     var payLoadData=
         {
   "richContent": [
     [
       {
         "type": "list",
         "title": "Internet Down",
         "subtitle": "Press '1' for Internet is down",
         "event": {
           "name": "",
           "languageCode": "",
           "parameters": {}
         }
       },
       {
         "type": "divider"
       },
       {
         "type": "list",
         "title": "Slow Internet",
         "subtitle": "Press '2' Slow Internet",
         "event": {
           "name": "",
           "languageCode": "",
           "parameters": {}
         }
       },
       {
         "type": "divider"
       },
       {
         "type": "list",
         "title": "Buffering problem",
         "subtitle": "Press '3' for Buffering problem",
         "event": {
           "name": "",
           "languageCode": "",
           "parameters": {}
         }
       },
       {
         "type": "divider"
       },
       {
         "type": "list",
         "title": "No connectivity",
         "subtitle": "Press '4' for No connectivity",
         "event": {
           "name": "",
           "languageCode": "",
           "parameters": {}
         }
       }
     ]
   ]
 }
 agent.add(new Payload(agent.UNSPECIFIED,payLoadData,{sendAsMessage:true, rawPayload:true }));
 }
 


 async function problem(agent) {
    var issue_vals={1:"Internet Down",2:"Slow Internet",3:"Buffering problem",4:"No connectivity"};

    const intent_val=agent.parameters.choice;
    
    var val=issue_vals[intent_val];
    console.log(val+"  "+intent_val);

    var myData = new Problem();
    myData.issueid = randomstring.generate(7);
    myData.issue = val;
    myData.status = "Pending";   
    myData.date = new Date();
    myData.contact = agent.getContext("phn").parameters.phn;
    myData.save()
       .then(item => {
          console.log("Issue Identified and saved");
       })
       .catch(err => {
          res.status(400).send("unable to identify " + err);
       });
   
    console.log("Number: "+myData.contact);
    var user=await Users.find({contact: myData.contact});
       if(user.length==0){
          agent.add("Not Registered user")
       }else {
           console.log(myData.contact);
          s=agent.getContext("username").parameters.uname;
          agent.add("Sorry for the bother! We have identified issue.We'll try to solve asap! please use this token to check status :"+myData.issueid);

       }

   
 }

   const agent = new dff.WebhookClient({
      request: req,
      response: res
   });

   var intentMap = new Map();
   intentMap.set('contact-verification', verify);

   intentMap.set('contact-verification - yes', custom_payload);

   intentMap.set('problem_recording',problem)
   agent.handleRequest(intentMap);

});

//To insert user data
app.post("/insert", (req, res) => {
   var myData = new Users(req.body);
   myData.save()
      .then(item => {
         console.log("user registered " + req.body.contact);

      })
      .catch(err => {
         res.status(400).send("unable to register " + err);
      });

});

//Port Listening
app.listen(8080)
