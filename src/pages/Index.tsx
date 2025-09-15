import { useState, useEffect } from "react";
import { WalletConnect } from "@/components/WalletConnect";
import { ProposalCard } from "@/components/ProposalCard";
import { VaultStats } from "@/components/VaultStats";
import { SecurityIndicator } from "@/components/SecurityIndicator";
import { NewProposalDialog } from "@/components/NewProposalDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Shield, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import vaultHero from "@/assets/vault-hero.jpg";

// Mock data for demonstration
const mockProposals = [
  {
    id: "1",
    title: "Treasury Diversification",
    description: "Allocate 50 ETH to DeFi yield farming protocols",
    amount: "50.0 ETH",
    recipient: "0x1234567890abcdef1234567890abcdef12345678",
    requiredSigners: 3,
    currentSigners: 2,
    deadline: "Dec 20, 2024",
    status: "active" as const,
    votes: [
      { id: "v1", signer: "0x123...", encrypted: true },
      { id: "v2", signer: "0x456...", encrypted: true },
    ]
  },
  {
    id: "2", 
    title: "Security Audit Payment",
    description: "Payment for Q4 smart contract security audit",
    amount: "25.0 ETH",
    recipient: "0xabcdef1234567890abcdef1234567890abcdef12",
    requiredSigners: 3,
    currentSigners: 3,
    deadline: "Dec 15, 2024",
    status: "executed" as const,
    votes: [
      { id: "v3", signer: "0x123...", encrypted: false, revealed: "approve" as const },
      { id: "v4", signer: "0x456...", encrypted: false, revealed: "approve" as const },
      { id: "v5", signer: "0x789...", encrypted: false, revealed: "approve" as const },
    ]
  }
];

const Index = () => {
  const [connectedAddress, setConnectedAddress] = useState<string>("");
  const [proposals, setProposals] = useState(mockProposals);
  const { toast } = useToast();

  const handleVote = (proposalId: string, vote: 'approve' | 'reject') => {
    console.log(`Voted ${vote} on proposal ${proposalId}`);
    toast({
      title: "Vote Submitted",
      description: `Your ${vote} vote has been encrypted and submitted.`,
    });
  };

  const handleNewProposal = (data: any) => {
    const newProposal = {
      id: `proposal-${Date.now()}`,
      title: data.title,
      description: data.description,
      amount: `${data.amount} ${data.currency}`,
      recipient: data.recipient,
      requiredSigners: 3,
      currentSigners: 0,
      deadline: data.deadline.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      status: "active" as const,
      votes: []
    };
    
    setProposals(prev => [newProposal, ...prev]);
    toast({
      title: "Proposal Created",
      description: "Your proposal has been submitted for multisig approval.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-security-gradient">
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/40" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${vaultHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="relative container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Enterprise-Grade Security</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Multisig Security with<br />
              <span className="bg-vault-gradient bg-clip-text text-transparent">
                Encrypted Votes
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Revolutionary confidential voting system where signatures remain encrypted until quorum is reached, 
              ensuring completely unbiased governance decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-6 py-12 space-y-8">
        {/* Wallet Connection */}
        <WalletConnect onConnect={setConnectedAddress} />

        {/* Vault Statistics */}
        <VaultStats
          totalValue="1,247.3 ETH"
          activeProposals={1}
          completedProposals={12}
          signers={5}
          requiredSignatures={3}
        />

        {/* Security Status */}
        <SecurityIndicator
          encryptedVotes={2}
          totalVotes={5}
          quorumReached={false}
          securityLevel="high"
        />

        {/* Proposals Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Governance Proposals</h2>
              <p className="text-muted-foreground">Manage treasury operations with confidential voting</p>
            </div>
            
            {connectedAddress && (
              <NewProposalDialog onSubmit={handleNewProposal} />
            )}
          </div>

          <div className="grid gap-6">
            {proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                userAddress={connectedAddress}
                onVote={handleVote}
              />
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <Card className="p-8 bg-security-gradient border-primary/20 text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Lock className="h-5 w-5 text-encrypted" />
              <h3 className="text-lg font-semibold text-foreground">Confidential by Design</h3>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our advanced cryptographic system ensures that individual votes remain completely private 
              until the required number of signatures is collected, preventing vote manipulation and bias.
            </p>
          </div>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
