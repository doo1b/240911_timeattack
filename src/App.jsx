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

  console.log(newPost);

  const handleInputChange = (value, key) => {
    setNewPost({ ...newPost, [key]: value });
  };

  const getPosts = async () => {
    const { data } = await axios.get("http://localhost:4000/posts ");
    return data;
  };

  const addPosts = async (post) => {
    await axios.post("http://localhost:4000/posts", post);
  };

  const {
    data: posts,
    isPending: postsPending,
    isError: postsError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  const { mutate } = useMutation({
    mutationFn: (newPost) => addPosts(newPost),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });

  if (postsError) return <p>오류가 발생하였습니다...</p>;
  if (postsPending) return <p>로딩중입니다...</p>;

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault(), mutate(newPost);
        }}
      >
        <input
          type="text"
          placeholder="title"
          onChange={(e) => handleInputChange(e.target.value, "title")}
        ></input>
        <input
          type="number"
          placeholder="views"
          onChange={(e) => handleInputChange(e.target.value, "views")}
        ></input>
        <button type="submit">추가</button>
      </form>
      <div>
        {posts?.map((post) => (
          <div key={post.id}>
            <p>{post.title}</p>
            <p>{post.views}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
