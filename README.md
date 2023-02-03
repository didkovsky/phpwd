# Partial hashed password authentification protocol (experimental).

See simple <a href="https://github.com/didkovsky/phpwd/tree/main/examples/server">HTTP-server example</a> with phpwd authentification.

---

## What the point?

- It's allows us to make password-based athentification whitout sharing the password with the server side.
- Every time we authentificate, we sending unique phpwd, it's never repeated.
- It is not required to do heavy KDF calculations on the server side, when user authentificates.
- Heavy KDF calculations should be done on the clients side, it is give us "natural" control of requests frequency.
- It is simple to undestand.

## Principle
Password-based authentication is a process of verifying a user's identity by comparing a user-provided password with the one stored on the server. The phpwd Algorithm is a way of providing this authentication without having to share the user's password with the server, allowing for more secure authentication.

```
          salt      salt      
            |         |        
 pass -> [HMAC] -> [HMAC] -> ... -> phpwd
        |......... index .........|

```

The algorithm works by generating a unique phpwd value through multiple iterations of HMAC (Hash-based Message Authentication Code) of the user's password and salt. The salt is generated on the server side and is not kept as a secret. This value, along with the number of iterations, the salt value, and the hash algorithm name, is sent to the server as token string or JSON.

```

Client                                             Server

{salt, maxIndex} <--------- initial data ---------

phpwd(salt, maxIndex, pass) ------- token -------> DB.set(token)

```

When the user wants to authenticate, the same process is repeated with a lower number of iterations. The server can calculate the target value (from the initial number of iterations) from the new given value. If the two values match, the user is authenticated. The server can then replace the target value with the new one and the user will need to use a lower number of iterations next time they authenticate.

```

Client                                             Server

{salt, index, minDecrement} <----- auth data ----- DB

index -= minDecrement                              DB --> prev token (target)

phpwd(salt, index, pass) --------- token --------> verify(token, target)

                                                   DB <-- update token
                                                   
```

If the user's phpwd index is out of date, a new salt can be generated and the index can be reset to the initial value without forcing the user to change their password.

```

Client                                             Server

{salt, index, minDecrement,
   saltUpdate, indexUpdate} <----- auth data ----- DB

index -= minDecrement                              DB --> prev token (target)

token = phpwd(salt, index, pass)
tokenUpdate = phpwd(saltUpdate, indexUpdate, pass)
                  --- token, tokenUpdate --------> verify(token, target)

                                                   DB <-- update tokenUpdate
                                                   
```

## Token formats

String token
```

eyJpbmRleC ... ZyI6InNoYTI1NiJ9.LdvXvul+o5 ... 5MgYiZpazWkHxyzGk=.SYU823DttWeVMSj ... Xm406lw/gtZg8mHnTw=
|.......... header ............|........... salt ................|..... hash (value of HMAC chain) ......|

```

JSON
``` json

{
  "hash":"UmM4AXxU50MjlOg+qNtctUTGnMu21nsNBhbE1O9NIw8=",
  "salt":"+L3zBzKU80aDQ6lOyb7uNlJbvegKTSlXt9BxRrD3aV8=",
  "index":99999,
  "alg":"sha256"
}

```

## Usage
See <a href="https://github.com/didkovsky/phpwd/tree/main/examples">./examples</a> folder.

Setting up phpwd
``` javascript
const { createPhpwd } = require('../lib')

{
  /**
   * Create with default options
   */
  const phpwd = createPhpwd()
}

/**
 * Custom options
 */
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

Generate
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

Validate
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

Get initial data
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
Get auth data
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
