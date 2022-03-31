import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

export default class Chatcatenation extends Prompt {
  previousMessage: string

  constructor(game: Game) {
    const prompt = `Add a single character to the last message typed. The first person to type can send any single character.`
    const duplicatesAllowed = false
    const timer = 40
    const allowOneAnswerPerPerson = false
    const requiresModeration = false
    super(
      game,
      prompt,
      duplicatesAllowed,
      timer,
      allowOneAnswerPerPerson,
      requiresModeration
    )

    this.previousMessage = ''
  }

  public preprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {
    const expectedMessageLength = this.previousMessage.length + 1
    if (message.length !== expectedMessageLength) {
      this.playerLost(
        sender,
        `Expected ${expectedMessageLength} character(s); you sent ${message.length}`
      )
      return
    }

    if (!message.startsWith(this.previousMessage)) {
      this.playerLost(
        sender,
        `Your message does not start with the previous one ("${this.previousMessage}")`
      )
      return
    }

    this.previousMessage = message
  }
}
