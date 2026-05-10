(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.phpwd = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict'

  const assert = (condition, message) => {
    if (!condition) throw new Error(message || 'Assertion failed.')
  }

  const checkEncode = enc => (
    assert(enc === 'base64' || enc === 'hex', 'Invalid encode.')
  )

  const getCrypto = () => {
    const crypto = globalThis.crypto || globalThis.msCrypto
    assert(crypto && crypto.subtle, 'Web Crypto API is required.')
    return crypto
  }

  const getRandomValues = bytes => {
    const crypto = getCrypto()
    const salt = new Uint8Array(bytes)
    crypto.getRandomValues(salt)
    return salt
  }

  const toUint8 = input => {
    if (input instanceof Uint8Array) return input
    if (input instanceof ArrayBuffer) return new Uint8Array(input)
    if (ArrayBuffer.isView(input)) {
      return new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
    }
    return new Uint8Array(input)
  }

  const utf8ToBytes = str => new TextEncoder().encode(str)
  const bytesToUtf8 = bytes => new TextDecoder().decode(bytes)

  const bytesToHex = bytes => Array.from(toUint8(bytes), byte => (
    byte.toString(16).padStart(2, '0')
  )).join('')

  const hexToBytes = str => {
    assert(str.length % 2 === 0, 'Invalid hex string.')
    const bytes = new Uint8Array(str.length / 2)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(str.slice(i * 2, i * 2 + 2), 16)
    }
    return bytes
  }

  const bytesToBase64 = bytes => {
    bytes = toUint8(bytes)
    let binary = ''
    const chunk = 0x8000
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
    }
    return btoa(binary)
  }

  const base64ToBytes = str => {
    const binary = atob(str)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  }

  const encodeBytes = (bytes, enc) => {
    checkEncode(enc)
    return enc === 'hex' ? bytesToHex(bytes) : bytesToBase64(bytes)
  }

  const decodeBytes = (str, enc) => {
    checkEncode(enc)
    return enc === 'hex' ? hexToBytes(str) : base64ToBytes(str)
  }

  const compare = (left, right) => {
    left = toUint8(left)
    right = toUint8(right)
    if (left.length !== right.length) return left.length - right.length
    for (let i = 0; i < left.length; i++) {
      if (left[i] !== right[i]) return left[i] - right[i]
    }
    return 0
  }

  const webCryptoAlg = alg => {
    const normalized = String(alg).toLowerCase().replace(/[-_]/g, '')
    const names = {
      sha1: 'SHA-1',
      sha256: 'SHA-256',
      sha384: 'SHA-384',
      sha512: 'SHA-512'
    }
    const name = names[normalized]
    assert(name, `Unsupported browser hash algorithm: ${alg}.`)
    return name
  }

  /**
   * Calc HMAC for a single round.
   * Browser version uses Web Crypto and supports SHA-1/SHA-256/SHA-384/SHA-512.
   */
  const hmac = async (alg, key, input) => {
    const crypto = getCrypto()
    const cryptoKey = await crypto.subtle.importKey(
      'raw', toUint8(key), { name: 'HMAC', hash: { name: webCryptoAlg(alg) } },
      false, ['sign']
    )
    const signed = await crypto.subtle.sign('HMAC', cryptoKey, toUint8(input))
    return new Uint8Array(signed)
  }

  /**
   * Unblocking phpwd derivation for browsers.
   */
  const derive = async (alg, salt, input, iterations) => {
    const crypto = getCrypto()
    const cryptoKey = await crypto.subtle.importKey(
      'raw', toUint8(salt), { name: 'HMAC', hash: { name: webCryptoAlg(alg) } },
      false, ['sign']
    )
    input = toUint8(input)
    while (iterations-- > 0) {
      input = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, input))
    }
    return input
  }

  const parsePhpwdJson = (jsonStr, enc) => {
    checkEncode(enc)
    const phpwd = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    const { salt, hash } = phpwd
    return Object.assign({}, phpwd, {
      salt: typeof salt === 'string' ? decodeBytes(salt, enc) : toUint8(salt),
      hash: typeof hash === 'string' ? decodeBytes(hash, enc) : toUint8(hash)
    })
  }

  const serializePhpwdJson = (phpwd, enc) => {
    checkEncode(enc)
    return JSON.stringify({
      hash: encodeBytes(phpwd.hash, enc),
      salt: encodeBytes(typeof phpwd.salt === 'string' ? decodeBytes(phpwd.salt, enc) : phpwd.salt, enc),
      index: phpwd.index,
      alg: phpwd.alg
    })
  }

  const parsePhpwdString = (str, enc) => {
    checkEncode(enc)
    const [ header, salt, hash ] = str.split('.')
    assert(header && salt && hash, 'Invalid phpwd token.')
    const phpwd = JSON.parse(bytesToUtf8(decodeBytes(header, enc)))
    return Object.assign(phpwd, {
      salt: decodeBytes(salt, enc),
      hash: decodeBytes(hash, enc)
    })
  }

  const serializePhpwdString = (phpwd, enc) => {
    checkEncode(enc)
    const header = encodeBytes(utf8ToBytes(JSON.stringify({
      index: phpwd.index,
      alg: phpwd.alg
    })), enc)
    const salt = encodeBytes(typeof phpwd.salt === 'string' ? decodeBytes(phpwd.salt, enc) : phpwd.salt, enc)
    const hash = encodeBytes(phpwd.hash, enc)
    return `${header}.${salt}.${hash}`
  }

  const isJson = str => typeof str === 'string' && str.startsWith('{')

  const parse = (phpwd, enc) => {
    if (typeof phpwd === 'object') return parsePhpwdJson(phpwd, enc)
    return isJson(phpwd) ? parsePhpwdJson(phpwd, enc) : parsePhpwdString(phpwd, enc)
  }

  const getSalt = async bytes => getRandomValues(bytes)

  class Phpwd {
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
      assert(this.encode === 'base64' || this.encode === 'hex', 'Unsupported encode.')
      webCryptoAlg(this.alg)
    }

    async generateSalt() {
      const salt = await getSalt(this.saltSize)
      return encodeBytes(salt, this.encode)
    }

    parse(input) {
      const { alg, saltSize, maxIndex, minIndex, encode } = this
      const phpwd = parse(input, encode)
      const { index, salt, hash } = phpwd
      assert(hash, 'Hash is required.')
      assert(phpwd.alg === alg, 'Invalid hash algorithm.')
      assert(index <= maxIndex && index > minIndex, 'Invalid index.')
      assert(salt.length === saltSize, 'Invalid salt size.')
      return phpwd
    }

    validateInitial(input) {
      const { index } = this.parse(input)
      assert(index === this.maxIndex, 'Initial index should be same as maxIndex.')
      return true
    }

    async getInitialData() {
      const { minIndex, maxIndex, minDecrement, updateIndex } = this
      const salt = await this.generateSalt()
      return { minIndex, maxIndex, updateIndex, minDecrement, salt }
    }

    async getAuthData(input) {
      const { updateIndex, minIndex, maxIndex, minDecrement, encode } = this
      const { index, salt } = this.parse(input)
      const data = { index, salt: encodeBytes(salt, encode),
        minIndex, maxIndex, minDecrement }
      if (index <= updateIndex) {
        const saltUpdate = await this.generateSalt()
        const indexUpdate = maxIndex
        Object.assign(data, { saltUpdate, indexUpdate })
      }
      return data
    }

    async generate(payload) {
      const { encode, alg } = this
      const { pass, index, salt, json } = payload
      const saltBytes = typeof salt === 'string' ? decodeBytes(salt, encode) : toUint8(salt)
      const passBytes = typeof pass === 'string' ? utf8ToBytes(pass) : toUint8(pass)
      const hash = await derive(alg, saltBytes, passBytes, index)
      const phpwd = { hash, salt: saltBytes, index, alg }
      return json ? serializePhpwdJson(phpwd, encode) : serializePhpwdString(phpwd, encode)
    }

    async validate(input, target) {
      const { alg, minDecrement } = this
      const iPhpwd = this.parse(input)
      const tPhpwd = this.parse(target)
      const { salt, index, hash } = tPhpwd
      assert(compare(salt, iPhpwd.salt) === 0, 'Invalid salt value.')
      assert(index - iPhpwd.index >= minDecrement, 'Reject by index.')
      const iterations = tPhpwd.index - iPhpwd.index
      const derived = await derive(alg, salt, iPhpwd.hash, iterations)
      assert(compare(hash, derived) === 0, 'Invalid phpwd.')
      return true
    }
  }

  const createPhpwd = options => new Phpwd(options)

  return {
    utils: { getSalt, parsePhpwdJson, serializePhpwdJson,
      parsePhpwdString, serializePhpwdString, parse },
    derive,
    hmac,
    Phpwd,
    createPhpwd
  }
})
