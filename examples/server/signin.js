const { createPhpwd } = require('../../lib')
const { req } = require('./req')

/**
 * Get user name and password from process params
 */
const uname = process.argv[2]
const pass = process.argv[3]

/**
 * Prepare phpwd
 */
const phpwd = createPhpwd()

/**
 * Get signin data by username
 * @param {*} uname 
 * @returns { salt, index, minDecrement, saltUpdate?, indexUpdate? }
 */
const getData = async uname => {
  console.log(`Fetching auth data for: ${uname}.`)
  const data = await req('/authdata', { uname })
  return JSON.parse(data)
}

/**
 * Sigin with the token
 * @param {*} data - { unmae, token }
 * @returns server response
 */
const signin = async data => {
  console.log(`Signinin as ${data.uname}.`)
  const res = await req('/signin', data)
  return res
}

const start = async () => {
  /**
   * Get data we need to sign in
   */
  const data = await getData(uname)
  const { salt, index, minDecrement, saltUpdate, indexUpdate } = data
  console.log(`Got auth data.`)
  console.dir(data)

  /**
   * Generate phpwd
   */
  const token = await phpwd.generate({ pass, index: index - minDecrement, salt })
  const cred = { uname, token }

  /**
   * If we have salt update from server,
   * generate tokenUpdate with the new given salt.
   */
  if (saltUpdate) {
    const payload = {
      pass,
      index: indexUpdate,
      salt: saltUpdate
    }
    const tokenUpdate = await phpwd.generate(payload)
    Object.assign(cred, { tokenUpdate })
  }

  /**
   * Send data to the server
   */
  const resp = await signin(cred)
  console.log(`Signup result: ${resp}`)
}

start().catch(console.log)
