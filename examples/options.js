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
