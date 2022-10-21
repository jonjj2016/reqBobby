const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

const helper = (perm, query, next) => {
  let newReq = query
  // checking if query has select
  if (perm.select && query.select) {
    const filtered = []
    // if has looping trough to se do we have match with restricted fields
    query.select.split(' ').forEach((i) => {
      if (!perm.select.includes(i)) {
        filtered.push(i)
      }
    })
    // than resetting filtered select field
    query.select = filtered.join(' ')
  }
  // checking if no select and we have restrictions, we need to remove some fields by setting select
  if (perm.select && !query.select) {
    const filtered = []
    perm.select.split(' ').forEach((i) => {
      filtered.push(`-${i}`)
    })
    query.select = filtered.join(' ')
  }
  // checking for restrictions on populate
  if (perm.populate.length && query.populate) {
    const filtered = []
    // checking if populate field in query is an Array
    if (Array.isArray(query.populate)) {
      query.populate = query.populate.map((item) => {
        if (typeof item === 'object') {
          if (!perm.populate.includes(item.path)) {
            if (perm.dontSelect) {
              perm.dontSelect.forEach((dont) => {
                if (dont.path === item.path) {
                  if (item.select) {
                    item.select = item.select
                      .split(' ')
                      .map((i) => {
                        if (dont.select.includes(i)) {
                          return ''
                        }
                        return i
                      })
                      .join(' ')
                  }
                  if (!item.select) {
                    item.select = dont.select.map((i) => `-${i}`)
                  }
                  // ensuring user cant go dipper than 2 layers of nested population
                  if (item.populate && item.populate.populate) {
                    // eslint-disable-next-line no-param-reassign
                    item.populate.populate = ''
                  }
                }
              })
            }
            filtered.push(item)
          }
          return ''
        }
        if (typeof item === 'string' && perm.dontSelect) {
          // check if item is matching with perm dontSelect path
          if (perm.populate) {
            if (perm.populate.includes(item)) {
              item = ''
            }
          }
          perm.dontSelect.forEach((dont) => {
            if (dont.path === item) {
              item = { path: item, select: dont.select.map((i) => `-${i}`) }
            }
          })
        }
        if (!perm.populate.includes(item)) {
          filtered.push(item)
        }
        return ''
      })
      newReq.populate = filtered
    }
    if (typeof query.populate === 'string') {
      //   query.populate = query.populate.split(' ').filter((field) => !perm.populate.includes(field)).join(' ');
      query.populate = ''
      return next()
    }
    if (typeof query.populate === 'object' && !Array.isArray(query.populate)) {
      // perm.populate.forEach( (restricted) => {
      //   if (query.populate.path === restricted) {
      //     query.populate = '';
      //   }
      // })
      query.populate = ''
      return next()
    }
  }
  return next()
}

const findQuery = (model, populate) =>
  asyncHandler(async (req, res, next) => {
    let query
    // req.query.deleted = false;
    // Copy req.query
    const reqQuery = { ...req.query }
    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'limit', 'page', 'populate']
    // loop over removeFields and delet them from reqQuery
    removeFields.forEach((item) => delete reqQuery[item])
    // Create Query string
    let queryStr = JSON.stringify(reqQuery)

    queryStr = queryStr.replace(
      /\b(or|gte|gt|lte|lt|ne|and|eq|not)\b/g,
      (match) => `$${match}`,
    )
    // Finding resources
    query = model.find(JSON.parse(queryStr))
    // Finding resources

    // Select fields
    if (req.query.select) {
      const fields = req.query.select
      query = query.select(fields)
    }
    // Sort fields
    if (req.query.sort) {
      const sortBy = req.query.sort
      query = query.sort(sortBy)
    }
    // Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await model.countDocuments(JSON.parse(queryStr))
    query.skip(startIndex).limit(limit)
    if (populate) {
      query = query.populate(populate)
    }
    if (req.query.populate) {
      query = query.populate(req.query.populate)
    }
    // Executing query
    const items = await query
    // Pagination result
    const pagination = {}
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      }
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      }
    }
    const data = {
      status: true,
      count: items.length,
      pagination,
      data: items,
    }
    if (req.extraData) {
      req.Bobby = { ...req.extraData, ...data }
    } else {
      req.Bobby = data
    }

    return next()
  })

const getQuery = (model, populate) =>
  asyncHandler(async (req, res, next) => {
    let query

    if (req.params.id) {
      query = model.findById(req.params.id)
    }
    if (req.params.slug) {
      query = model.findOne({ slug: req.params.slug })
    }
    // Select fields
    if (req.query.populate) {
      const fields = req.query.populate
      query = query.populate(fields)
    }
    if (populate) {
      query = query.populate(populate)
    }
    if (req.body.populate) {
      query = query.populate(req.body.populate)
    }
    if (req.query.select) {
      const fields = req.query.select
      query = query.select(fields)
    }
    // Executing query
    const item = await query
    if (!item) {
      res.status(404)
      throw new Error(`Couldn't find the item with an id : ${req.params.id}`)
    }
    req.Bobby = {
      status: true,
      data: item,
    }
    next()
  })

const CRUD = (Model) => {
  const find = asyncHandler(async (req, res) => {
    res.status(200).json({
      ...req.Bobby,
    })
  })
  const get = asyncHandler(async (req, res) => {
    res.status(200).json({
      ...req.Bobby,
    })
  })
  const patch = asyncHandler(async (req, res) => {
    const { id } = req.params
    const item = await Model.findById(id)
    if (!item) {
      res.status(400)
      throw new Error(`[Bobby] Cant Get item with an ID: ${id}`)
    }
    const updatedItem = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
    })
    if (!updatedItem) {
      res.status(400)
      throw new Error(`[Bobby] Cant Update item with an ID: ${id}`)
    }
    res.status(200).json({
      status: true,
      data: updatedItem,
    })
  })
  const create = asyncHandler(async (req, res) => {
    const item = await Model.create(req.body)
    if (!item) {
      res.status(400)
      throw new Error('[Bobby] Cant Create item')
    }
    res.status(200).json({
      status: true,
      data: item,
    })
  })
  const remove = asyncHandler(async (req, res) => {
    const { id } = req.params
    const item = await Model.findById(id)
    if (!item) {
      res.status(400)
      throw new Error(`[Bobby] Cant Get item with an ID: ${id}`)
    }
    const deleteItem = await Model.findByIdAndRemove(id)
    if (!deleteItem) {
      res.status(400)
      throw new Error(`[Bobby] Cant Update item with an ID: ${id}`)
    }
    res.status(204)
  })
  return {
    find,
    get,
    patch,
    create,
    remove,
  }
}

const clearQuery = (fields) => (req, res, next) => {
  const reqQuery = { ...req.query }
  fields.forEach((item) => delete reqQuery[item])
  req.query = reqQuery
  return next()
}

const authorize = (permissions) =>
  asyncHandler(async (req, res, next) => {
    let isObject = false
    if (
      req.query.populate &&
      (req.query.populate.includes('}') || req.query.populate.includes(']'))
    ) {
      isObject = true
    }
    if (isObject && JSON.parse(req.query.populate)) {
      req.query.populate = JSON.parse(req.query.populate)
    }

    helper(permissions, req.query, next)
    return
  })

const handleErrors = {
  notFound: (req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`)
    res.status(404)
    next(error)
  },
  errorHandler: (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode)
    res.json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    })
    next()
  },
}

module.exports = {
  authorize,
  getQuery,
  findQuery,
  clearQuery,
  CRUD,
  handleErrors,
  asyncHandler,
}
