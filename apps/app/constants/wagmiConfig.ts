import { http, createConfig, Config, fallback } from 'wagmi'
import { polygonMumbai } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

export const wagmiConfig: Config = createConfig({
  chains: [polygonMumbai],
  connectors: [metaMask()],
  transports: {
    [polygonMumbai.id]: fallback([
      http('https://polygon-mumbai-pokt.nodies.app/'),
    ]),
  },
})