import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Users, 
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface SecurityIndicatorProps {
  encryptedVotes: number;
  totalVotes: number;
  quorumReached: boolean;
  securityLevel: 'high' | 'medium' | 'low';
}

export const SecurityIndicator = ({
  encryptedVotes,
  totalVotes,
  quorumReached,
  securityLevel
}: SecurityIndicatorProps) => {
  const getSecurityBadge = () => {
    switch (securityLevel) {
      case 'high':
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            <Shield className="h-3 w-3 mr-1" />
            High Security
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Medium Security
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Low Security
          </Badge>
        );
    }
  };

  return (
    <Card className="p-6 bg-security-gradient border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Confidentiality Status
          </h3>
          {getSecurityBadge()}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-encrypted" />
              <span className="text-sm font-medium text-encrypted">Encrypted Votes</span>
            </div>
            <div className="text-2xl font-bold text-encrypted">{encryptedVotes}</div>
            <p className="text-xs text-muted-foreground">
              Votes hidden until quorum
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {quorumReached ? (
                <Eye className="h-4 w-4 text-success" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">Revealed Votes</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {quorumReached ? totalVotes - encryptedVotes : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {quorumReached ? "Votes now visible" : "Awaiting quorum"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-card/50 border border-border/50">
          <CheckCircle className={`h-4 w-4 ${quorumReached ? 'text-success' : 'text-muted-foreground'}`} />
          <span className="text-sm font-medium">
            {quorumReached 
              ? "Quorum reached - votes are now transparent" 
              : "Votes encrypted until quorum threshold met"
            }
          </span>
        </div>
      </div>
    </Card>
  );
};