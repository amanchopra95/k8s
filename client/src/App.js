import './App.css';
import PostCreate from './components/Posts/PostCreate';
import PostList from './components/Posts/PostList';

function App() {
  return (
    <div className="App-header">
      <h1>Blog</h1>
      <div className='container my-4'>
        <h2>Create Post</h2>
        <PostCreate/>
      </div>
      <div className='container my-4'>
        <PostList/>
      </div>
    </div>
  );
}

export default App;
