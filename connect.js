const MQTT = require('mqtt')
require('dotenv').config()
const mqtt_uri = process.env.MQTT_CONNECT_STRING
const mqtt_user = process.env.MQTT_USER
const mqtt_pass = process.env.MQTT_PASS
const client = MQTT.connect(mqtt_uri,{username:mqtt_user,password:mqtt_pass})
const mongoose  = require('mongoose')
const testModel = require('./Model')
const Pusher = require('pusher')


const pusher = new Pusher({
    appId: process.env.PUSHER_APPID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: 'ap2',
    useTLS: true
})

const uri = process.env.DB_URL
mongoose.connect(uri,{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true})
const connection = mongoose.connection

connection.once('open',()=>{
    console.log("MongoDB connection established")
    const collections = connection.collection("tests")
    const changeStream = collections.watch()

    changeStream.on('change',(change)=>{
        console.log(change.fullDocument)
        pusher.trigger('message', 'trigger', {
            'message': change.fullDocument
        });
    })

})
client.on('connect', ()=> {
    client.subscribe('hello/hi',()=> {
        console.log('subbed')
        client.on('message', (topic,message)=>{
            const payload = JSON.parse(message.toString())
            const _id = payload._id
            const lat = payload.lat
            const long = payload.long

            const newTest = new testModel({_id,lat,long})

            newTest.save()
        })
    })
})