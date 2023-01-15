'use strict'
const { randomFill } = require('node:crypto')
const assert = require('node:assert/strict')
const { promisify } = require('node:util')

/**
 * Promisified ramdom fill
 */
const randomFillAsync = promisify(randomFill)

/**
 * Create random Buffer
 * @param {*} bytes - number of bytes to generate
 * @returns Random filled Buffer
 */
const getSalt = async bytes => {
  const salt = Buffer.allocUnsafe(bytes)
  await randomFillAsync(salt)
  return salt
}

/**
 * Allow only 'base64' or 'hex' encode
 * @param {*} enc - encode name
 */
const checkEncode = enc => (
  assert(enc === 'base64' || enc === 'hex', 'Invalid encode.')
)

/**
 * phpwd json example:
 * 
 * {
 *  "alg":"sha256",
 *  "index":100000,
 *  "salt":"pBgbwKOVnSWg81G/H0zY02+wkEQISRp24Xy43kTlvtA=",
 *  "hash":"pBgbwKOVnSWg81G/H0zY02+wkEQISRp24Xy43kTlvtA="
 * }
 * 
 */

/**
 * Parse phpwd json-string
 * @param {*} jsonStr - json (utf8) string
 * @param {*} enc - encode for salt and hash buffers
 * @returns phpwd object: { alg, salt, hash, index }
 */
const parsePhpwdJson = (jsonStr, enc) => {
  checkEncode(enc)
  const phpwd = JSON.parse(jsonStr)
  const { salt, hash } = phpwd
  phpwd.salt = Buffer.from(salt, enc)
  phpwd.hash = Buffer.from(hash, enc)
  return phpwd
}

/**
 * Get json-string from phpwd object
 * @param {*} phpwd - { alg, salt, hash, index }
 * @param {*} enc - encode for salt and hash buffers
 * @returns stringified json
 */
const serializePhpwdJson = (phpwd, enc) => {
  checkEncode(enc)
  const { salt, hash } = phpwd
  phpwd.salt = salt.toString(enc)
  phpwd.hash = hash.toString(enc)
  return JSON.stringify(phpwd)
}

/**
 * phpwd string token example:
 * 
 * 'eyJpbmRleCI6MTAwMDAwLCJhbGciOiJzaGEyNTYifQ==.' +
 * '/GSHhLOf9seA2s56R35loVYJRcq41EYSrC3hKWSS/uM=.' +
 * '/GSHhLOf9seA2s56R35loVYJRcq41EYSrC3hKWSS/uM='
 * 
 * Where:
 * <HEADER>.<SALT>.<HASH> (splited by dots)
 */

/**
 * Parse phpwd string token
 * @param {*} str - string token: <HEADER>.<SALT>.<HASH>
 * @param {*} enc - token encode: base64 or hex
 * @returns phpwd object
 */
const parsePhpwdString = (str, enc) => {
  checkEncode(enc)
  const [ header, salt, hash ] = str.split('.')
  const phpwd = JSON.parse(Buffer.from(header, enc).toString('utf8'))
  Object.assign(phpwd, {
    salt: Buffer.from(salt, enc),
    hash: Buffer.from(hash, enc)
  })
  return phpwd
}

/**
 * Serialize phpwd string token
 * @param {*} phpwd - { alg, salt, hash, index }
 * @param {*} enc - string token encode
 * @returns string token: <HEADER>.<SALT>.<HASH>
 */
const serializePhpwdString = (phpwd, enc) => {
  checkEncode(enc)
  const { index, alg } = phpwd
  const hstr = JSON.stringify({ index, alg })
  const header = Buffer.from(hstr, 'utf8').toString(enc)
  const salt = phpwd.salt.toString(enc)
  const hash = phpwd.hash.toString(enc)
  return `${header}.${salt}.${hash}`
}

/**
 * Is string json or not
 * @param {*} str - string we want to check
 * @returns true if string is json
 */
const isJson = str => str.startsWith('{')

/**
 * Parse phpwd
 * @param {*} phpwd - json string or token string
 * @param {*} enc - encode
 * @returns phpwd object
 */
const parse = (phpwd, enc) => {
  if (isJson(phpwd))
  return parsePhpwdJson(phpwd, enc)
  else return parsePhpwdString(phpwd, enc)
}

module.exports = { getSalt, parsePhpwdJson, serializePhpwdJson,
  parsePhpwdString, serializePhpwdString, parse }
