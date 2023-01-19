const { createServer } = require('node:http')
const assert = require('node:assert/strict')
const { createPhpwd } = require('../../lib')

/**
 * Setup phpwd
 */
const phpwd = createPhpwd({ maxIndex: 100000, updateIndex: 99997 })

/**
 * Simulate a users db, we store tokens in this Map
 */
const users = new Map()

/**
 * URLs
 */
const routes = new Map()

/**
 * Signup new user
 */
routes.set('/signup', async params => {
  const { uname, token } = params
  assert(!users.has(uname), 'User already exist.')

  /**
   * Check is the initial token valid
   */
  phpwd.validateInitial(token)

  /**
   * Add the user to Map
   */
  users.set(uname, token)

  /**
   * Response
   */
  const msg = `${uname} signed up.`
  console.log(msg)
  console.dir({ uname, token })
  return msg
})

/**
 * Signin
 */
routes.set('/signin', async params => {
  const { uname, token, tokenUpdate } = params
  assert(users.has(uname), 'User does not exist.')

  /**
   * Get prev token from Map and virifying new token
   */
  const target = users.get(uname)
  await phpwd.validate(token, target)

  /**
   * If the user sent the tokenUpdate (the token with new salt or new password)
   * we replace the token in the Map for this value.
   */
  if (tokenUpdate) {
    phpwd.validateInitial(tokenUpdate)
    users.set(uname, tokenUpdate)
  } else users.set(uname, token)

  /**
   * Response
   */
  const msg = `${uname} signed in.`
  console.log(msg)
  console.dir(params)
  return msg
})

routes.set('/authdata', async params => {
  const { uname } = params
  console.log(`${uname} requested auth data.`)
  assert(users.has(uname), 'User does not exist.')

  /**
   * Get authentification data by token from the Map
   * and send it to the user.
   */
  const target = users.get(uname)
  const data = await phpwd.getAuthData(target)
  console.dir(data)
  return JSON.stringify(data)
})

routes.set('/signupdata', async () => {
  console.log('someone requested signup data.')

  /**
   * Get initial data for the user who want to signup.
   */
  const data = await phpwd.getInitialData()
  console.dir(data)
  return JSON.stringify(data)
})

/**
 * Simple http server.
 */
createServer(async (req, res) => {
  const method = req.url
  if (!routes.has(method)) {
    res.writeHead(404)
    res.end('Wrong path.')
    return
  }

  const chunks = []
  req.on('data', chunk => {
    if (chunk) chunks.push(chunk)
  })

  req.on('end', async () => {
    let params = {}
    if (chunks.length !== 0) {
      const buff = Buffer.concat(chunks)
      params = JSON.parse(buff.toString('utf8'))
    }
    const route = routes.get(method)
    try {
      const result = await route(params)
      res.writeHead(200)
      res.end(result)
      return
    } catch (error) {
      res.writeHead(500)
      res.end(error.message)
      return
    }
  })
}).listen(333)
