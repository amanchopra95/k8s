import express from "express";
import axios from "axios";

const app = express()
app.use(express.json())

app.post('/events', async (req, res) => {
    const {type, data} = req.body;
    console.log("Event Received", type);
    if (type === 'COMMENTCREATED') {
        const status = data.content.includes('orange') ? 'rejected' : 'approved'

        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentModerated',
            data: {
                id: data.id,
                postId: data.postId,
                status,
                content: data.content
            }
        })
    }
})

app.listen(4003, function() {
    console.log('Listening on Port 4003')
})