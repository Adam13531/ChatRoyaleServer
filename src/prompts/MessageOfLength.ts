import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

export default class MessageOfLength extends Prompt {
  messageLength: number

  constructor(game: Game) {
    const messageLength = _.random(16, 100)
    const prompt = `Type a message exactly ${messageLength} characters long.`
    const duplicatesAllowed = false
    const timer = 20
    const allowOneAnswerPerPerson = true
    const requiresModeration = false
    super(
      game,
      prompt,
      duplicatesAllowed,
      timer,
      allowOneAnswerPerPerson,
      requiresModeration
    )

    this.messageLength = messageLength
  }

  public preprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {
    if (message.length != this.messageLength) {
      this.playerLost(
        sender,
        `Your message was ${message.length} character(s), not ${this.messageLength}`
      )
    }
  }
}
