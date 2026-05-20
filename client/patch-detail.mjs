import fs from 'fs'

const p = 'src/pages/Pipeline/ApplicationDetail.jsx'
let c = fs.readFileSync(p, 'utf8')

const old = `  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
      </motion.div>
    )
  }

  if (!application || !candidate) {
    return (
      <motion.div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">`

const neu = `  if (loading) {
    return (
      <motion.div className="max-w-6xl mx-auto space-y-4">
        <SkeletonCard className="h-8 w-40" />
        <motion.div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <SkeletonCard className="lg:col-span-2 h-80" />
          <SkeletonCard className="lg:col-span-3 h-80" />
        </motion.div>
      </motion.div>
    )
  }

  if (!application || !candidate) {
    return (
      <motion.div className="flex flex-col items-center justify-center gap-4 py-16">`

// Fix accidental motion.div typos in template above
const fix = (s) => s.replace(/motion\.div/g, 'div')

if (!c.includes(fix(old))) {
  console.error('old block not found')
  process.exit(1)
}

c = c.replace(fix(old), fix(neu))
fs.writeFileSync(p, c)
console.log('patched')
