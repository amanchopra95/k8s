import axios from "axios";
import React, { useEffect, useState } from "react";

const CommentList = ({postId}) => {
    const [comments, setComments] = useState([]);

    const getComments = async () => {
        const resp = await axios.get(`http://localhost:4001/posts/${postId}/comments`);
        setComments(resp.data);
    }

    useEffect(() => {
        getComments();
    }, []);

    const renderedComments = comments.map(comment => {
        return <li key={comment.id}>{comment.comment}</li>
    })

    return <ul>{renderedComments}</ul>
}

export default CommentList;