const arg = require('arg')
const http = require('http')
const { writeFileSync, unlinkSync } = require('fs');
const path = require('path')
const player = require('play-sound')(opts = {})

let args = null
let isUK = null
let isEN = true
let isSentence = true
let words = null

function runAsCommand() {
  try {
    args = arg({
      '-s': Boolean,
      '--uk': Boolean,
      '--us': Boolean,
      '--zh': Boolean
    });
  } catch (err) {
    console.log(err.message);
    process.exit(0)
  }

  isSentence = !!args['--s']
  isUK = !!args['--uk']
  isEN = !args['--zh']
  words = args['_']

  if (args && words.length > 0) {
    if (isSentence) {
      getSound(words.concat('%20'))
    } else {
      (async () => {
        for await (let word of words) {
          await getSound(word)
        }
      })();
    }
  } else {
    console.log("请输入待朗读的英文单词, 也可以输入多个单词分开朗读，若是朗读完整句子加上参数 -s")
    console.log("例如: sound hello")
    console.log("例如: sound hello world")
    console.log("例如: sound -s \"hello world\"")
    console.log("例如: sound -s \"hello world\" --uk")
    console.log("例如: sound -s \"hello world\" --us")
    console.log("例如: sound -s \"你好\" --zh")
  }
}

function getSound(string = '') {
  return new Promise(resolve => {
    let temp = Buffer.from([])
    http.get(
      new URL(`http://dict.youdao.com/dictvoice?le=${isEN ? 'en' : 'zh'}&audio=${string}&type=${isUK ? 1 : 2}`),
      res => {
        res.on('data', res => temp = Buffer.concat([temp, res], temp.length + res.length))
        res.on('end', () => {
          const filepath = path.join(__dirname, './tmp.mp3')
          writeFileSync(filepath, temp)

          player.play(filepath, function (err) {
            unlinkSync(filepath)
            resolve()

            if (err) {
              throw err
            }
          })
        })
        res.on('error', resolve)
      })
  })
}

module.exports = function (string = '') {
  if (!string) {
    runAsCommand()
  } else {
    return getSound(string)
  }
}

