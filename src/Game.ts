import _ from 'lodash'
import FizzBuzz from './prompts/FizzBuzz'
import Prompt from './prompts/Prompt'
import Player from './Player'

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
  broadcastToAll: (data: any, options?: object) => {}

  public constructor(broadcastToAll) {
    this.broadcastToAll = broadcastToAll
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

  public getFullStateMessage(): object {
    const state = {
      type: 'STATE',
      gameState: this.currentState,
      players: this.getAllPlayerNames(),
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

    this.prompt = new FizzBuzz(this)

    const startMessage = this.formRoundStartMessage(
      this.prompt.prompt,
      this.prompt.duplicatesAllowed,
      this.prompt.timer
    )
    this.startTimer(this.prompt.timer)
    this.broadcastToAll(startMessage)
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
        // It's possible that moderation happened and caused the game to end.
        // It's also possible that some users evaded moderation, in which case
        // they're allowed to continue since it's the mods' fault. 😡
        if (this.shouldGameEnd()) {
          this.endRound()
        } else {
          this.startRound()
        }
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
