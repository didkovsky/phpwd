'use strict'
const { randomFill } = require('node:crypto')
const assert = require('node:assert/strict')
const { derive } = require('./phpwd')

/**
 * Convert function with callback interface to async function
 * @param fn - function with callback interface
 * @returns promisified function
 */
const promisify = (fn) => {
  return (...params) => {
    return new Promise((resolve, reject) => {
      const callback = (error, data) => {
        error ? reject(error) : resolve(data)
      }
      fn(...params, callback)
    })
  }
}

/**
 * Promisified ramdom fill
 */
const randomFillAsync = promisify(randomFill)

/**
 * Create random Buffer
 * @param {*} bytes - number of bytes to generate
 * @returns salt as base64 string
 */
const getSalt = async bytes => {
  const salt = Buffer.allocUnsafe(bytes)
  await randomFillAsync(salt)
  return salt.toString('base64')
}

/**
 * Out example:
 * {
    alg: 'sha256',
    salt: 'AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE=',
    hash: 'LI2G9FpT4P6DwTcZbXH94AwNmZaaUOGILJc7mprQmf0=',
    index: 100000
  }
 */

/**
 * Generate phpwd json, from password
 * @param {*} payload - { alg, salt, password, index }
 * @returns phpwd json: { alg, salt, hash, index }
 */
const generate = async payload => {
  const { alg, salt, password, index } = payload
  assert(index >= 10000, 'Index to small.') 
  const sBuff = Buffer.from(salt, 'base64')
  const iBuff = Buffer.from(password, 'utf8')
  const hBuff = await derive(alg, sBuff, iBuff, index)
  const hash = hBuff.toString('base64')
  return { alg, salt, hash, index }
}

/**
 * Validate phpwd by target phpwd
 * @param {*} input - input we want to validate { alg, salt, hash, index }
 * @param {*} target - our target phpwd { alg, salt, hash, index }
 * @returns true or will throw an Error
 */
const validate = async (input, target) => {
  const { alg, salt, hash, index } = target
  assert(input.alg === alg, 'Invalid algorithm.')
  assert(input.index > 10000, 'Index to small.')
  assert(input.index < index, 'Reject by index.')
  assert(input.salt === salt, 'Invalid salt.')
  const iterations = index - input.index
  const sBuff = Buffer.from(salt, 'base64')
  const iBuff = Buffer.from(input.hash, 'base64')
  const dBuff = await derive(alg, sBuff, iBuff, iterations)
  const derived = dBuff.toString('base64')
  assert(derived === hash, 'Invalid phpwd.')
  return true
}

module.exports = { promisify, getSalt, generate, validate }
