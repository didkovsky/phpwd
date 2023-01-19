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
 * Get initial data as salt and index, we need to signup
 * @returns 
 */
const getData = async () => {
  console.log(`Fetching signup data.`)
  const data = await req('/signupdata')
  return JSON.parse(data)
}

/**
 * Signup with new created token
 * @param {*} data { uname, token }
 * @returns 
 */
const signup = async (data) => {
  console.log(`Signinup as ${data.uname}.`)
  const res = await req('/signup', data)
  return res
}

const start = async () => {
  /**
   * Get initial data
   */
  const data = await getData(uname)
  const { maxIndex, salt } = data
  console.log(`Got initial data.`)
  console.dir(data)

  /**
   * Generate phpwd
   */
  const index = maxIndex
  const token = await phpwd.generate({ pass, index, salt })

  /**
   * Signing up
   */
  const resp = await signup({ uname, token })
  console.log(`Signup result: ${resp}`)
}

start().catch(console.log)
