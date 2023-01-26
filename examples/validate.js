const { createPhpwd } = require('../lib')

/**
 * Create phpwd
 */
const phpwd = createPhpwd()

const run = async () => {

  /**
   * Token we store in db
   */
  const target = 'eyJpbmRleCI6MjAwMDAwLCJhbGciOiJzaGEyNTYifQ==.43915bx9NqfARWT7LeMDIPUJa2ADL8Ujgc0k5YBC+us=.joOKa8FS3YVT4+UDsGkhIkmD2Zcp7NbaTxU/iM+08iM='

  /**
   * New generated token from the clients side
   */
  const current = 'eyJpbmRleCI6MTk5OTk5LCJhbGciOiJzaGEyNTYifQ==.43915bx9NqfARWT7LeMDIPUJa2ADL8Ujgc0k5YBC+us=.nSVE/cItvuomHEdoFJT8bz0g4jdtN92PzrX7Xb0mSXM='

  /**
   * Validate. Will throw if token invalid.
   */
  const result = await phpwd.validate(current, target)

  /**
   * true
   */
  console.log(result)
}

run().catch(console.error)
