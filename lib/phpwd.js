'use strict'
const { createHmac } = require('node:crypto')

/**
 * Calc HMAC for a single round
 * @param {*} alg - hash algorithm
 * @param {*} key - HMAC key (our salt)
 * @param {*} input - our password or previous hash
 * @returns HMAC value as Buffer
 */
const hmac = (alg, key, input) => {
  const hmac = createHmac(alg, key)
  hmac.update(input)
  return hmac.digest()
}

/**
 * 
 * Algorithm illustration
 * 
 *           salt      salt      
 *             |         |        
 * input -> [HMAC] -> [HMAC] -> ... -> phpwd
 *         |....... iterations ......|
 * 
 * You can derive the phpwd with a bigger iterations number
 * from the phpwd that has a lover iterations number,
 * but it's hard to do this in reverse from bigger to lover.
 * 
 */

/**
 * Unblocking phpwd derivation.
 * @param {*} alg - hash algorithm
 * @param {*} salt - random bytes
 * @param {*} input - our password or prev phpwd value
 * @param {*} iterations - How many rounds to do (phpwd index)
 * @returns phpwd value as Buffer
 */
const derive = (alg, salt, input, iterations) => {
  return new Promise(resolve => {
    const iter = () => {
      input = hmac(alg, salt, input)
      if (--iterations > 0)
      setImmediate(iter)
      else resolve(input)
    }
    iter()
  })
}

module.exports = { derive }
