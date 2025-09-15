import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAccount, useWalletClient } from 'wagmi';
import { contractFunctions, fheUtils } from '@/lib/contract';
import { toast } from 'sonner';
import { 
  Clock, 
  Users, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  Lock,
  Unlock
} from "lucide-react";
import { useState } from "react";

interface Vote {
  id: string;
  signer: string;
  encrypted: boolean;
  revealed?: 'approve' | 'reject';
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  amount: string;
  recipient: string;
  requiredSigners: number;
  currentSigners: number;
  deadline: string;
  status: 'active' | 'executed' | 'rejected';
  votes: Vote[];
}

interface ProposalCardProps {
  proposal: Proposal;
  userAddress?: string;
  onVote?: (proposalId: string, vote: 'approve' | 'reject') => void;
}

export const ProposalCard = ({ proposal, userAddress, onVote }: ProposalCardProps) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const progress = (proposal.currentSigners / proposal.requiredSigners) * 100;
  const isQuorumReached = proposal.currentSigners >= proposal.requiredSigners;
  const encryptedVotes = proposal.votes.filter(v => v.encrypted).length;
  const revealedVotes = proposal.votes.filter(v => v.revealed).length;

  const handleVote = async (vote: 'approve' | 'reject') => {
    if (!isConnected || !walletClient) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsVoting(true);
    try {
      // Encrypt the vote choice using FHE
      const voteChoice = fheUtils.encryptValue(vote === 'approve' ? 1 : 2);
      const inputProof = fheUtils.generateProof(voteChoice);

      // Cast vote on blockchain
      const txHash = await contractFunctions.castVote(
        walletClient,
        BigInt(proposal.id),
        voteChoice,
        inputProof
      );

      toast.success(`Vote cast successfully! Transaction: ${txHash}`);
      setHasVoted(true);
      onVote?.(proposal.id, vote);
    } catch (error) {
      console.error("Failed to cast vote:", error);
      toast.error("Failed to cast vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  const getStatusBadge = () => {
    switch (proposal.status) {
      case 'active':
        return (
          <Badge variant="outline" className="border-primary text-primary">
            <Clock className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'executed':
        return (
          <Badge variant="outline" className="border-success text-success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Executed
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="border-destructive text-destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  return (
    <Card className="p-6 bg-security-gradient border-primary/20 hover:border-primary/40 transition-all duration-300">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">{proposal.title}</h3>
            <p className="text-sm text-muted-foreground">{proposal.description}</p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-card/50 border border-border/50">
          <div>
            <span className="text-sm text-muted-foreground">Amount</span>
            <p className="font-mono font-semibold text-foreground">{proposal.amount}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Recipient</span>
            <p className="font-mono text-sm text-foreground">
              {proposal.recipient.slice(0, 6)}...{proposal.recipient.slice(-4)}
            </p>
          </div>
        </div>

        {/* Voting Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Signatures: {proposal.currentSigners} / {proposal.requiredSigners}
              </span>
            </div>
            {isQuorumReached ? (
              <Unlock className="h-4 w-4 text-success" />
            ) : (
              <Lock className="h-4 w-4 text-encrypted" />
            )}
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Vote Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <EyeOff className="h-3 w-3 text-encrypted" />
                <span className="text-encrypted">{encryptedVotes} encrypted</span>
              </div>
              {isQuorumReached && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-success" />
                  <span className="text-success">{revealedVotes} revealed</span>
                </div>
              )}
            </div>
            <span className="text-muted-foreground">Deadline: {proposal.deadline}</span>
          </div>
        </div>

        {/* Voting Actions */}
        {proposal.status === 'active' && userAddress && !hasVoted && (
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => handleVote('approve')}
              disabled={isVoting}
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isVoting ? 'Voting...' : 'Approve'}
            </Button>
            <Button
              onClick={() => handleVote('reject')}
              disabled={isVoting}
              variant="outline"
              className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {isVoting ? 'Voting...' : 'Reject'}
            </Button>
          </div>
        )}

        {hasVoted && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-encrypted/20 border border-encrypted/30">
            <Shield className="h-4 w-4 text-encrypted" />
            <span className="text-sm text-encrypted font-medium">
              Vote submitted and encrypted until quorum reached
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};