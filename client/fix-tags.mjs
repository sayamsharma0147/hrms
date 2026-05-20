import { readFileSync, writeFileSync } from 'fs'

const path = 'src/pages/Pipeline/ApplicationDetail.jsx'
let c = readFileSync(path, 'utf8')
const badClose = '</' + 'motion.div' + '>'
const goodClose = '</' + 'div' + '>'
if (c.includes(badClose)) {
  c = c.replaceAll(badClose, goodClose)
  writeFileSync(path, c)
  console.log('replaced', badClose, '->', goodClose)
} else {
  console.log('bad tag not found, file ok')
}
