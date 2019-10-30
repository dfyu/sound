#!/usr/bin/env node
const arg = require('arg')
const http = require('http')
const childProcess = require('child_process')
let args = null
try {
    args = arg({
        '--s': Boolean,
        '--uk': Boolean,
        '--en': Boolean,
        '--us': Boolean
    });
} catch (err) {
    console.log(err.message);
    process.exit(0)
}

const isSentence = !!args['--s']
const isUK = !!args['--uk']
const words = args['_']
if (args && words.length > 0) {
    if (isSentence) {
        getSound(words.concat('%20'))
    } else {
        words.map(word => getSound(word))
    }
}

function getSound (string) {
    let temp = Buffer.from([])
    http.get(
        new URL(`http://dict.youdao.com/dictvoice?audio=${string}&type=${isUK ? 1 : 2}`),
        res => {
        res.on('data', res => temp = Buffer.concat([temp, res], temp.length + res.length))
        res.on('end', () => {
            let subprocess = childProcess.spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
                `data:audio/mpeg;base64,${temp.toString('base64')}`
            ])
            subprocess.unref()
        })
    })
}
