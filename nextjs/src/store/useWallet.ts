
import { isLoggedIn } from '@/actions/login'
import { create } from 'zustand'

interface WalletDetails {
    isWalletConnected: boolean
    checkLogin: () => void
    setIsWalletConnected: (isWalletConnected: boolean) => void
}

const useWallet = create<WalletDetails>((set) => ({
    isWalletConnected: false,
    setIsWalletConnected: (isWalletConnected: boolean) => set({ isWalletConnected }),
    checkLogin: () => {
        isLoggedIn().then((loggedIn) => {
          set({ isWalletConnected: loggedIn });
        }).catch((error) => {
          console.error('Error checking login status:', error);
          set({ isWalletConnected: false });
        });
      },
}))

export default useWallet