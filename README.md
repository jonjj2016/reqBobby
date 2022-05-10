# Bobbyjs - Automate CRUD and advanced query API with expressJS  

Create [Express] APIs to serve [founderslair] Web Application.

- [Usage](#usage)
  - [Start](#Start)
  - [Test](#test)
  - [Error Handling](#error-hanfling)
  - [API Documentation](#api-documentation)
  - [Custom Middlewares](#Custom-Middlewares)
  - [Options](#options)
  - [Standart Response](#standart-response)
  - [Examples](#examples)
- [Middlewares](#middlewares)
- [Contributing](#contributing)
- [Contact](#contact)
- [Licence](#licence)

## Usage

### Start

First you need to install the package:

```sh
npm install reqbobby
```

To start the server:

```sh
npm start
```

### Error Handling
In our Server we user centralized Error Handling
```js
const asyncHandler = require('express-async-handler');
```
```js
const controller = asyncHandler(async (req, res) => {
    // Your code
    const condition = 'any';
    const statusCode = 'any'

  if (condition) {
      res.status(stausCode);
      throw new Error('Your Eroor message');
  }
});
```

### Examples

In app.js file
```JS
const express = require('express');
const {CRUD, findQuery, getQuery, authorize, handleErrors} = require('reqbobby');
const db = require('./db');
db();
const {Product, Profile, Shop} = require('./models');

const app = express();
app.use(express.json());

const productPermissions = {
    select: '',
    dontSelect: [{ path: 'author', select: ['password','email'] }],
    populate: [''],
};

const Router = express.Router();
// PROFILE Service
Router.post('/profiles/', CRUD(Profile).create);
Router.get('/profiles/',findQuery(Profile), CRUD().find);
Router.get('/profiles/:id',getQuery(Profile), CRUD().get);
Router.patch('/profiles/:id', CRUD(Profile).patch);
Router.delete('/profiles/:id', CRUD(Profile).remove);

// PRODUCT Service
Router.post('/products/', CRUD(Product).create);
Router.get('/products/', authorize(productPermissions), findQuery(Product), CRUD().find);
Router.get('/products/:id', authorize(productPermissions), getQuery(Product), CRUD().get);
Router.patch('/products/:id', CRUD(Product).patch);
Router.delete('/products/:id', CRUD(Product).remove);

// Shop Service
Router.post('/shops/', CRUD(Shop).create);
Router.get('/shops/',findQuery(Shop), CRUD().find);
Router.get('/shops/:id',getQuery(Shop), CRUD().get);
Router.patch('/shops/:id', CRUD(Shop).patch);
Router.delete('/shops/:id', CRUD(Shop).remove);

app.use(Router);

app.use(handleErrors.notFound)
app.use(handleErrors.errorHandler)
const PORT = process.env.PORT || 4000;

app.listen(PORT,()=>console.log(`App is running on PORT: ${PORT}`));
```
In ./db
```JS
const mongoose = require('mongoose');

module.exports =()=>{
    mongoose.connect('mongodb://localhost:27017/my_bobby_test', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },()=>console.log('DB is running'));
}
```
In ./models
```JS
const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
    {
      email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
        trim: true,
        selsect: false,
      },
      name: {
        type: String,
        trim: true,
      },
      age: {
        type: Number,
      },
    },
    {
      timestamps: true,
    },
  );
  

  const ProducSchema = new mongoose.Schema(
    {
      brand: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      category: {
        type: String,
        enum: ['tech', 'clothes', 'services'],
        default: 'tech',
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true,
      },
      price: {
          type: Number,
          required: true,
      },
      model: {
          type: String,
          required: true,
      }
    },
    {
      timestamps: true,
    },
);
  
const ShopSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      category: {
        type: String,
        enum: ['tech', 'clothes', 'services'],
        default: 'tech',
      },
      manger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true,
      },
      ecosystem: {
          type: String,
          required: true,
      },
      products: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'product',
      }]
    },
    {
      timestamps: true,
    },
  );
  

const Profile = mongoose.model('Profile', ProfileSchema);
const Product = mongoose.model('product', ProducSchema);
const Shop = mongoose.model('shop', ShopSchema);

module.exports = {
    Profile,
    Product,
    Shop,
};

```

More details on how [`## ReqBobby Response`](#middlewares) workes
What is [`Bobby`](#middlewares)

The result will be
```JS
    {
    "status": true,
    "count": 10,
    "pagination": {
        "next": {
            "page": 3,
            "limit": 10
        },
        "prev": {
            "page": 1,
            "limit": 10
        }
    },
    "data": [
        // your data
     ]
    }
```
#### Standart Response
All responses contain STATUS and DATA
```js
{
    status: true,
    data: {
        // your data
    }
}
// Note data can be Array or Object depends on what route you hit

```
Some responses contain more
```js
{
    status: true,
    count: 10,
    pagination: {
        next: {
            page: 3,
            limit: 10
        },
        prev: {
            page: 1,
            limit: 10
        }
    },
    data: [
        // your data
     ]
    }
// Note data can be Array or Object depends on what route you hit

```
  ### Custom Middlewares
```js
const {CRUD, findQuery, getQuery, authorize, handleErrors} = require('reqbobby');
const ProductModel = require('./models)

router.get('/products/:company', (req, res, next) => {
  // your custom logic with query here
  next();
}, findQuery(ProductModel), CRUD().find )
```
### Dependencies
  * No dependencies

## ReqBobby Response
 This is a middleware which takes request Query, Model

 It gives client ability to populate, select, paginate, limit, order and make basic query with the req.query
 example
 https://example_page.to/exaples?select=_id+user&page=2&limit=3&populate=user&limit=3
```JS
    req.Bobby ={
        "status": true,
        "count": 3,
        "pagination": {
          "next": {
             "page": 3,
              "limit": 3
          },
          "prev": {
               "page": 1,
               "limit": 3
           }
         },
    "data": [
        {
            "_id": "6112b1ac8954580004ceae52",
            "user":{"users populated data here"}
        }
    ]
```

#### About (`/__about`)

Bobby is tool to help you create robust APIs with advanced query features,
* Give you tools to make db secure
* Pagination https://exapmle.com?page=2
* Select fields you want to be included in response https://exapmle.com?select=name
* Populate Fields  https://exapmle.com?populate=author
* limit amount of items included in response https://exapmle.com?limit=6
* Query by property https://exapmle.com?name=Joe
* Out of the box you get Error handling
* Authorization toos to controll which fields should be populated and what client can select https://exapmle.com?populate=["author",{"path": ""}]
* Minimize your time on bulding server by having basic CRUD Controllers (get,find,patch,remove,create)

#### Error (`/__error`)

This endpoint simply throws a JavaScript error, and catches all errors at the end.


## Contributing

This module has a full suite of unit tests, and is verified with ESLint. You can use the following commands to check your code before opening a pull request.

```sh
npm test    # run the unit tests and check coverage
```

## Contact

If you have any questions or comments about this module, or need help using it, please visit [#flair-support] or email [Flair Back End Support].

## Licence

This software is published by the Founders Lair under the [MIT licence][license].

[express]: http://expressjs.com/
[license]: http://opensource.org/licenses/MIT
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[Bobby Support]: jon@founderslair.com