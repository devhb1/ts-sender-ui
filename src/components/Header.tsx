import { FaGithub } from 'react-icons/fa'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/cyfrin/Devhb1"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600 transition-colors"
        >
          <FaGithub size={24} />
        </a>
        <h1 className="text-2xl font-bold text-gray-800">Tsender CU Project</h1>
      </div>
      <ConnectButton />
    </header>
  )
}

// 04 - This file defines the header component of the application, which
//  includes a link to the GitHub repository and a wallet connection button.