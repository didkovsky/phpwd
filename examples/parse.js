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
