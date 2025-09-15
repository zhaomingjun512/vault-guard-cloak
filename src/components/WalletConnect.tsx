import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Shield, CheckCircle } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
}

export const WalletConnect = ({ onConnect }: WalletConnectProps) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    disconnect();
    onConnect?.("");
  };

  return (
    <Card className="p-6 bg-security-gradient border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Wallet Connection</h3>
            <p className="text-sm text-muted-foreground">
              {isConnected ? "Connected as signer" : "Connect to participate in governance"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isConnected && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 border border-success/30">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm text-success font-medium">Connected</span>
            </div>
          )}
          
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== 'loading';
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus ||
                  authenticationStatus === 'authenticated');

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button onClick={openConnectModal} className="bg-vault-gradient hover:shadow-glow-primary">
                          <Shield className="h-4 w-4 mr-2" />
                          Connect Wallet
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <Button onClick={openChainModal} variant="destructive">
                          Wrong network
                        </Button>
                      );
                    }

                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground font-mono">
                          {account.displayName}
                        </span>
                        <Button variant="outline" size="sm" onClick={openAccountModal}>
                          Account
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </Card>
  );
};