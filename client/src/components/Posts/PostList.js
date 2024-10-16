import axios from "axios";
import React, { useEffect, useState } from "react"
import CommentCreate from "../Comments/CommentCreate";
import CommentList from "../Comments/CommentList";

const PostList = () => {
    const [posts, setPosts] = useState({});

    const getPosts = async () => {
        const res = await axios.get("http://posts.com/posts");
        setPosts(res.data);
    }

    useEffect(() => {
        getPosts();
    }, []);

    const renderedPosts = Object.values(posts).map((post) => {
        return (
            <div className="col" key={post.id}>
                <div className="card">
                    <div className="card-body">
                        <h3>{post.title}</h3>
                        <CommentList comments={post.comments}/>
                        <CommentCreate postId={post.id}/>
                    </div>
                </div>
            </div>
        )
    })

    return <div className="row justify-content-between">
        {renderedPosts}
    </div>
}

export default PostList;