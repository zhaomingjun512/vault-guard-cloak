import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useAccount, useWalletClient } from 'wagmi';
import { contractFunctions, fheUtils } from '@/lib/contract';
import { toast } from 'sonner';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Wallet, 
  Shield, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  FileText,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

const proposalSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  amount: z.string().regex(/^\d+(\.\d+)?$/, "Amount must be a valid number"),
  currency: z.string().min(1, "Please select a currency"),
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  category: z.string().min(1, "Please select a category"),
  deadline: z.date({
    required_error: "Deadline is required",
  }),
  urgency: z.enum(["low", "medium", "high"]),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

interface NewProposalDialogProps {
  onSubmit: (data: ProposalFormData) => void;
  trigger?: React.ReactNode;
}

export const NewProposalDialog = ({ onSubmit, trigger }: NewProposalDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: "",
      currency: "",
      recipient: "",
      category: "",
      urgency: "medium",
    },
  });

  const handleSubmit = async (data: ProposalFormData) => {
    if (!isConnected || !walletClient) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);
    try {
      // Encrypt the required quorum using FHE
      const requiredQuorum = fheUtils.encryptValue(parseInt(data.amount) || 100);
      const inputProof = fheUtils.generateProof(requiredQuorum);

      // Create proposal on blockchain
      const txHash = await contractFunctions.createProposal(
        walletClient,
        data.title,
        data.description,
        requiredQuorum,
        inputProof
      );

      toast.success(`Proposal created successfully! Transaction: ${txHash}`);
      onSubmit(data);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to submit proposal:", error);
      toast.error("Failed to create proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          High Priority
        </Badge>;
      case "medium":
        return <Badge variant="outline" className="flex items-center gap-1 border-warning text-warning">
          <Clock className="h-3 w-3" />
          Medium Priority
        </Badge>;
      case "low":
        return <Badge variant="outline" className="flex items-center gap-1 border-muted text-muted-foreground">
          <CheckCircle className="h-3 w-3" />
          Low Priority
        </Badge>;
    }
  };

  const defaultTrigger = (
    <Button className="bg-vault-gradient hover:shadow-glow-primary">
      <Plus className="h-4 w-4 mr-2" />
      New Proposal
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-security-gradient border-primary/20">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Create New Proposal
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Submit a new governance proposal for multisig approval. All votes will remain encrypted until quorum is reached.
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card className="p-4 bg-card/50 border-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Proposal Details
              </h3>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Treasury Diversification Strategy"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Brief, descriptive title for the proposal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed explanation of the proposal, including rationale and expected outcomes..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comprehensive description of what this proposal aims to achieve
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select proposal category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="treasury">Treasury Management</SelectItem>
                          <SelectItem value="investment">Investment Strategy</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="governance">Governance</SelectItem>
                          <SelectItem value="security">Security & Audit</SelectItem>
                          <SelectItem value="infrastructure">Infrastructure</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Financial Details */}
            <Card className="p-4 bg-card/50 border-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="0.0"
                            type="number"
                            step="0.001"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="USDT">USDT</SelectItem>
                          <SelectItem value="DAI">DAI</SelectItem>
                          <SelectItem value="WBTC">WBTC</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="recipient"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Recipient Address
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0x..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Ethereum address that will receive the funds
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* Timeline & Priority */}
            <Card className="p-4 bg-card/50 border-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline & Priority
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Voting Deadline</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When voting should close
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How urgently this proposal needs attention
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("urgency") && (
                <div className="mt-3">
                  {getUrgencyBadge(form.watch("urgency"))}
                </div>
              )}
            </Card>

            {/* Security Notice */}
            <Alert className="border-encrypted/30 bg-encrypted/10">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Confidential Voting:</strong> Your vote will be encrypted and remain private until 
                the required number of signatures is collected. This ensures unbiased decision-making.
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-vault-gradient hover:shadow-glow-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Creating Proposal...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Proposal
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};