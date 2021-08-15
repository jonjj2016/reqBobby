# FOUNDERS LAIR Express Web Service

Create [Express] APIs to serve [founderslair] Web Application.

- [Usage](#usage)
  - [Start](#Start)
  - [Test](#test)
  - [Error Handling](#error-hanfling)
  - [API Documentation](#api-documentation)
  - [Options](#options)
  - [Standart Response](#standart-response)
  - [Examples](#examples)
  - [DB structure](#db-structure)
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

More details on how [`parseQuery`](#middlewares) workes
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
### Dependencies
  * No dependencies

## ParseQuery
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

### DB structure

![Image of DB structure](https://i.imgur.com/OPQ0t1R.png)
#### About (`/__about`)

[Founders Lair][founderslair], or FLair, is a free peer to peer platform for founders & startup enthusiasts, which strives to help entrepreneurs find faster the resources they need. Founders Lair is like a secret platform, a hideout that you can only enter and contribute to if you are a part of the startup ecosystem.

Anybody traveling to another startup ecosystem, anyone interested in starting their business or navigating in their own city relies on insights of who they can trust. Having access to reliable information about startup ecosystems is however something most do not have. Finding trustworthy partners is a time intensive and tiring process. This is why we started Founders Lair.

#### Error (`/__error`)

This endpoint simply throws a JavaScript error, and makes no attempt to handle it. This is useful for testing the way that your application handles runtime errors in prod, both in terms of reporting them (eg to a logging or aggregation tool) and presenting an appropriate UI to the end user.

## Contributing

This module has a full suite of unit tests, and is verified with ESLint. You can use the following commands to check your code before opening a pull request.

```sh
npm test    # run the unit tests and check coverage
```

## Contact

If you have any questions or comments about this module, or need help using it, please visit [#flair-support] or email [Flair Back End Support].

## Licence

This software is published by the Founders Lair under the [MIT licence][license].

[#flair-support]: https://founderslair.com/about
[express]: http://expressjs.com/
[license]: http://opensource.org/licenses/MIT
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[Flair Back End Support]: jon@founderslair.com
[founderslair]: https://founderslair.com/