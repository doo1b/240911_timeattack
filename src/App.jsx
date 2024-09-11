import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "./App.css";
import axios from "axios";
import { useState } from "react";

function App() {
  const queryClient = useQueryClient();

  const [newPost, setNewPost] = useState({
    title: "",
    views: "",
  });

  const [newComment, setNewComment] = useState({
    text: "",
    postId: "",
  });

  const [selectedPostId, setSelectedPostId] = useState(null);

  const handlePostInputChange = (value, key) => {
    setNewPost({ ...newPost, [key]: value });
  };

  const handleCommentInputChange = (value) => {
    setNewComment({ ...newComment, text: value });
  };

  const getPosts = async () => {
    const { data } = await axios.get("http://localhost:4000/posts ");
    return data;
  };

  const getProfile = async () => {
    const { data } = await axios.get("http://localhost:4000/profile");
    return data;
  };

  const getComment = async (postId) => {
    const { data } = await axios.get(
      `http://localhost:4000/comments?postId=${postId}`
    );
    return data;
  };

  const addPosts = async (post) => {
    await axios.post("http://localhost:4000/posts", post);
  };

  const addComment = async (comment) => {
    await axios.post("http://localhost:4000/comments", comment);
  };

  const {
    data: posts,
    isLoading: postsLoading,
    isError: postsError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const {
    data: comments,
    refetch,
    isLoading: commentsLoading,
  } = useQuery({
    queryKey: ["comment", selectedPostId],
    queryFn: ({ queryKey }) => getComment(queryKey[1]),
    enabled: !!selectedPostId,
  });

  const { mutate: handleAddPost } = useMutation({
    mutationFn: (newPost) => addPosts(newPost),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });

  const { mutate: handleAddComment } = useMutation({
    mutationFn: (newComment) => addComment(newComment),
    onSuccess: () => {
      queryClient.invalidateQueries(["comment"]);
    },
  });

  if (postsError || profileError) return <p>오류가 발생하였습니다...</p>;
  if (postsLoading || profileLoading || commentsLoading)
    return <p>로딩중입니다...</p>;

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault(), handleAddPost(newPost);
        }}
      >
        <input
          type="text"
          placeholder="title"
          value={newPost.title}
          onChange={(e) => handlePostInputChange(e.target.value, "title")}
        ></input>
        <input
          type="number"
          placeholder="views"
          value={newPost.views}
          onChange={(e) => handlePostInputChange(e.target.value, "views")}
        ></input>
        <button type="submit">추가</button>
      </form>
      <div>
        {posts.map((post) => (
          <div key={post.id}>
            <p>{post.title}</p>
            <p>{post.views}</p>
            <button
              onClick={() => {
                refetch();
                setSelectedPostId(post.id);
              }}
            >
              댓글보기
            </button>
            {selectedPostId === post.id && (
              <div>
                {comments.map((comment) => (
                  <div key={comment.id}>
                    <p>{comment.text}</p>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddComment({ ...newComment, postId: post.id });
              }}
            >
              <input
                type="text"
                onChange={(e) => handleCommentInputChange(e.target.value)}
              />
              <button type="submit">댓글작성</button>
            </form>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
