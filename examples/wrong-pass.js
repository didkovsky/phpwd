const { generate, validate, getSalt } = require('../lib')

const run = async () => {
  const salt = await getSalt(32)
  
  const target = await generate({
    alg: 'sha256',
    password: 'password',
    index: 11000,
    salt
  })

  /**
   * target: {
        alg: 'sha256',
        salt: '16cvOcATH3JQMdQPPv+GhpaOtJ6QuZB59auox/od128=',
        hash: 'YO/Z7Go03pZqcdvB+bHW2wkPC6vhfoe5xGvyGqsniAg=',
        index: 10000
      }
   */
  console.dir({target})

  const phpwd = await generate({
    alg: 'sha256',
    // Wrong password
    password: 'password0',
    index: 10990,
    salt
  })

  /**
   * phpwd: {
        alg: 'sha256',
        salt: '16cvOcATH3JQMdQPPv+GhpaOtJ6QuZB59auox/od128=',
        hash: '4sj3AkRPMuArZ9FjCFAyqscujdNTE5ePNusLzppa3BY=',
        index: 9900
      }
   */
  console.dir({phpwd})
  
  /**
   * Throws an error
   * AssertionError [ERR_ASSERTION]: Invalid phpwd.
   */
  const valid = await validate(phpwd, target)
}

run()
