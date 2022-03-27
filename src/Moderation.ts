import _ from 'lodash'
import { WebSocketServer, WebSocket, Server } from 'ws'
import Player from './Player'

enum ModerationStatus {
  Unmodded = 1,
  Approved = 2,
  Rejected = 3,
}

interface MessageToModerate {
  senderDisplayName: string
  userId: string
  msgId: string
  message: string
  moderationStatus: ModerationStatus
}

export default class Moderation {
  wss: Server
  messages: Array<MessageToModerate> = []

  public constructor() {
    this.startServer()
  }

  public startNewRound() {
    this.messages = []
    this.broadcast(this.formEntireStateMessage())
  }

  public getPeopleToDisqualify(
    considerUnmoddedToBeDisqualified: boolean
  ): Array<string> {
    const people: Array<string> = []

    _.forEach(this.messages, ({ userId, moderationStatus }) => {
      if (
        moderationStatus === ModerationStatus.Rejected ||
        (considerUnmoddedToBeDisqualified &&
          moderationStatus === ModerationStatus.Unmodded)
      ) {
        people.push(userId)
      }
    })

    return people
  }

  addMessage(sender: Player, tags: Record<string, any>, message: string) {
    const messageToModerate: MessageToModerate = {
      senderDisplayName: sender.displayName,
      userId: sender.userId,
      msgId: tags.id,
      message,
      moderationStatus: ModerationStatus.Unmodded,
    }

    this.messages.push(messageToModerate)

    this.broadcast(this.formNewMessageMessage(messageToModerate))
  }

  broadcast(data, options = {}) {
    this.wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, options)
      }
    })
  }

  formNewMessageMessage(messageToModerate: MessageToModerate) {
    return JSON.stringify({
      type: 'NEW_MESSAGE',
      message: messageToModerate,
    })
  }

  formEntireStateMessage() {
    return JSON.stringify({
      type: 'STATE',
      messages: this.messages,
    })
  }

  formSetModerationStatusMessage(
    msgId: string,
    moderationStatus: ModerationStatus
  ) {
    return JSON.stringify({
      type: 'SET_MOD_STATUS',
      msgId,
      moderationStatus,
    })
  }

  setMessageModerationStatus(
    msgId: string,
    moderationStatus: ModerationStatus
  ) {
    const message = _.find(this.messages, { msgId })
    if (message) {
      message.moderationStatus = moderationStatus
    }
  }

  handleMessage = (data) => {
    try {
      const parsed = JSON.parse(data)
      if (parsed.type === 'APPROVE') {
        const { msgId } = parsed
        const status = ModerationStatus.Approved
        this.setMessageModerationStatus(msgId, status)
        this.broadcast(this.formSetModerationStatusMessage(msgId, status))
      } else if (parsed.type === 'REJECT') {
        const { msgId } = parsed
        const status = ModerationStatus.Rejected
        this.setMessageModerationStatus(msgId, status)
        this.broadcast(this.formSetModerationStatusMessage(msgId, status))
      }
    } catch (e) {
      console.log("Got a moderation message that wasn't JSON: " + data)
    }
  }

  startServer() {
    this.wss = new WebSocketServer({ port: 7897 })

    this.wss.on('connection', (ws, request) => {
      const baseURL = 'http://' + request.headers.host + '/'
      const url = new URL(request.url, baseURL)

      const name = url.searchParams.get('name')
      const password = url.searchParams.get('password')

      if (password != 'hunter2') {
        ws.send('bad password')
        ws.close()
        return
      }

      console.log(
        `Got a new moderation connection from ${name}. Total: ${_.size(
          this.wss.clients
        )}`
      )
      ws.on('message', this.handleMessage)

      ws.on('close', () => {
        console.log('Moderation websocket closed for ' + name)
      })

      ws.send('hello from moderation server')
      ws.send(this.formEntireStateMessage())
    })
  }
}
