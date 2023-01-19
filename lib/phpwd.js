'use strict'
const { getSalt, parse, serializePhpwdJson, serializePhpwdString } = require('./utils')
const { derive } = require('./derive')
const assert = require('node:assert/strict')

class Phpwd { 

  /**
   * Phpwd constructor
   * @param {*} options - { alg, minIndex, maxIndex, saltSize, minDecrement, encode }
   * 
   * alg - hash algorithm name (default: sha256); 
   * minIndex - minimal index for phpwd (default: 20000); 
   * maxIndex - maximum index for phpwd (default: 200000); 
   * updateIndex - index when we should update salt (default: 50000); 
   * saltSize - salt size in bytes (default: 32); 
   * minDecrement - minimal value the phpwd index should be decremented for
   * each authentification; 
   * encode - encode for serialized token (default: base64);
   */
  constructor(options) {
    options = options || {}
    const { alg, minIndex, maxIndex, updateIndex,
      saltSize, minDecrement, encode } = options
    this.alg = alg || 'sha256'
    this.minIndex = minIndex || 20000
    this.maxIndex = maxIndex || 200000
    this.updateIndex = updateIndex || 50000
    this.saltSize = saltSize || 32
    this.minDecrement = minDecrement || 1
    this.encode = encode || 'base64'
    assert(this.encode === 'base64' || encode === 'hex', 'Unsupported encode.')
  }

  /**
   * Generate random salt encoded with 'encode'
   * defined in current instance. Default: base64
   * @returns Random salt string.
   */
  async generateSalt() {
    const { saltSize, encode } = this
    const salt = await getSalt(saltSize)
    return salt.toString(encode)
  }

  /**
   * Parse token string or json string.
   * @param {*} input - token string or json string
   * @returns phpwd as { alg, salt, hash, index }
   */
  parse(input) {
    const { alg, saltSize, maxIndex, minIndex, encode } = this
    const phpwd = typeof input === 'object' ? input : parse(input, encode)
    const { index, salt, hash } = phpwd
    assert(hash, 'Hash is required.')
    assert(phpwd.alg === alg, 'Invalid hash algorithm.')
    assert(index <= maxIndex && index > minIndex, 'Invalid index.')
    assert(salt.length === saltSize, 'Invalid salt size.')
    return phpwd
  }

  /**
   * Validate initial phpwd when the user registering.
   * The initial index should equals the maxIndex.
   * @param {*} input - json string, token string, or phpwd obj
   * @returns true if the token valid, or will throw.
   */
  validateInitial(input) {
    const { index } = this.parse(input)
    const { maxIndex } = this
    assert(index === maxIndex, 'Initial index should be same as maxIndex.')
    return true
  }

  /**
   * Get params we need to generate initial phpwd
   * @returns { minIndex, maxIndex, updateIndex, minDecrement, salt }
   */
  async getInitialData() {
    const { minIndex, maxIndex, minDecrement, updateIndex } = this
    const salt = await this.generateSalt()
    return { minIndex, maxIndex, updateIndex, minDecrement, salt }
  }

  /**
   * Get salt and index from the target input,
   * if the index equals or lower than updateIndex
   * we will put the new salt and reset index to max value.
   * @param {*} input 
   * @returns { salt, index, minIndex, maxIndex,
   * minDecrement, saltUpdate?, indexUpdate? }
   */
  async getAuthData(input) {
    const { updateIndex, minIndex, maxIndex, minDecrement, encode } = this
    const { index, salt } = this.parse(input)
    const data = { index, salt: salt.toString(encode),
      minIndex, maxIndex, minDecrement }
    if (index <= updateIndex) {
      const saltUpdate = await this.generateSalt()
      const indexUpdate = maxIndex
      Object.assign(data, { saltUpdate, indexUpdate })
    }
    return data
  }

  /**
   * My cat wrote this, let's leave it here:
   * ewkl11 ds bewk[]',
   */

  /**
   * Generate new phpwd from password
   * @param {*} payload - { pass, index, salt, json } 
   * pass - password (utf8 string); 
   * index - phpwd index; 
   * salt - salt string encoded with 'encode'; 
   * defined in current instance; 
   * json - flag, if it's true method will return json string,
   * if it is 'false' or not defined, method will return token string;
   * @returns json or token string
   */
  async generate(payload) {
    const { encode, alg } = this
    const { pass, index, salt, json } = payload
    const saltBuff = Buffer.from(salt, encode)
    const passBuff = Buffer.from(pass, 'utf8')
    const hash = await derive(alg, saltBuff, passBuff, index)
    const phpwd = { hash, salt, index, alg }
    if (json) return serializePhpwdJson(phpwd, encode)
    else return serializePhpwdString(phpwd, encode)
  }

  /**
   * Validate input by target
   * @param {*} input - input phpwd. Can be json or token string.
   * @param {*} target - target phpwd. Can be json or token string.
   * @returns true if input valid, if not - will throw the error.
   */
  async validate(input, target) {
    const { alg, minDecrement } = this
    const iPhpwd = this.parse(input)
    const tPhpwd = this.parse(target)
    const { salt, index, hash } = tPhpwd
    const sameSalt = Buffer.compare(salt, iPhpwd.salt)
    assert(sameSalt === 0, 'Invalid salt value.')
    assert(index - iPhpwd.index >= minDecrement, 'Reject by index.')
    const iterations = tPhpwd.index - iPhpwd.index
    const derived = await derive(alg, salt, iPhpwd.hash, iterations)
    const result = Buffer.compare(hash, derived)
    assert(result === 0, 'Invalid phpwd.')
    return true
  }
}

/**
 * Use this as default factory
 * @param {*} options - { alg, minIndex, maxIndex, saltSize, minDecrement, encode }
 * 
 * alg - hash algorithm name (default: sha256); 
 * minIndex - minimal index for phpwd (default: 20000); 
 * maxIndex - maximum index for phpwd (default: 200000); 
 * updateIndex - index when we should update salt (default: 50000); 
 * saltSize - salt size in bytes (default: 32); 
 * minDecrement - minimal value the phpwd index should be decremented for
 * each authentification; 
 * encode - encode for serialized token (default: base64);
 * @returns Phpwd instance
 */
const createPhpwd = options => new Phpwd(options)

module.exports = { Phpwd, createPhpwd }
