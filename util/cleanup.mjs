// Import module(s).
import { rmSync } from 'fs'

// Clean-up build directory.
rmSync('./lib', { recursive: true, force: true })

// Log completion.
console.log('Clean-up complete!')
