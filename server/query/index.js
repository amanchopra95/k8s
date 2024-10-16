import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";

const posts = {}

const app = express()
app.use(bodyParser.json())
app.use(cors())

const handleEvent = (type, data) => {
    if (type === "POSTCREATED") {
        const { id, title } = data
        posts[id] = { id, title, comments: [] }
    } 
    
    if (type === "COMMENTCREATED") {

        const { postId, id, content, status } = data
        const post = posts[postId]
        if (post) {
            post.comments.push({ id, content, status })
        }
    }

    if (type === "CommentUpdated") {
        const { postId, id, content, status } = data
        const post = posts[postId]
        if (post) {
            const comment = post.comments.find(comment => comment.id === id)
            comment.status = status
            comment.content = content
        }
    }
}

app.get('/posts', (req, res) => {
    res.send(posts)
})

app.post('/events', (req,res) => {
    const { type, data } = req.body

    handleEvent(type, data);

    res.send({})
})

app.listen(4002, async () => {
    console.log('Listening on PORT 4002')

    const res = await axios.get('http://event-bus-srv:4005/events')

    for (let event of res.data) {
        console.log("Processing event ", event.type)

        handleEvent(event.type, event.data)
    }
    

})