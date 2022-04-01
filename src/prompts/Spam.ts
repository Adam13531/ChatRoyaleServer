import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'
import Prompt from './Prompt'

export default class Spam extends Prompt {
  numMessages: number

  constructor(game: Game) {
    const numMessages = _.random(3, 4)
    const prompt = `Type exactly ${numMessages} messages.`
    const duplicatesAllowed = false
    const timer = 21
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

    this.numMessages = numMessages
  }

  // This function is done in POST-processing so that the player's message will
  // be recorded already.
  public postprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {
    const messagesFromThisPlayer = this.messagesTypedPerPlayer[sender.userId]

    if (
      !_.isNil(messagesFromThisPlayer) &&
      _.size(messagesFromThisPlayer) > this.numMessages
    ) {
      this.playerLost(sender, `You typed too many messages`)
    }
  }

  public timeIsUp(currentPlayers: Player[]) {
    _.forEach(currentPlayers, (player) => {
      const messagesTypedByThisPlayer =
        this.messagesTypedPerPlayer[player.userId]
      const numTyped = _.size(messagesTypedByThisPlayer)
      if (_.size(messagesTypedByThisPlayer) !== this.numMessages) {
        this.playerLost(player, `You only typed ${numTyped} message(s)`, false)
      }
    })
  }
}
