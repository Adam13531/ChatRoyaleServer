import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

export default class GottaGoFast extends Prompt {
  numWinners: number

  constructor(game: Game) {
    const numWinners = _.random(5, 10)
    const prompt = `Type whatever you want as long as you're one of the first ${numWinners} people to do so.`
    const duplicatesAllowed = true
    const timer = 12
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

    this.numWinners = numWinners
  }

  public postprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {
    const numPeopleWhoTyped = _.size(_.keys(this.messagesTypedPerPlayer))
    if (numPeopleWhoTyped > this.numWinners) {
      this.playerLost(sender, `You weren't fast enough`)
    }
  }
}
