import _ from 'lodash'
import Prompt from './prompts/Prompt'
import Player from './Player'
import Moderation from './Moderation'
import PromptChooser from './prompts/PromptChooser'

enum GameState {
  Idle = 1, // waiting for a command to start things
  Lobby, // players can register themselves
  Round, // playing a round
  InBetween, // between rounds. Waiting for a command to start the next round.
  End, // The game is over
}

export default class Game {
  // TODO: uncomment this again so that we start in Idle
  // currentState: GameState = GameState.Idle
  currentState: GameState = GameState.Lobby
  // Keys are the player's userId
  allPlayers: Record<string, Player> = {}
  currentPlayers: Record<string, Player> = {}
  roundNumber: number = 0
  prompt: Prompt = null
  timerEndTime: number = 0
  roundTimerId: ReturnType<typeof setTimeout> = null
  moderation: Moderation
  promptChooser: PromptChooser
  broadcastToAll: (data: any, options?: object) => {}

  public constructor(broadcastToAll) {
    this.broadcastToAll = broadcastToAll
    this.promptChooser = new PromptChooser()
    this.moderation = new Moderation()
  }

  canAdvanceGameState() {
    return (
      this.currentState == GameState.Idle ||
      this.currentState == GameState.InBetween ||
      (this.currentState == GameState.Lobby && this.getNumTotalPlayers() > 1)
    )
  }

  getNumTotalPlayers() {
    return _.size(this.allPlayers)
  }

  public onChatMessage(tags: Record<string, any>, message: string) {
    const userId = tags['user-id']

    if (this.currentState == GameState.Lobby) {
      this.handleLobbyChatMessage(tags)
    } else if (this.currentState == GameState.Round) {
      const sender = this.allPlayers[userId]
      // Only process messages from players who are already being tracked (since
      // you can't join mid-game).
      if (sender && !sender.didLose()) {
        this.prompt.processChatMessage(sender, tags, message)
        // We send messages to the moderators regardless of whether the prompt
        // requires it. This is for very minor reasons, e.g. the ability to
        // disqualify cheaters/jerks even if they were technically correct. It
        // also gives the moderators something to look at.
        this.moderation.addMessage(sender, tags, message)
      }
    }
  }

  private isTrackingPlayer(userId: string) {
    return userId in this.allPlayers
  }

  public playerLost(
    player: Player,
    endRoundIfOnePlayerRemains: boolean = true
  ) {
    // A player can't lose if we're not tracking them or they already lost
    if (!this.isTrackingPlayer(player.userId) || player.didLose()) {
      return
    }

    delete this.currentPlayers[player.userId]
    this.allPlayers[player.userId].lostInRound = this.roundNumber

    console.log(`Player #${player.joinOrder} lost: ${player.displayName}`)
    this.broadcastToAll(this.formPlayerLostMessage(player.displayName))

    if (_.size(this.currentPlayers) <= 1 && endRoundIfOnePlayerRemains) {
      this.endRound()
    }
  }

  private getPlayersRemainingString(): string {
    const threshold = 100
    const numCurrentPlayers = _.size(this.currentPlayers)
    if (numCurrentPlayers == 0) return '(no players to list)'
    if (numCurrentPlayers > threshold)
      return `too many players to list (>${threshold} players)"`

    return _.map(this.currentPlayers, 'displayName')
  }

  public printStatus() {
    const numAllPlayers = _.size(this.allPlayers)
    const numCurrentPlayers = _.size(this.currentPlayers)
    const playersString = this.getPlayersRemainingString()
    let timerString = 'No timer running'
    if (this.roundTimerId) {
      const remainingTime = (this.timerEndTime - Date.now()) / 1000
      if (remainingTime > 0) {
        timerString = `${remainingTime}s remaining`
      } else {
        timerString = `${remainingTime}s over time`
      }
    }
    console.log(`---Game status---
Game state: ${this.getStateStringFromState(this.currentState)}
Players remaining: ${numCurrentPlayers} / ${numAllPlayers}
Timer: ${timerString}
Names: ${playersString}`)
  }

  private getAllPlayerNames(): string[] {
    return _.map(this.allPlayers, 'displayName')
  }

  private getLoserNames(): string[] {
    return _.map(
      _.filter(this.allPlayers, (player) => player.didLose()),
      'displayName'
    )
  }

  public getFullStateMessage(): object {
    const state = {
      type: 'STATE',
      gameState: this.currentState,
      players: this.getAllPlayerNames(),
      losers: this.getLoserNames(),
    }
    return state
  }

  // All chat messages sent in the lobby are considered to join the player to
  // the game.
  private handleLobbyChatMessage(tags: Record<string, any>) {
    // We only want to add them if we're not already tracking them.
    const userId = tags['user-id']
    if (this.isTrackingPlayer(userId)) {
      return
    }

    const sender = Player.PlayerFromTags(tags)

    const numPlayers = _.size(this.allPlayers)
    sender.joinOrder = numPlayers

    this.allPlayers[sender.userId] = sender
    this.currentPlayers[sender.userId] = sender

    console.log(`Player #${sender.joinOrder} joined: ${sender.displayName}`)
    this.broadcastToAll(this.formAddPlayerMessage(sender.displayName))
  }

  private shouldGameEnd() {
    const numRemainingPlayers = _.size(this.currentPlayers)
    return numRemainingPlayers <= 1
  }

  // Doles out the moderators' judgment. This is safe to call multiple times.
  // However, keep in mind that moderation can only DISQUALIFY a player, not
  // bring them back from a loss. So if a mod screwed up, then too bad.
  public processModeration() {
    if (this.shouldGameEnd()) {
      console.log('The game is already over. Not processing moderation.')
      return
    }

    console.log("Doling out the moderators' judgment. ☠")

    const peopleToDisqualify = this.moderation.getPeopleToDisqualify(
      this.prompt.requiresModeration
    )
    _.forEach(peopleToDisqualify, (userId) => {
      const player = this.allPlayers[userId]
      this.playerLost(player, false)
    })

    // Now that all players are processed, we can potentially end the game.
    if (this.shouldGameEnd()) {
      this.endRound()
    }

    console.log(`Done. Disqualified ${_.size(peopleToDisqualify)} player(s)`)
  }

  private endRound() {
    this.stopTimer()

    const numRemainingPlayers = _.size(this.currentPlayers)
    let winner: string = null
    if (numRemainingPlayers == 0) {
      // End with no winner
      this.currentState = GameState.End
    } else if (numRemainingPlayers == 1) {
      // End with a winner
      this.currentState = GameState.End
      const finalPlayer = _.first(_.values(this.currentPlayers))
      winner = finalPlayer.displayName
    } else {
      // Not at the end yet
      this.currentState = GameState.InBetween
    }

    this.broadcastToAll(this.formEndRoundMessage(this.currentState, winner))
  }

  private formEndRoundMessage(nextState: GameState, winner: string = null) {
    // The winner is only used if nextState is END, but I don't want to make two
    // separate messages out of laziness.
    return JSON.stringify({ type: 'ROUND_END', nextState, winner })
  }

  private formAddPlayerMessage(displayName: string) {
    return JSON.stringify({ type: 'ADD_PLAYER', player: displayName })
  }

  private formPlayerLostMessage(displayName: string) {
    return JSON.stringify({ type: 'PLAYER_LOST', player: displayName })
  }

  public getStateStringFromState(state: GameState): string {
    switch (state) {
      case GameState.Idle:
        return 'IDLE'
      case GameState.Lobby:
        return 'LOBBY'
      case GameState.Round:
        return 'ROUND'
      case GameState.InBetween:
        return 'INBETWEEN'
      case GameState.End:
        return 'END'
      default:
        return 'UNRECOGNIZED'
    }
  }

  private startRound() {
    this.currentState = GameState.Round

    const promptClass = this.promptChooser.choosePrompt()
    this.prompt = new promptClass(this)

    const startMessage = this.formRoundStartMessage(
      this.prompt.prompt,
      this.prompt.duplicatesAllowed,
      this.prompt.timer
    )
    this.startTimer(this.prompt.timer)
    this.broadcastToAll(startMessage)
    this.moderation.startNewRound(this.prompt)
  }

  private stopTimer() {
    if (this.roundTimerId != null) {
      clearTimeout(this.roundTimerId)
      this.roundTimerId = null
    }
  }

  private startTimer(timer: number) {
    this.stopTimer()
    const numMs = timer * 1000
    this.roundTimerId = setTimeout(this.roundTimeIsUp, numMs)
    this.timerEndTime = Date.now() + numMs
  }

  private roundTimeIsUp = () => {
    // Check the Prompt to see who lost by not typing anything
    this.prompt.timeIsUp(_.values(this.currentPlayers))
    this.endRound()
  }

  private formRoundStartMessage(
    prompt: string,
    duplicatesAllowed: boolean,
    time: number
  ) {
    return JSON.stringify({
      type: 'ROUND_START',
      prompt,
      duplicatesAllowed,
      time,
    })
  }

  public handleStartMessage() {
    if (!this.canAdvanceGameState()) {
      console.error(
        `Can't handle "start" message. currentState == ${
          this.currentState
        }, numTotalPlayers == ${this.getNumTotalPlayers()}`
      )
      return
    }

    const oldState = this.currentState

    switch (this.currentState) {
      case GameState.Idle:
        this.currentState = GameState.Lobby
        break
      case GameState.Lobby:
        this.startRound()
        break
      case GameState.InBetween:
        if (this.shouldGameEnd()) {
          this.endRound()
        } else {
          // Process moderation if it hasn't been done manually already.
          this.processModeration()

          // That may have ended the round, so don't start a new one if that
          // happened.
          if (!this.shouldGameEnd()) {
            this.startRound()
          }
        }
        break
      default:
        console.error(
          `Could start a round, but no handler exists for transitioning. currentState == ${this.currentState}`
        )
        return
    }

    console.error(
      `Handling "start"; GameState went from ${this.getStateStringFromState(
        oldState
      )} → ${this.getStateStringFromState(this.currentState)}`
    )
  }
}
