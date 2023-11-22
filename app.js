import axios from 'axios';
import express from 'express';
import path  from 'path';
import { fileURLToPath } from 'url';
import bodyParser  from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
var app = express();
const port = 3000;
var questions;

// For Debug
const response_json = {
    id: "chatcmpl-8Kt1mg9nN6e6b5Ms7CfphILdyNhkX",
    object: "chat.completion",
    created: 1699988778,
    model: "gpt-3.5-turbo-0613",
    choices: [
     {
          index: 0,
          message: {
                role: "assistant",
                content: "Hello! I'm an AI language model, so I don't have feelings like humans do, but I'm here to help you with any questions or discussions you might have. How can I assist you today?"
            },
          finish_reason: "stop"
       }
     ],
       usage: {
       prompt_tokens: 13,
       completion_tokens: 42,
       total_tokens: 55
     }
   };

const data = [{ 
    question: "what's your question?",  
}]

app.set('view engine', 'ejs');

app.use( bodyParser.json() );      
app.use(bodyParser.urlencoded({    
    extended: true
})
)

app.get("/", (req, res) => { 
    if(data){
        res.render("home", { 
            data: data 
        })
    }
}) 
var inputQuestion = null;
app.post("/", async (req, res) => { 
    //const inputQuestion = req.body.inputQuestion; 
    if(req.body.telegram_question != null){
        console.log("Telegram Question: ");
        inputQuestion = req.body.telegram_question;
    }else if(req.body.inputQuestion != null){
        console.log("Input Question: ");
        inputQuestion = req.body.inputQuestion; 
    }

    console.log(inputQuestion);

    const inputAnswer = req.body.inputAnswer;
    var response_message;

    const options = {
        method: 'POST',
        url: 'https://chatgpt-best-price.p.rapidapi.com/v1/chat/completions',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': '', // your RapidAPI Key
          'X-RapidAPI-Host': 'chatgpt-best-price.p.rapidapi.com'
        },
        data: {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: inputQuestion
            }
          ]
        }
      };
    if(inputQuestion != null){
        try {
            console.log("Question: "); console.log(inputQuestion);
        // For Production
            //const response = await axios.request(options);
            //console.log("Response: "); console.log(response.data);
            //response_message = response.data.choices[0].message.content;
        // For Debug
            response_message = response_json.choices[0].message.content;
            console.log("Answer: ");console.log(response_message);
        } catch (error) {
            console.error(error);
        }
        data.push({ 
            question: inputQuestion, 
            answer: response_message,
        }) 
        res.render("home", { 
            data: data 
        })
        if(response_message){
            // IFTTT
            try {
                var ifttt_json = {"value1": inputQuestion, "value2": response_message, "value3": "value3"};
                const response_post = axios.post('https://maker.ifttt.com/trigger/chatgpt/with/key/doQAEI_j_vIny71izjU4VS', ifttt_json);
                console.log(response_post);
            } catch (error) {
                console.error(error);
            }
        }
    }else{
        data.push({ 
            question: "Ask a question!", 
        }) 
        res.render("home", { 
            data: data 
        })
    }
}) 


var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Chatbot is listening at http://%s:%s", host, port)
 })

