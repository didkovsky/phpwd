const { createPhpwd } = require('../lib')

/**
 * Create phpwd
 */
const phpwd = createPhpwd()

const run = async () => {

  /**
   * Target phpwd value, we store in db
   */
  const target = 'eyJpbmRleCI6MTAwMDAwLCJhbGciOiJzaGEyNTYifQ==.dyp55RQPUVBDwnoDU+KphlBuFcW2IfxfXIxTa0FD7jU=.QeAnh4KERo9kRPhwKOOOfXfr415fSVoGbYkU107HAHE='

  /**
   * Get parameters, we need to authentificate
   */
  const data = await phpwd.getAuthData(target)

  /**
   * {
      index: 100000,
      salt: 'dyp55RQPUVBDwnoDU+KphlBuFcW2IfxfXIxTa0FD7jU=',
      minIndex: 20000,
      maxIndex: 200000,
      minDecrement: 1
    }
   */
  console.dir(data)
}

run().catch(console.error)
