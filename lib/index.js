'use strict'
const { derive } = require('./phpwd')
const { promisify, getSalt, generate, validate } = require('./utils')
module.exports = { promisify, getSalt, generate, validate, derive }
