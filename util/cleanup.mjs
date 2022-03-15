// Import module(s).
import { rmSync } from 'fs'

// Clean-up build directory.
rmSync('./lib', { recursive: true, force: true })

// Log completion.
console.log('\u001b[32m[SYSTEM]: Clean complete!\u001b[0m')
