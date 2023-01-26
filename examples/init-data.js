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
