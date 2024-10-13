import mongoose from "mongoose";
const Schema = mongoose.Schema;

const postSchema = mongoose.Schema(
  {
    userId: { type: String, required: true },
    desc: String,
    likes: [],
    comments: [
        {
            usuario: String,
            comment: String
        }
    ],
    image: String,
  },
  {
    timestamps: true,
  }
);

postSchema.methods.setImage = function setImage(image) {
  const {host, port} = require('../config').default;
  this.image = `${host}:${port}/public/${image}`;
};

var PostModel = mongoose.model("Posts", postSchema);
export default PostModel;