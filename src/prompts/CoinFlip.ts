import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

export default class CoinFlip extends Prompt {
  coinResult: string

  constructor(game: Game) {
    const coinResult = _.random(0, 1) === 0 ? 'heads' : 'tails'
    const prompt = `I have flipped a virtual coin. Is it heads or tails?`
    const duplicatesAllowed = true
    const timer = 10
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

    this.coinResult = coinResult
  }

  public preprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {
    // Be generous and allow them to type "head" or "tail"
    if (!message.toLowerCase().endsWith('s')) {
      message = message + 's'
    }
    if (message.toLowerCase() != this.coinResult) {
      this.playerLost(sender, `You guessed wrong`)
    }
  }
}
