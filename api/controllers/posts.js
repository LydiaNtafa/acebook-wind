const Post = require("../models/post");
const TokenGenerator = require("../lib/token_generator");

const PostsController = {
  Index: (req, res) => {
    Post.find((err, posts) => {
      if (err) {
        return res.status(500).json({ error: "Unauthorised" });
      }
      const token = TokenGenerator.jsonwebtoken(req.user_id);
      res.status(200).json({ posts: posts, token: token });
    });
  },
  Create: (req, res) => {
    const post = new Post(req.body);
    post.user_id = req.user_id;
    post.save((err) => {
      if (err) {
        return res.status(500).json({ error: "Unauthorised" });
      }

      const token = TokenGenerator.jsonwebtoken(req.user_id);
      res.status(201).json({ message: "OK", token: token });
    });
  },
  Update: async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.user_id != req.user_id) {
      return res.status(401).json({ error: "Unauthorised" });
    }
    post.message = req.body.message;
    post.save((err) => {
      if (err) {
        return res.status(500).json({ error: "Unauthorised" });
      }
      const token = TokenGenerator.jsonwebtoken(req.user_id);
      res.status(201).json({ message: "OK", token: token, post: post });
    });
  },
  PostComment: async (req, res) => {
    const postId = req.params.id;
    const commentMessage = req.body.comment;

    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      post.comments.push({ user_id: req.user_id, comment: commentMessage });
      await post.save();
      const token = TokenGenerator.jsonwebtoken(req.user_id);
      res
        .status(201)
        .json({ message: "Comment added", token: token, post: post,  });
    } catch (error) {
      return res.status(500).json({ error: "Error adding comment" });
    }
  },
  Get: async (req, res) => {
    const post = await Post.findById(req.params.id).populate("user_id")
    if (!post) {
      return res.status(404).json({error: "Post not found"});
    }
    const token = TokenGenerator.jsonwebtoken(req.user_id);
    const authorId = post.user_id.id;
    const author = post.user_id.username;
    res.status(200).json({ message: post.message, token: token, author: author, authorId: authorId})
  }
}


module.exports = PostsController;
