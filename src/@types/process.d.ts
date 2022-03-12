declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GAME_CHANNEL: string
      BOT_NAME: string
      BOT_OAUTH: string
    }
  }
}

export {}
