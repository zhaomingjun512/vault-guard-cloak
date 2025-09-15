import { Card } from "@/components/ui/card";
import { 
  Shield, 
  Users, 
  Clock, 
  Coins, 
  TrendingUp, 
  Lock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface VaultStatsProps {
  totalValue: string;
  activeProposals: number;
  completedProposals: number;
  signers: number;
  requiredSignatures: number;
}

export const VaultStats = ({
  totalValue,
  activeProposals,
  completedProposals,
  signers,
  requiredSignatures
}: VaultStatsProps) => {
  const stats = [
    {
      title: "Vault Balance",
      value: totalValue,
      icon: Coins,
      color: "text-primary",
      bg: "bg-primary/20",
      description: "Total funds under management"
    },
    {
      title: "Active Proposals",
      value: activeProposals.toString(),
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/20",
      description: "Pending governance decisions"
    },
    {
      title: "Executed Proposals",
      value: completedProposals.toString(),
      icon: CheckCircle,
      color: "text-success",
      bg: "bg-success/20",
      description: "Successfully completed"
    },
    {
      title: "Security Config",
      value: `${requiredSignatures}/${signers}`,
      icon: Shield,
      color: "text-encrypted",
      bg: "bg-encrypted/20",
      description: "Required signatures"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6 bg-security-gradient border-primary/20 hover:shadow-glow-primary transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {stat.description}
          </p>
        </Card>
      ))}
    </div>
  );
};