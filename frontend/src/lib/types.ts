 export type Planting = {
  id: number
  city: string
  crop: string
  earnsReward: boolean
  date: string
  wallet?: string
 }

export interface WeatherData {
  city: string
  temperature: number
  condition: string
  icon: string
  humidity: number
  windSpeed: number
  rainChance: number
  forecast: {
    tomorrow: {
      condition: string
      rainChance: number
    }
  }
}

export interface FarmingAction {
  id: number
  date: string
  actionType: string
  weatherCondition: string
  temperature: number
  rewarded: boolean
  rewardAmount: number
  wallet: string 
}
