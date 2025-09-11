import mongoose, {model, Schema} from "mongoose"

mongoose.connect("mongodb+srv://kartikchaudhari246:kartikmongo2607@cluster0.csgllht.mongodb.net/Second-Brain")
const UserSchema = new Schema({
    username : {type: String, unique : true},
    password : String
})

const tagSchema = new Schema({
    tag : {type : String, required : true, unique: true}
})

const ContentSchema = new Schema({
    link: String,
    type: String,
    title: String,
    tags: [{type: Schema.Types.ObjectId, ref: "tags"}],
    userId: {type : Schema.Types.ObjectId, ref : "users", required: true}
})

export const UserModel = model("users", UserSchema)
export const ContentModel = model("content", ContentSchema)
export const TagModel = model("tags", tagSchema)

