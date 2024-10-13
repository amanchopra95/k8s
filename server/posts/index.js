import express from "express";
import bodyParser from "body-parser";
import {randomBytes} from "crypto"
import cors from "cors";
import axios from "axios";

const app = express()

const posts = {}

app.use(bodyParser.json())
app.use(cors())

app.get('/posts', (req, res) => {
    res.send(posts)
})

app.post('/posts', async (req, res) => {
    const id = randomBytes(4).toString('hex')
    const {title} = req.body

    posts[id] = {
        id, title
    }

    await axios.post('http://event-bus-srv:4005/events', {
        type: 'POSTCREATED',
        data: {
            id, title
        }
    })

    res.status(201).send(posts[id])
})

app.post('/events', (req, res) => {
    console.log(`Recieved Event `, req.body)
    res.send({status: 'OK'})
})

app.listen(4000, () => {
    console.log(`Listening on port 4000`)
})