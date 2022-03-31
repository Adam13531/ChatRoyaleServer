import 'dotenv/config'
import { WebSocketServer, WebSocket, Server } from 'ws'
import inquirer from 'inquirer'
import { client as tmi } from 'tmi.js'
import Game from './Game.js'
import _ from 'lodash'

const wss: Server = new WebSocketServer({ port: 7896 })
let tmiClient: any
let game: Game

function broadcastToAll(data, options = {}) {
  broadcastToAllExcept(data, null, options)
}

function broadcastToAllExcept(
  data,
  exceptThisWs: WebSocket = null,
  options = {}
) {
  wss.clients.forEach(function each(client: WebSocket) {
    if (client !== exceptThisWs && client.readyState === WebSocket.OPEN) {
      client.send(data, options)
    }
  })
}

function startSocketServer() {
  // This is purely for connecting websockets. We don't trust clients to tell us
  // their Twitch name; we'll get that from the chat stream.
  wss.on('connection', function connection(ws) {
    const numConnections = _.size(wss.clients)

    // If there are tons of people, then don't spam the console.
    if (numConnections < 20) {
      console.log(`Got a new connection. Total: ${numConnections}`)
    }

    // We don't care about incoming messages. Those happen through Twitch chat,
    // where the user is authenticated. Websockets are just for outgoing data.
    // ws.on('message', function message(data) {
    //   console.log('received: %s', data)
    // })

    ws.on('close', () => {
      if (numConnections < 20) {
        console.log(`Websocket closed. Total: ${_.size(wss.clients)}`)
      }
    })

    ws.send(JSON.stringify(game.getFullStateMessage()))
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
    case 'restart':
      game.restart()
      break
    case 'end':
      console.log('Manually ending the timer')
      game.roundTimeIsUp()
      break
    case 'mod':
      game.processModeration()
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
    options: { debug: false },
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
  game = new Game(broadcastToAll)
}

async function main() {
  ensureEnvVars()
  initGame()
  await startTwitchChat()
  startSocketServer()
  prompt()
}

try {
  main()
} catch (e) {
  console.error('Error occurred from main: ', e)
}
