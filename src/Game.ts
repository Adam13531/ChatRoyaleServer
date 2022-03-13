import _ from 'lodash'
import FizzBuzz from './prompts/FizzBuzz'
import Prompt from './prompts/Prompt'

enum GameState {
  Idle = 1, // waiting for a command to start things
  Lobby, // players can register themselves
  Round, // playing a round
  InBetween, // between rounds. Waiting for a command to start the next round.
  End, // The game is over
}

export type Player = {
  displayName: string
  username: string
  isMod: boolean
  userId: string
  joinOrder: number
  lostInRound: number
}

function makePlayerFromTags(tags: Record<string, any>): Player {
  return {
    displayName: tags['display-name'] || tags.username,
    username: tags.username,
    isMod: tags.mod,
    userId: tags['user-id'],
    joinOrder: -1,
    lostInRound: -1,
  }
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
  roundTimerId: ReturnType<typeof setTimeout> = null
  broadcastToAll: (data: any, options?: object) => {}

  public constructor(broadcastToAll) {
    this.broadcastToAll = broadcastToAll
  }

  canAdvanceGameState() {
    return (
      this.currentState == GameState.Idle ||
      this.currentState == GameState.Lobby
    )
  }

  public onChatMessage(tags: Record<string, any>, message: string) {
    const userId = tags['user-id']

    if (this.currentState == GameState.Lobby) {
      this.handleLobbyChatMessage(tags)
    } else if (this.currentState == GameState.Round) {
      const sender = this.allPlayers[userId]
      // Only process messages from players who are already being tracked (since
      // you can't join mid-game).
      if (sender) {
        this.prompt.processChatMessage(sender, tags, message)
      }
    }
  }

  private isTrackingPlayer(userId: string) {
    return userId in this.allPlayers
  }

  public playerLost(player: Player) {
    // A player can't lose if we're not already tracking them
    if (!this.isTrackingPlayer(player.userId)) {
      return
    }

    delete this.currentPlayers[player.userId]
    this.allPlayers[player.userId].lostInRound = this.roundNumber

    console.log(`Player #${player.joinOrder} lost: ${player.displayName}`)
    this.broadcastToAll(this.formPlayerLostMessage(player.displayName))

    if (_.size(this.currentPlayers) <= 1) {
      this.endRound()
    }
  }

  private getPlayersRemainingString(): string {
    const threshold = 100
    const numCurrentPlayers = _.size(this.currentPlayers)
    if (numCurrentPlayers == 0) return '(no one has joined yet)'
    if (numCurrentPlayers > threshold)
      return `too many players to list (>${threshold} players)"`

    return _.map(this.currentPlayers, 'displayName')
  }

  public printStatus() {
    const numAllPlayers = _.size(this.allPlayers)
    const numCurrentPlayers = _.size(this.currentPlayers)
    const playersString = this.getPlayersRemainingString()
    console.log(`---Game status---
Game state: ${this.getStateStringFromState(this.currentState)}
Players remaining: ${numCurrentPlayers} / ${numAllPlayers}
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

    const sender = makePlayerFromTags(tags)

    const numPlayers = _.size(this.allPlayers)
    sender.joinOrder = numPlayers

    this.allPlayers[sender.userId] = sender
    this.currentPlayers[sender.userId] = sender

    console.log(`Player #${sender.joinOrder} joined: ${sender.displayName}`)
    this.broadcastToAll(this.formAddPlayerMessage(sender.displayName))
  }

  private endRound() {
    this.stopTimer()

    const numRemainingPlayers = _.size(this.currentPlayers)
    if (numRemainingPlayers == 0) {
      // TODO: no winner
    } else if (numRemainingPlayers == 1) {
      // TODO: a winner
    } else {
      // TODO: play another round
    }
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
    }
  }

  private startTimer(timer: number) {
    this.stopTimer()
    this.roundTimerId = setTimeout(this.roundTimeIsUp, timer * 1000)
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
        `Can't handle "start" message. currentState == ${this.currentState}`
      )
      return
    }

    const oldState = this.currentState

    switch (this.currentState) {
      case GameState.Idle:
        this.currentState = GameState.Lobby
        break
      case GameState.Lobby:
        this.currentState = GameState.Round
        this.startRound()
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
