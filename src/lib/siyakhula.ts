/**
 * Siyakhula Program SDK
 *
 * AI-Verified Milestone-Based Crop Funding Platform on Solana
 * Program ID: 4k8UjX74M3hbkLugsJFypVrqMviKTQqt51Y715QLSghp
 */

import { BN, Program, Provider } from "@coral-xyz/anchor";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import IDL from "../idl/workspaceIDL.json";

// ============ Types ============

export interface FarmCampaignData {
  farmer: PublicKey;
  campaignId: string;
  cropType: string;
  fundingGoal: BN;
  totalRaised: BN;
  totalReleased: BN;
  milestoneCount: number;
  milestonesCompleted: number;
  status: number; // 0=Active, 1=Funded, 2=Harvested, 3=Failed
  profitSplitBps: number;
  seasonStart: BN;
  seasonEnd: BN;
  ipfsHash: string;
  investorCount: number;
  bump: number;
}

export interface InvestmentData {
  investor: PublicKey;
  campaign: PublicKey;
  amount: BN;
  claimed: boolean;
  bump: number;
}

export interface MilestoneData {
  campaign: PublicKey;
  index: number;
  name: string;
  releaseBps: number;
  verified: boolean;
  verifiedAt: BN;
  aiProofHash: string;
  bump: number;
}

export interface ProgramConfigData {
  authority: PublicKey;
  insuranceDeductionBps: number;
  bump: number;
}

export interface InitCampaignParams {
  campaignId: string;
  cropType: string;
  fundingGoalSol: number;
  profitSplitBps: number;
  seasonStart: number; // unix timestamp
  seasonEnd: number;
  ipfsHash: string;
}

export interface InitMilestoneParams {
  campaignAddress: PublicKey;
  index: number;
  name: string;
  releaseBps: number;
}

export interface InvestParams {
  campaignAddress: PublicKey;
  amountSol: number;
}

export interface SDKResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============ SDK ============

export class SiyakhulaSDK {
  private readonly provider: Provider;
  private readonly program: Program<any>;

  constructor(provider: Provider) {
    this.provider = provider;
    this.program = new Program(IDL as any, this.provider);
  }

  // ============ Helpers ============

  private safeBN(value: any, defaultValue: number | string = 0): BN {
    if (value === null || value === undefined) return new BN(defaultValue);
    if (value instanceof BN) return value;
    if (typeof value === "number") {
      if (isNaN(value) || !isFinite(value)) return new BN(defaultValue);
      return new BN(Math.floor(value).toString());
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "") return new BN(defaultValue);
      try {
        return new BN(Math.floor(parseFloat(trimmed)).toString());
      } catch {
        return new BN(defaultValue);
      }
    }
    return new BN(defaultValue);
  }

  private safeBNToNumber(value: any, defaultValue: number = 0): number {
    try {
      return value && typeof value.toNumber === "function" ? value.toNumber() : defaultValue;
    } catch {
      if (value && typeof value.toString === "function") {
        const parsed = parseInt(value.toString());
        return isNaN(parsed) ? defaultValue : parsed;
      }
      return defaultValue;
    }
  }

  private solToLamports(sol: number): BN {
    return this.safeBN(Math.floor(sol * LAMPORTS_PER_SOL));
  }

  lamportsToSol(lamports: BN): number {
    return this.safeBNToNumber(lamports, 0) / LAMPORTS_PER_SOL;
  }

  private async getPDA(
    seeds: (string | PublicKey | Buffer | Uint8Array)[],
    programId?: PublicKey
  ): Promise<[PublicKey, number]> {
    const seedBuffers = seeds.map((seed) => {
      if (typeof seed === "string") return Buffer.from(seed, "utf8");
      if (seed instanceof PublicKey) return seed.toBuffer();
      if (seed instanceof Uint8Array) return Buffer.from(seed);
      return seed;
    });
    return PublicKey.findProgramAddressSync(
      seedBuffers,
      programId || this.program.programId
    );
  }

  private async testConnection(): Promise<boolean> {
    try {
      if (!this.provider?.connection) return false;
      const { value } = await this.provider.connection.getLatestBlockhashAndContext("finalized");
      return !!(value && value.blockhash);
    } catch {
      return false;
    }
  }

  /** Derive the global config PDA */
  async getConfigPDA(): Promise<[PublicKey, number]> {
    return this.getPDA(["config"]);
  }

  /** Derive a campaign PDA */
  async getCampaignPDA(farmer: PublicKey, campaignId: string): Promise<[PublicKey, number]> {
    return this.getPDA(["campaign", farmer, campaignId]);
  }

  /** Derive an investment PDA */
  async getInvestmentPDA(campaign: PublicKey, investor: PublicKey): Promise<[PublicKey, number]> {
    return this.getPDA(["investment", campaign, investor]);
  }

  /** Derive a milestone PDA */
  async getMilestonePDA(campaign: PublicKey, index: number): Promise<[PublicKey, number]> {
    return this.getPDA(["milestone", campaign, Buffer.from([index])]);
  }

  // ============ Instructions ============

  /** Initialize the program config. Only needs to be called once. */
  async initializeConfig(insuranceDeductionBps: number): Promise<SDKResult<{ signature: string; configAddress: string }>> {
    if (!this.provider.publicKey) return { success: false, error: "Wallet not connected" };

    try {
      if (!(await this.testConnection())) return { success: false, error: "Network unavailable" };

      const [configPDA] = await this.getConfigPDA();

      const tx = await this.program.methods
        .initializeConfig(insuranceDeductionBps)
        .accounts({
          config: configPDA,
          authority: this.provider.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return {
        success: true,
        data: { signature: tx, configAddress: configPDA.toString() },
      };
    } catch (error) {
      console.error("initializeConfig error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to initialize config",
      };
    }
  }

  /** Farmer creates a new campaign */
  async initializeCampaign(params: InitCampaignParams): Promise<SDKResult<{ signature: string; campaignAddress: string }>> {
    if (!this.provider.publicKey) return { success: false, error: "Wallet not connected" };

    try {
      if (!(await this.testConnection())) return { success: false, error: "Network unavailable" };

      if (!params.campaignId?.trim()) return { success: false, error: "Campaign ID required" };
      if (params.fundingGoalSol <= 0) return { success: false, error: "Funding goal must be > 0" };
      if (params.profitSplitBps < 1000 || params.profitSplitBps > 9000)
        return { success: false, error: "Profit split must be between 10% and 90%" };

      const [campaignPDA] = await this.getCampaignPDA(this.provider.publicKey, params.campaignId);
      const fundingGoalLamports = this.solToLamports(params.fundingGoalSol);

      const tx = await this.program.methods
        .initializeCampaign(
          params.campaignId,
          params.cropType || "Maize",
          fundingGoalLamports,
          params.profitSplitBps,
          this.safeBN(params.seasonStart),
          this.safeBN(params.seasonEnd),
          params.ipfsHash || ""
        )
        .accounts({
          campaign: campaignPDA,
          farmer: this.provider.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return {
        success: true,
        data: { signature: tx, campaignAddress: campaignPDA.toString() },
      };
    } catch (error) {
      console.error("initializeCampaign error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create campaign",
      };
    }
  }

  /** Create a milestone for a campaign (must be called 6 times) */
  async initializeMilestone(params: InitMilestoneParams): Promise<SDKResult<{ signature: string; milestoneAddress: string }>> {
    if (!this.provider.publicKey) return { success: false, error: "Wallet not connected" };

    try {
      if (!(await this.testConnection())) return { success: false, error: "Network unavailable" };

      const [milestonePDA] = await this.getMilestonePDA(params.campaignAddress, params.index);

      const tx = await this.program.methods
        .initializeMilestone(params.index, params.name, params.releaseBps)
        .accounts({
          milestone: milestonePDA,
          campaign: params.campaignAddress,
          farmer: this.provider.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return {
        success: true,
        data: { signature: tx, milestoneAddress: milestonePDA.toString() },
      };
    } catch (error) {
      console.error("initializeMilestone error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create milestone",
      };
    }
  }

  /** Initialize all 6 maize milestones for a campaign */
  async initializeAllMilestones(campaignAddress: PublicKey): Promise<SDKResult<{ signatures: string[] }>> {
    const milestones = [
      { index: 0, name: "Land Preparation", releaseBps: 1500 },
      { index: 1, name: "Planting", releaseBps: 2000 },
      { index: 2, name: "Seedling Phase", releaseBps: 2000 },
      { index: 3, name: "Vegetative Growth", releaseBps: 1500 },
      { index: 4, name: "Tasseling", releaseBps: 1500 },
      { index: 5, name: "Harvest Complete", releaseBps: 1500 },
    ];

    const signatures: string[] = [];
    for (const ms of milestones) {
      const result = await this.initializeMilestone({
        campaignAddress,
        index: ms.index,
        name: ms.name,
        releaseBps: ms.releaseBps,
      });
      if (!result.success) return { success: false, error: `Milestone ${ms.index} failed: ${result.error}` };
      signatures.push(result.data!.signature);
    }

    return { success: true, data: { signatures } };
  }

  /** Investor deposits SOL into a campaign */
  async invest(params: InvestParams): Promise<SDKResult<{ signature: string }>> {
    if (!this.provider.publicKey) return { success: false, error: "Wallet not connected" };

    try {
      if (!(await this.testConnection())) return { success: false, error: "Network unavailable" };
      if (params.amountSol <= 0) return { success: false, error: "Amount must be > 0" };

      const [investmentPDA] = await this.getInvestmentPDA(params.campaignAddress, this.provider.publicKey);
      const amountLamports = this.solToLamports(params.amountSol);

      const tx = await this.program.methods
        .invest(amountLamports)
        .accounts({
          investment: investmentPDA,
          campaign: params.campaignAddress,
          investor: this.provider.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { success: true, data: { signature: tx } };
    } catch (error) {
      console.error("invest error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Investment failed",
      };
    }
  }

  /** Authority verifies a milestone with AI proof */
  async verifyMilestone(
    campaignAddress: PublicKey,
    milestoneAddress: PublicKey,
    farmerAddress: PublicKey,
    aiProofHash: string
  ): Promise<SDKResult<{ signature: string }>> {
    if (!this.provider.publicKey) return { success: false, error: "Wallet not connected" };

    try {
      if (!(await this.testConnection())) return { success: false, error: "Network unavailable" };

      const [configPDA] = await this.getConfigPDA();

      const tx = await this.program.methods
        .verifyMilestone(aiProofHash)
        .accounts({
          config: configPDA,
          campaign: campaignAddress,
          milestone: milestoneAddress,
          farmer: farmerAddress,
          authority: this.provider.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { success: true, data: { signature: tx } };
    } catch (error) {
      console.error("verifyMilestone error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Milestone verification failed",
      };
    }
  }

  /** Mark campaign as harvested (all milestones must be complete) */
  async completeHarvest(campaignAddress: PublicKey): Promise<SDKResult<{ signature: string }>> {
    if (!this.provider.publicKey) return { success: false, error: "Wallet not connected" };

    try {
      if (!(await this.testConnection())) return { success: false, error: "Network unavailable" };

      const [configPDA] = await this.getConfigPDA();

      const tx = await this.program.methods
        .completeHarvest()
        .accounts({
          config: configPDA,
          campaign: campaignAddress,
          authority: this.provider.publicKey,
        })
        .rpc();

      return { success: true, data: { signature: tx } };
    } catch (error) {
      console.error("completeHarvest error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Harvest completion failed",
      };
    }
  }

  /** Trigger loss sharing when crop fails */
  async triggerLossSharing(
    campaignAddress: PublicKey,
    farmerAddress: PublicKey
  ): Promise<SDKResult<{ signature: string }>> {
    if (!this.provider.publicKey) return { success: false, error: "Wallet not connected" };

    try {
      if (!(await this.testConnection())) return { success: false, error: "Network unavailable" };

      const [configPDA] = await this.getConfigPDA();

      const tx = await this.program.methods
        .triggerLossSharing()
        .accounts({
          config: configPDA,
          campaign: campaignAddress,
          farmer: farmerAddress,
          authority: this.provider.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { success: true, data: { signature: tx } };
    } catch (error) {
      console.error("triggerLossSharing error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Loss sharing trigger failed",
      };
    }
  }

  /** Investor withdraws funds (refund if unfunded, proportional if failed) */
  async withdrawInvestment(
    campaignAddress: PublicKey,
    investmentAddress: PublicKey
  ): Promise<SDKResult<{ signature: string }>> {
    if (!this.provider.publicKey) return { success: false, error: "Wallet not connected" };

    try {
      if (!(await this.testConnection())) return { success: false, error: "Network unavailable" };

      const [configPDA] = await this.getConfigPDA();

      const tx = await this.program.methods
        .withdrawInvestment()
        .accounts({
          config: configPDA,
          campaign: campaignAddress,
          investment: investmentAddress,
          investor: this.provider.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { success: true, data: { signature: tx } };
    } catch (error) {
      console.error("withdrawInvestment error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Withdrawal failed",
      };
    }
  }

  // ============ Account Fetchers ============

  /** Fetch config account */
  async fetchConfig(): Promise<SDKResult<ProgramConfigData>> {
    try {
      const [configPDA] = await this.getConfigPDA();
      const account = await this.program.account.programConfig.fetch(configPDA);
      return { success: true, data: account as unknown as ProgramConfigData };
    } catch (error) {
      if (error instanceof Error && error.message.includes("Account does not exist")) {
        return { success: false, error: "Config not initialized. Please initialize first." };
      }
      return { success: false, error: "Failed to fetch config" };
    }
  }

  /** Fetch a single campaign */
  async fetchCampaign(address: PublicKey): Promise<SDKResult<FarmCampaignData>> {
    try {
      const account = await this.program.account.farmCampaign.fetch(address);
      return { success: true, data: account as unknown as FarmCampaignData };
    } catch (error) {
      return { success: false, error: "Campaign not found" };
    }
  }

  /** Fetch all campaigns */
  async fetchAllCampaigns(): Promise<SDKResult<Array<{ publicKey: PublicKey; account: FarmCampaignData }>>> {
    try {
      if (!(await this.testConnection())) return { success: false, error: "Network unavailable" };

      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 15000));
      const fetchPromise = this.program.account.farmCampaign.all();

      let allCampaigns: any[];
      try {
        allCampaigns = (await Promise.race([fetchPromise, timeout])) as any[];
      } catch (e) {
        if (e instanceof Error && e.message.includes("timeout")) {
          return { success: false, error: "Request timed out" };
        }
        throw e;
      }

      if (!allCampaigns?.length) return { success: true, data: [] };

      return {
        success: true,
        data: allCampaigns.map((c: any) => ({ publicKey: c.publicKey, account: c.account })),
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("Account does not exist")) {
        return { success: true, data: [] };
      }
      return { success: false, error: "Failed to fetch campaigns" };
    }
  }

  /** Fetch campaigns by farmer */
  async fetchCampaignsByFarmer(farmer?: PublicKey): Promise<SDKResult<Array<{ publicKey: PublicKey; account: FarmCampaignData }>>> {
    const target = farmer || this.provider.publicKey;
    if (!target) return { success: false, error: "No farmer provided" };

    const result = await this.fetchAllCampaigns();
    if (!result.success) return result;

    const filtered = (result.data || []).filter(
      (c) => c.account.farmer.toString() === target.toString()
    );
    return { success: true, data: filtered };
  }

  /** Fetch all investments for a campaign */
  async fetchInvestmentsByCampaign(campaign: PublicKey): Promise<SDKResult<Array<{ publicKey: PublicKey; account: InvestmentData }>>> {
    try {
      if (!(await this.testConnection())) return { success: false, error: "Network unavailable" };
      const all = await this.program.account.investment.all();
      if (!all?.length) return { success: true, data: [] };
      const filtered = all.filter((i: any) => i.account.campaign.toString() === campaign.toString());
      return { success: true, data: filtered.map((i: any) => ({ publicKey: i.publicKey, account: i.account })) };
    } catch {
      return { success: true, data: [] };
    }
  }

  /** Fetch investments by investor */
  async fetchInvestmentsByInvestor(investor?: PublicKey): Promise<SDKResult<Array<{ publicKey: PublicKey; account: InvestmentData }>>> {
    const target = investor || this.provider.publicKey;
    if (!target) return { success: false, error: "No investor provided" };

    try {
      const all = await this.program.account.investment.all();
      if (!all?.length) return { success: true, data: [] };
      const filtered = all.filter((i: any) => i.account.investor.toString() === target.toString());
      return { success: true, data: filtered.map((i: any) => ({ publicKey: i.publicKey, account: i.account })) };
    } catch {
      return { success: true, data: [] };
    }
  }

  /** Fetch milestones for a campaign */
  async fetchMilestonesByCampaign(campaign: PublicKey): Promise<SDKResult<MilestoneData[]>> {
    try {
      const all = await this.program.account.milestone.all();
      if (!all?.length) return { success: true, data: [] };
      const filtered = all
        .filter((m: any) => m.account.campaign.toString() === campaign.toString())
        .map((m: any) => m.account as unknown as MilestoneData)
        .sort((a: MilestoneData, b: MilestoneData) => a.index - b.index);
      return { success: true, data: filtered };
    } catch {
      return { success: true, data: [] };
    }
  }

  /** Fetch SOL balance */
  async fetchSolBalance(account?: PublicKey): Promise<SDKResult<number>> {
    const target = account || this.provider.publicKey;
    if (!target) return { success: false, error: "No account provided" };

    try {
      const balance = await this.program.provider.connection.getBalance(target);
      return { success: true, data: balance / LAMPORTS_PER_SOL };
    } catch {
      return { success: false, error: "Failed to fetch SOL balance" };
    }
  }

  /** Generate a unique campaign ID */
  generateCampaignId(): string {
    return `farm-${Date.now().toString(36)}`;
  }
}

export const CAMPAIGN_STATUS_LABELS: Record<number, string> = {
  0: "Active",
  1: "Funded",
  2: "Harvested",
  3: "Failed",
};
