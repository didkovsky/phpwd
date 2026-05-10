'use strict'
const assert = require('node:assert/strict')
const { createPhpwd } = require('../browser/phpwd')

const run = async () => {
  const phpwd = createPhpwd({ minIndex: 10, maxIndex: 50, updateIndex: 20 })
  const salt = await phpwd.generateSalt()
  const target = await phpwd.generate({ salt, pass: 'password', index: 50 })
  const input = await phpwd.generate({ salt, pass: 'password', index: 49 })
  const json = await phpwd.generate({ salt, pass: 'password', index: 50, json: true })
  const authData = await phpwd.getAuthData(input)
  assert.equal(await phpwd.validate(input, target), true)
  assert.equal(phpwd.validateInitial(json), true)
  assert.equal(phpwd.parse(target).salt.length, 32)
  assert.equal(authData.salt, salt)
  assert.equal(typeof createPhpwd, 'function')
}

if (require.main === module) {
  run().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}

module.exports = { run }
