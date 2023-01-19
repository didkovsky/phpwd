const { request } = require('http')

const req = (path, data) => {

  const options = {
    host: 'localhost',
    port: 333,
    method: 'POST',
    path
  }

  return new Promise((resolve, reject) => {
    const req = request(options, res => {
      const chunks = []
      res.on('error', e => reject(e))
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        const buff = Buffer.concat(chunks)
        const data = buff.toString('utf8')
        if (res.statusCode === 200)
        resolve(data) 
        else reject(data)
      })
    })

    if (data) req.write(JSON.stringify(data))
    req.end()
  })
}

module.exports = { req }
