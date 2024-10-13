import express from "express";
import bodyParser from "body-parser";
import {randomBytes} from "crypto"
import cors from "cors";
import axios from "axios";


const app = express()

app.use(bodyParser.json())
app.use(cors())

const commentsByPostId = {}

app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || [])
})

app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex')
    const id  = req.params.id
    const { content } = req.body

    const comments = commentsByPostId[id] || []

    comments.push({ id: commentId, comment: content, status: 'pending' })

    commentsByPostId[id] = comments

    await axios.post('http://localhost:4005/events', {
        type: 'COMMENTCREATED',
        data: {
            postId: id,
            id: commentId,
            content,
            status: 'pending'
        }
    })

    res.status(201).json({
        ...commentsByPostId[id]
    })

})

app.post('/events', async (req, res) => {
    console.log(`Recieved Event `, req.body)

    const { type, data } = req.body

    if (type === "CommentModerated") {

        const { postId, id, status } = data

        const comments = commentsByPostId[postId]

        const comment = comments.find(comment => comment.id === id)

        comment.status = status



        await axios.post('http://localhost:4005/events', {
            type: 'CommentUpdated',
            data: {
                id,
                postId,
                status,
                content: data.content
            }
        })
    }

    res.send({status: 'OK'})
})

app.listen(4001, () => {
    console.log('Listening on Port 4001')
})

