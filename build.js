import { promises, existsSync, readdirSync, lstatSync, unlinkSync, rmdirSync } from 'fs'
import { build as _build } from 'esbuild'
import path from 'path'

const argc = process.argv.length
const args = process.argv.slice(2, argc)
const clean = args.includes('--clean')
const minify = args.includes('--minify')
const sourceMap = args.includes('--sourcemap')

const NODE_VER_MATCH_REGEX = /(\d+)\.(\d+)\.(\d+)/
const m = process.version.match(NODE_VER_MATCH_REGEX)
const [major, minor, patch] = m.slice(1).map(_ => parseInt(_, 10))

const del = async (_path) => {
    if (major >= 14 && minor >= 14 && patch >= 0) {
        await promises.rm(_path, { recursive: true, force: true })
    } else {
        // fallback to this mess of a method
        if (existsSync(_path)) {
            readdirSync(_path).forEach((file, _idx) => {
                const entryPath = path.join(_path, file)
                if (lstatSync(entryPath).isDirectory()) {
                    del(entryPath)
                } else {
                    unlinkSync(entryPath)
                }
            })
            rmdirSync(_path)
        }
    }
}

const build = async () => {
    if (clean) {
        await del('dist')
    }
    
    try {
        const trackerBundle = await _build({
            entryPoints: ['src/index.ts'],
            target: 'node18',
            bundle: true,
            minify,
            sourcemap: sourceMap,
            outdir: 'dist',
            platform: 'node',
            format: 'esm',
            tsconfig: 'tsconfig.json',
        })
        console.log('Build complete')
    } catch (err) {
        console.error(err)
    }
}

build()