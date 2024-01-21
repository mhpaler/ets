import { http, createConfig, Config } from 'wagmi'
import { polygonMumbai } from 'wagmi/chains'

export const config: Config = createConfig({
  chains: [polygonMumbai],
  transports: {
    [polygonMumbai.id]: http(),
  },
})