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
#### Status Codes for Errors
```js
  . 400 Bad Request
  . 401 Unauthorized
  . 404 Not Found
  . 500 Server Error
```
### API Documentation

Flair Server generates API Documentation with Swagger

```js
const swaggerUI = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
```
### To Get the API Documentation

```sh
npm start
```
*Note API Documentation is not available on Production mode

*When the serever is up and running

** Open your Browser and visit http://localhost:3003/api-docs/

![Image of API Documentation](https://i.imgur.com/GfURuRd.png)
### `expressWebService( [options] )`

Create and return a middleware for serving webservice endpoints, customisable.
### Examples

API creation example:

In app.js file
```JS
const customRouter = require('./routes/V2/customRouter');
const app = express()


// mount on a sub-path
app.use("/example", customRouter);

```
In router
```JS
const express = require('express');
const { customFindAll, customGetById } = require('../../controllers/custom');
const { findQuery, getQuery } = require('../../middlewares/parseQuery');
const Model = require('../../models/model')

const router = express.Router();

router.get('/', findQuery(Model) customFindAll);
router.get('/:id', getQuery(Model) customGetById);

module.exports = router;
```
In controller
```JS
const customFindAll = asyncHandler(async (req, res) => {
  res.status(200).json({
    ...req.Bobby
  });
});

const customGetById = asyncHandler(async (req, res) => {
  res.status(200).json({
    ...req.Bobby,
  });
});

module.exports = { customFindAll, customGetById };
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