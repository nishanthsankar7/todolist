//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ =require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://m001-student:Ethanhunt007@cluster0.cyjzp.mongodb.net/todolistdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String
}

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const Item = mongoose.model('Item', itemsSchema);
const List = mongoose.model('List', listSchema);

const item1 = new Item({
  name: 'Panda1'
})

const item2 = new Item({
  name: 'Panda2'
})

const item3 = new Item({
  name: 'Panda3'
})
defaultItems = [item1, item2, item3]


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {

      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err)
        } else {
          console.log('Success')
        }
        res.redirect('/')
      })
    } else {
      res.render("list", {
        listTitle: 'Today',
        newListItems: foundItems
      });
    }

  })
});

app.get('/:customListName',function(req,res){
  customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
          name:customListName,
          items: defaultItems
        })
        list.save()
        res.redirect('/' + customListName)
      }else{
        res.render('list', {
          listTitle: foundlist.name,
          newListItems: foundlist.items
        })
      }
    }
  })


})


app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

const item = new Item({
  name: itemName
})
if(listName === "Today"){
  item.save()
  res.redirect('/')
}else{
  List.findOne({name:listName},function(err,foundlist){
    foundlist.items.push(item)
    foundlist.save()
    res.redirect('/'+ listName)
  })
}
});

app.post('/delete',function(req,res){
  const checkedID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === 'Today'){
    Item.findByIdAndRemove(checkedID,function(err){
      if(!err){
        console.log('Successfully Deleted item!');
        res.redirect('/')
      }
    })
  }else{
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedID}}},function(err,foundlist){
      res.redirect('/' + listName)
    })
  }

})

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started.");
});
