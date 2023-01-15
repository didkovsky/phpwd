'use strict'
const metatests = require('metatests')
const { serializePhpwdJson, serializePhpwdString, parse, getSalt } = require('../lib/utils')

const encode = 'base64'

/**
 * phpwd object for tests
 * @returns { alg, salt, hash, index }
 */
const getPhpwd = async () => {
  const rand = await getSalt(32)
  return {
    alg: 'sha256',
    index: 100000,
    salt: rand,
    hash: rand
  }
}

/**
 * json parser and serializer test
 */
metatests.test('Phpwd json parse and serialize.', async test => {
  const phpwd = await getPhpwd()
  const jsonStr = serializePhpwdJson(phpwd, encode)
  const parsed = parse(jsonStr, encode)
  test.strictEqual(phpwd.hash.toString(encode), parsed.hash.toString(encode))
  test.end()
})

/**
 * token string parser and serializer test
 */
metatests.test('Phpwd string token parse and serialize.', async test => {
  const phpwd = await getPhpwd()
  const phpwdStr = serializePhpwdString(phpwd, encode)
  const parsed = parse(phpwdStr, encode)
  test.strictEqual(phpwd.hash.toString(encode), parsed.hash.toString(encode))
  test.end()
})
