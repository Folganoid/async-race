export interface IConfig {
    server: {
      path: string,
      garage: string,
      engine: string,
      winners: string,
    },

    pageParams : {
      garageCarsPage: number,
      winnersCarsPage: number
    },

    phrases: {
      start: string[],
      goodCar: string[],
      brokenCar: string[],
      reset: string[],
      crash: string[],
  },

  cars: {
      brands: string[],
      models: string[]
    }
}

export interface ICar {
  name: string,
  color: string,
  id: number
}

export interface IWinner {
    id: number,
    wins: number,
    time: number
}
