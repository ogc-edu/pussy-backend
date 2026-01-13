const mongoose = require('mongoose');
const axios = require('axios');

const guestSchema = new mongoose.Schema({
  name:{
    type: String, 
    required: true
  },
  cats: [{
    id: {type: String, required: true},
    liked: {type: Boolean, default: false},
    disliked: {type: Boolean, default: false}
  }]
})

guestSchema.methods.likeCat = function(catId) {
  const cat = this.cats.find((cat) => cat.id === catId);
  if(!cat){
    const error = new Error("Cat not found");
    error.status = 404;
    throw error;
  }
  cat.liked = true;
}

guestSchema.methods.dislikeCat = function(catId){
  const cat = this.cat.find((cat) => cat.id === catId);
  if(!cat){
    const error = new Error("Cat not found", 404);
    throw error;
  }
  cat.disliked = true;
}

guestSchema.statics.generateCats = async function() {
  const cats= await axios.get("https://cataas.com/api/cats/?limit=20&skip=0")
  if(!cats.data|| cats.data.length === 0){
    const error = new Error("No cats found from server");
    error.status = 500; //means internal server error
    throw error;
  }
  const catData = cats.data.map((cat) => {
    return {
      id: cat.id
    }
  })
  return catData;
}

guestSchema.statics.generateGuestName = function() {
  return ("Guest" + Math.floor(Math.random() * 10000).toString);    //return random guest name between Guest0 to Guest10000
}

//implement cookies to save user progress
guestSchema.statics.createGuest = async function(name){
  let guestName = name;
  if (guestName.length === 0){
    guestName = this.generateGuestName();
  }
  const catData = await this.generateCats();
  const guest = await this.create({name: guestName, cats: catData});
  return guest._id;   //return guest id to be saved in cookie
}

guestSchema.methods.deleteCats = function(){
  this.cats = [];
  this.liked = [];
  this.disliked = [];
  return this.save();
}

//user can generate cats after restarting
guestSchema.methods.userGenerateCats = async function(){
  const cats = await this.generateCats();
  this.cats = cats;
  return this.save();
}

module.exports = mongoose.model('Guest', guestSchema);