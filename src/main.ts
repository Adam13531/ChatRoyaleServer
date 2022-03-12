import 'dotenv/config'
import { WebSocketServer, WebSocket, Server } from 'ws'
import inquirer from 'inquirer'
import { client as tmi } from 'tmi.js'
import Game from './Game.js'
import _ from 'lodash'

const wss: Server = new WebSocketServer({ port: 7896 })
let tmiClient: any
let game: Game

function startSocketServer() {
  wss.on('connection', function connection(ws) {
    console.log('Got a new connection')
    ws.on('message', function message(data) {
      console.log('received: %s', data)
    })

    ws.on('close', () => {
      console.log('Websocket closed')
    })

    console.log('Sending something')
    ws.send('something')
  })
}

function sendToAll(msg: any) {
  console.log(`Sending to all: ${msg}`)
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg)
    }
  })
}

function processUserCommand(cmd: string) {
  cmd = cmd.trim()
  if (cmd.length == 0) {
    console.error('You typed only spaces. Ignoring.')
    return
  }

  const words = cmd.split(' ')
  const firstWord = words[0]
  const restOfWords = words.slice(1)
  switch (firstWord) {
    case 'start':
      game.handleStartMessage()
      break
    case 'status':
      game.printStatus()
      break
    case 'say':
      if (words.length < 2) {
        console.error('You must type something after "say"')
        break
      }

      sendToAll(cmd.substr(cmd.indexOf(' ') + 1))
      break
    default:
      console.error(`Unrecognized command: "${firstWord}`)
      break
  }
}

async function prompt() {
  try {
    const { ans } = await inquirer.prompt([
      {
        name: 'ans',
        message: 'Type a command to run it:',
      },
    ])
    processUserCommand(ans)
    prompt()
  } catch (error) {
    console.error('Got an error: ', error)
  }
}

async function startTwitchChat() {
  const gameChannel = process.env.GAME_CHANNEL
  const botName = process.env.BOT_NAME
  const botOauth = process.env.BOT_OAUTH

  console.log(`Connecting as ${botName} to Twitch channel "${gameChannel}"`)
  tmiClient = new tmi({
    options: { debug: true },
    connection: {
      reconnect: true,
      secure: true,
    },
    identity: {
      username: botName,
      password: botOauth,
    },
    channels: [gameChannel],
  })
  await tmiClient.connect()
  console.log('Connected to Twitch chat')
  tmiClient.say(gameChannel, 'HeyGuys')
  const channelWithHash = `#${gameChannel.toLowerCase()}`
  tmiClient.on(
    'message',
    (
      channel: string,
      tags: Record<string, any>,
      message: string,
      self: boolean
    ) => {
      if (self || channel != channelWithHash) return
      game.onChatMessage(tags, message)
    }
  )
}

function ensureEnvVars() {
  const varNames = ['GAME_CHANNEL', 'BOT_NAME', 'BOT_OAUTH']
  _.forEach(varNames, (varName) => {
    if (_.isNil(process.env[varName])) {
      console.error(`Environment variable not defined: ${varName}`)
      process.exit(1)
    }
  })
}

function initGame() {
  game = new Game()
}

async function main() {
  ensureEnvVars()
  initGame()
  await startTwitchChat()
  startSocketServer()
  console.log('Running')
  prompt()
}

try {
  main()
} catch (e) {
  console.error('Error occurred from main: ', e)
}
