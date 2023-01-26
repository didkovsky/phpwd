# Usage examples

See simple <a href="https://github.com/didkovsky/phpwd/tree/main/examples/server">HTTP-server example</a> with phpwd authentification.

## Phpwd options
Options that we can add to phpwd instance.
``` javascript
const { createPhpwd } = require('../lib')

{
  /**
   * Create with default options
   */
  const phpwd = createPhpwd()
}

const phpwd = createPhpwd({

  /**
   * Hash algorithm, default: sha256
   */
  alg: 'ripemd160',

  /**
   * Minimal admissible index,
   * phpwd with index lower than that
   * will be rejected during validation,
   * default: 20000
   */
  minIndex: 20000,

  /**
   * Maximal admissible index,
   * use it for generate initial value,
   * deault: 200000
   */
  maxIndex: 100000,

  /**
   * Index when we should update salt,
   * default: 50000
   */
  updateIndex: 50000,

  /**
   * Salt size in bytes,
   * default: 32
   */
  saltSize: 32,

  /**
   * Minimal value we should decrement the index
   * for each authentification,
   * default: 1
   */
  minDecrement: 3,

  /**
   * Encode that will be used for
   * token string serialization
   * or for bin data serialization 
   * for json mode
   */
  encode: 'base64'
})

console.dir(phpwd)

```

## Generate phpwd

Generate token from the clients side.
``` javascript
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

```

## Validate phpwd
Validate token on the server side.

``` javascript
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

```

## Get initial data
Parameters we need to generate initial phpwd.

``` javascript
const { createPhpwd } = require('../lib')

/**
 * Create phpwd
 */
const phpwd = createPhpwd()

const run = async () => {

  /**
   * Get parameters we need to create initial phpwd
   */
  const data = await phpwd.getInitialData()

  /**
   * {
      minIndex: 20000,
      maxIndex: 200000,
      updateIndex: 50000,
      minDecrement: 1,
      salt: 'ABHvsJtpUkrIytG8ok+NMmJTMP1zVvYJdM0e367pQcE='
    }
   */
  console.dir(data)
}

run().catch(console.error)

```

## Get auth data
Parameters we need to know for each authentification.

``` javascript
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

```

## Parse
Get object from token string or json string.

``` javascript
const { createPhpwd } = require('../lib')

/**
 * Create phpwd
 */
const phpwd = createPhpwd()

/**
 * String token
 */
const token = 'eyJpbmRleCI6MTAwMDAwLCJhbGciOiJzaGEyNTYifQ==.dyp55RQPUVBDwnoDU+KphlBuFcW2IfxfXIxTa0FD7jU=.QeAnh4KERo9kRPhwKOOOfXfr415fSVoGbYkU107HAHE='

/**
 * Parse
 */
const obj = phpwd.parse(token)

/**
 * Output:
 * {
  index: 100000,
  alg: 'sha256',
  salt: Buffer(32) [Uint8Array] [
    119,  42, 121, 229,  20,  15,  81,  80,
     67, 194, 122,   3,  83, 226, 169, 134,
     80, 110,  21, 197, 182,  33, 252,  95,
     92, 140,  83, 107,  65,  67, 238,  53
  ],
  hash: Buffer(32) [Uint8Array] [
     65, 224,  39, 135, 130, 132,  70, 143,
    100,  68, 248, 112,  40, 227, 142, 125,
    119, 235, 227,  94,  95,  73,  90,   6,
    109, 137,  20, 215,  78, 199,   0, 113
  ]
}
 */
console.dir(obj)

/**
 * Parse json
 */
{

  /**
   * Json string
   */
  const jsonSrt = '{"hash":"QeAnh4KERo9kRPhwKOOOfXfr415fSVoGbYkU107HAHE=","salt":"dyp55RQPUVBDwnoDU+KphlBuFcW2IfxfXIxTa0FD7jU=","index":100000,"alg":"sha256"}'

  /**
   * Parse
   */
  const obj = phpwd.parse(jsonSrt)

  /**
   * Output the same as above
   */
  console.dir(obj)
}

```
