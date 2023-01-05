# Partial hashed password authentification protocol (experimental).

I will be glad to see your questions, comments and remarks in discussion section: https://github.com/didkovsky/phpwd/discussions

## What the point?

- It's allows us to make password-based athentification whitout sharing the password with the server side.
- Every time we authentificate, we sending unique phpwd, it's never repeated.
- It is not required to do heavy KDF calculations on the server side, when user authentificates.
- Heavy KDF calculations should be done on the clients side, it is give us "natural" control of requests frequency.
- It is simple to undestand.

## How does it works?

When we want to register, we generating many iterations of HMAC of our password with the salt. We use the salt as a key for the HMAC and our password as input. The salt cant be generated on the server side, and will be given to the user, to be sure it is random and safe. The salt - isn't a secret.

```
          salt      salt      
            |         |        
 pass -> [HMAC] -> [HMAC] -> ... -> phpwd
        |....... iterations ......|

```

This value with the iterations number, the salt value, and the hash algorithm name we sending to the server. Like this: 

``` javascript
{
  alg: 'sha256', // hash algorithm name
  salt: '16cvOcATH3JQMdQPPv+GhpaOtJ6QuZB59auox/od128=', // Client and server knows it
  hash: 'YO/Z7Go03pZqcdvB+bHW2wkPC6vhfoe5xGvyGqsniAg=', // phpwd value
  index: 10000 // How many iterations we did
}
```

The server saves it and will use it as "target" in future.

Every time we want to authentificate, we generating the same, but with the lower number of iterations:

``` javascript
{
  alg: 'sha256',
  salt: '16cvOcATH3JQMdQPPv+GhpaOtJ6QuZB59auox/od128=',
  hash: '4sj3AkRPMuArZ9FjCFAyqscujdNTE5ePNusLzppa3BY=',
  index: 9990
}
```

The server can calculate the target value (10000 iterations) from the new given value (9990 iterations), all we need to do is 10 more iterations, then we can compare both values that allows us to authentificate user. After successful authentification we can replace our current target value with new one: with index 9990, and the next time the user wants to athentificate, he should calculate phpwd with the lower number of iterations. phpwd with the index higher that the target index, should be rejected.

## What we should do when phpwd index is out?

Just generate new salt, and the index can be restored to the initial value without forced changing password.

## Examples

You can find examples here: https://github.com/didkovsky/phpwd/tree/main/examples
