const fs = require('fs')
const path = require('path')
const unzip = require('unzip')

function unzipWeinre () {
  const destPath = path.join(__dirname, '..')
  const destFolder = path.join(destPath, 'apache-weinre')
  if (!fs.existsSync(destFolder)) {
    const zipFile = path.join(__dirname, '../apache-weinre.zip')
    fs.createReadStream(zipFile).pipe(unzip.Extract({ path: destPath }))
  } else {
    console.log('weinre folder exist')
  }
}

unzipWeinre()