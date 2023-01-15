'use strict'
const metatests = require('metatests')
const { createPhpwd } = require('../lib/phpwd')

/**
 * Normal case, all options is valid, authentification should
 * be successful.
 */
metatests.test('Correct password and index.', async test => {
  const phpwd = createPhpwd()
  const salt = await phpwd.generateSalt()
  const pass = 'password'

  let target
  {
    const index = 50000
    target = await phpwd.generate({ salt, pass, index })
  }

  let input
  {
    const index = 49999
    input = await phpwd.generate({ salt, pass, index })
  }

  const result = await phpwd.validate(input, target)
  test.strictEqual(result, true)
  test.end()
})

/**
 * Should throw when the input password is not matching
 * the target password.
 */
metatests.test('Invalid password.', async test => {
  const phpwd = createPhpwd()
  const salt = await phpwd.generateSalt()
  const pass = 'password'

  let target
  {
    const index = 50000
    target = await phpwd.generate({ salt, pass, index })
  }

  let input
  {
    const index = 49999
    // Wrong password
    input = await phpwd.generate({ salt, pass: `notpass`, index })
  }

  const t = new metatests.ImperativeTest('Invalid password.',
    () => phpwd.validate(input, target)
  )

  t.on('done', () => {
    test.assertNot(t.success)
  })
})

/**
 * Should throw when we trying to athentificate with the phpwd
 * that has the index higher than the target index.
 */
metatests.test('The index higher than the target index.', async test => {
  const phpwd = createPhpwd()
  const salt = await phpwd.generateSalt()
  const pass = 'password'

  let target
  {
    const index = 50000
    target = await phpwd.generate({ salt, pass, index })
  }

  let input
  {
    const index = 50001 // Should be less than 50000
    input = await phpwd.generate({ salt, pass, index })
  }

  const t = new metatests.ImperativeTest('The index higher than the target index.',
    () => phpwd.validate(input, target)
  )

  t.on('done', () => {
    test.assertNot(t.success)
  })
})

/**
 * Should throw when we trying to use the index higher than maxIndex.
 */
metatests.test('The index higher than maxIndex.', async test => {
  const phpwd = createPhpwd()
  const salt = await phpwd.generateSalt()
  const pass = 'password'

  let target
  {
    const index = 200001 // Default max is 200000
    target = await phpwd.generate({ salt, pass, index })
  }

  let input
  {
    const index = 200000
    input = await phpwd.generate({ salt, pass, index })
  }

  const t = new metatests.ImperativeTest('The index higher than maxIndex.',
    () => phpwd.validate(input, target)
  )

  t.on('done', () => {
    test.assertNot(t.success)
  })
})

/**
 * Should throw when we trying authentificate with the index lower
 * than minIndex.
 */
metatests.test('The index lower than minIndex.', async test => {
  const phpwd = createPhpwd()
  const salt = await phpwd.generateSalt()
  const pass = 'password'

  let target
  {
    const index = 50000
    target = await phpwd.generate({ salt, pass, index })
  }

  let input
  {
    const index = 9000 // Index to low.
    input = await phpwd.generate({ salt, pass, index })
  }

  const t = new metatests.ImperativeTest('The index lower than minIndex.', 
    () => phpwd.validate(input, target)
  )

  t.on('done', () => {
    test.assertNot(t.success)
  })
})

/**
 * Shoud throw when we trying to authentificate with the index that
 * decremented not enough.
 */
metatests.test('Index decremention lower than required.', async test => {
  const phpwd = createPhpwd({ minDecrement: 10 })
  const salt = await phpwd.generateSalt()
  const pass = 'password'

  let target
  {
    const index = 50000
    target = await phpwd.generate({ salt, pass, index })
  }

  let input
  {
    const index = 49999 // should be at least 49990.
    input = await phpwd.generate({ salt, pass, index })
  }

  const t = new metatests.ImperativeTest('Index decremention lower than required.', 
    () => phpwd.validate(input, target)
  )

  t.on('done', () => {
    test.assertNot(t.success)
  })
})

/**
 * Should trow when the target salt and the input satl
 * is different.
 */
metatests.test('Different salt in the input and the target.', async test => {
  const phpwd = createPhpwd()
  const salt = await phpwd.generateSalt()
  const pass = 'password'

  let target
  {
    const index = 50000
    target = await phpwd.generate({ salt, pass, index })
  }

  let input
  {
    const index = 49999
    // Salt is not match.
    input = await phpwd.generate({ salt: Buffer.alloc(32, 0x1), pass, index })
  }

  const t = new metatests.ImperativeTest('Different salt in the input and the target.', 
    () => phpwd.validate(input, target)
  )

  t.on('done', () => {
    test.assertNot(t.success)
  })
})

/**
 * Should throw when the salt size doesnt match defined value.
 * Default is 32.
 */
metatests.test('Invalid salt size.', async test => {
  const phpwd = createPhpwd()
  const salt = Buffer.alloc(14, 0x1) // Should be 32 by default
  const pass = 'password'

  let target
  {
    const index = 50000
    target = await phpwd.generate({ salt, pass, index })
  }

  let input
  {
    const index = 49999
    input = await phpwd.generate({ salt, pass, index })
  }

  const t = new metatests.ImperativeTest('Invalid salt size.', 
    () => phpwd.validate(input, target)
  )

  t.on('done', () => {
    test.assertNot(t.success)
  })
})

/**
 * Test for valid initial value.
 */
 metatests.test('Valid initial value.', async test => {
  const phpwd = createPhpwd()
  const salt = await phpwd.generateSalt()
  const pass = 'password'

  let target
  {
    const index = 200000
    target = await phpwd.generate({ salt, pass, index })
  }

  const result = await phpwd.validateInitial(target)
  test.strictEqual(result, true)
  test.end()
})

/**
 * Get athentification data.
 */
 metatests.test('Get athentification data.', async test => {
  const phpwd = createPhpwd()
  const salt = await phpwd.generateSalt()
  const pass = 'password'

  let input
  {
    const index = 49000
    input = await phpwd.generate({ salt, pass, index })
  }

  phpwd.getAuthData(input)
  test.end()
})
