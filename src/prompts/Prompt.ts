import _ from 'lodash'
import Game from '../Game'
import Player from '../Player'

export default abstract class Prompt {
  public prompt: string
  public duplicatesAllowed: boolean
  public timer: number
  public requiresModeration: boolean
  protected allowOneAnswerPerPerson: boolean
  protected game: Game
  // Keys are the player's userId
  protected messagesTypedPerPlayer: Record<string, string[]> = {}
  protected messagesTypedByAnyone: Set<string> = new Set()

  constructor(
    game: Game,
    prompt: string,
    duplicatesAllowed: boolean,
    timer: number,
    allowOneAnswerPerPerson: boolean,
    requiresModeration: boolean
  ) {
    this.game = game
    this.prompt = prompt
    this.duplicatesAllowed = duplicatesAllowed
    this.timer = timer
    this.allowOneAnswerPerPerson = allowOneAnswerPerPerson
    this.requiresModeration = requiresModeration
  }

  public processChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {
    this.preprocessChatMessage(sender, tags, message)

    this.messagesTypedPerPlayer[sender.userId] = _.defaultTo(
      this.messagesTypedPerPlayer[sender.userId],
      []
    )
    const messagesTypedByThisPlayer = this.messagesTypedPerPlayer[sender.userId]
    if (this.allowOneAnswerPerPerson && !_.isEmpty(messagesTypedByThisPlayer)) {
      this.playerLost(sender, `You typed more than one message`)
    }

    messagesTypedByThisPlayer.push(message)

    if (
      !this.duplicatesAllowed &&
      this.messagesTypedByAnyone.has(message.toLowerCase())
    ) {
      this.playerLost(sender, `Your answer was not unique`)
    }
    this.messagesTypedByAnyone.add(message.toLowerCase())

    if (!sender.didLose()) {
      this.postprocessChatMessage(sender, tags, message)
    }
  }

  // Default implementation is to fail everyone who didn't type anything, then
  // subclasses can override this if they want.
  public timeIsUp(currentPlayers: Player[]) {
    _.forEach(currentPlayers, (player) => {
      const messagesTypedByThisPlayer =
        this.messagesTypedPerPlayer[player.userId]
      if (_.isEmpty(messagesTypedByThisPlayer)) {
        this.playerLost(player, `Time ran out`, false)
      }
    })
  }

  protected makePlayerLoseByName(playerName: string, reason: string) {
    this.game.playerLostByName(playerName, reason)
  }

  protected playerLost(
    player: Player,
    reason: string,
    endRoundIfOnePlayerRemains: boolean = true
  ) {
    this.game.playerLost(player, reason, endRoundIfOnePlayerRemains)
  }

  protected preprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {}

  protected postprocessChatMessage(
    sender: Player,
    tags: Record<string, any>,
    message: string
  ) {}
}
