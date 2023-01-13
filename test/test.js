const metatests = require('metatests')
const { generate, validate, getSalt } = require('../lib')

metatests.test('Correct password and index.', async test => {
  const salt = await getSalt(32)

  const target = await generate({
    alg: 'sha256',
    password: 'password',
    index: 11000,
    salt
  })

  const phpwd = await generate({
    alg: 'sha256',
    password: 'password',
    index: 10990,
    salt
  })

  const valid = await validate(phpwd, target)
  test.strictEqual(valid, true, 'Correct authentification failed.')
  test.end()
})

metatests.test('Incorrect password.', async test => {
  const salt = await getSalt(32)

  const target = await generate({
    alg: 'sha256',
    password: 'password',
    index: 11000,
    salt
  })

  const phpwd = await generate({
    alg: 'sha256',
    password: 'NOTpassword',
    index: 10000,
    salt
  })

  const t = new metatests.ImperativeTest('Incorrect password.', () => validate(phpwd, target))

  t.on('done', () => {
    test.assertNot(t.success)
  })
})

metatests.test('Higher index that allowed.', async test => {
  const salt = await getSalt(32)

  const target = await generate({
    alg: 'sha256',
    password: 'password',
    index: 11000,
    salt
  })

  const phpwd = await generate({
    alg: 'sha256',
    password: 'password',
    index: 12000,
    salt
  })

  const t = new metatests.ImperativeTest('Higher index.', () => validate(phpwd, target))

  t.on('done', () => {
    test.assertNot(t.success)
  })
})

metatests.test('Same index as target.', async test => {
  const salt = await getSalt(32)

  const target = await generate({
    alg: 'sha256',
    password: 'password',
    index: 11000,
    salt
  })

  const phpwd = await generate({
    alg: 'sha256',
    password: 'password',
    index: 11000,
    salt
  })

  const t = new metatests.ImperativeTest('Same index.', () => validate(phpwd, target))

  t.on('done', () => {
    test.assertNot(t.success)
  })
})
