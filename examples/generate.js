const { createPhpwd } = require('../lib')

/**
 * Create phpwd
 */
const phpwd = createPhpwd()

const run = async () => {

  /**
   * User password
   */
  const pass = 'password'

  /**
   * Current phpwd index
   */
  const index = 200000

  /**
   * Salt as hex string, 32 bytes
   */
  const salt = await phpwd.generateSalt()

  /**
   * Generate phpwd as string token
   */
  const stringToken = await phpwd.generate({ pass, index, salt })

  /**
   * eyJpbmRleCI6MTAwMDAwLCJhbGciOiJzaGEyNTYifQ==.dyp55RQPUVBDwnoDU+KphlBuFcW2IfxfXIxTa0FD7jU=.QeAnh4KERo9kRPhwKOOOfXfr415fSVoGbYkU107HAHE=
   */
  console.log(stringToken)

  /**
   * Generate phpwd as json
   */
  const jsonStr = await phpwd.generate({ pass, index, salt, json: true })

  /**
   * {"hash":"fpOhzbgfnDQ8E2HKQnqoXGNxeKzcQru9HZ8xDEF1Xhw=","salt":"fqvqKL+kly+Ao7P/va5G7IlwYOD7CCPmUuUQqSS0wMQ=","index":10000,"alg":"sha256"}
   */
  console.log(jsonStr)
}

run().catch(console.error)
