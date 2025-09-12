const mongoose= require('mongoose')
const NewsSchema= new mongoose.Schema({

  email: {
    type: String,
    required: true,
     unique: true,
  }

}, {
  timestamps: true 
}

)

const NewsLetter = mongoose.model('NewsLetter',NewsSchema)

module.exports=NewsLetter;