import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Workspace } from "../target/types/workspace";
import { expect } from "chai";
import {
  PublicKey,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

describe("siyakhula", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Workspace as Program<Workspace>;

  let authority: Keypair;
  let farmer: Keypair;
  let investor1: Keypair;
  let investor2: Keypair;
  let configPDA: PublicKey;
  let campaignPDA: PublicKey;
  let campaignBump: number;

  const campaignId = "maize-2025-001";
  const cropType = "Maize";
  const fundingGoal = new BN(10 * LAMPORTS_PER_SOL);
  const profitSplitBps = 6000;
  const seasonStart = new BN(Math.floor(Date.now() / 1000));
  const seasonEnd = new BN(Math.floor(Date.now() / 1000) + 180 * 86400);
  const ipfsHash = "QmTestHash123456789abcdef";

  const milestoneNames = [
    "Land Preparation",
    "Planting",
    "Seedling Phase",
    "Vegetative Growth",
    "Tasseling",
    "Harvest Complete",
  ];
  const milestoneBps = [1500, 2000, 2000, 1500, 1500, 1500];

  before(async () => {
    authority = Keypair.generate();
    farmer = Keypair.generate();
    investor1 = Keypair.generate();
    investor2 = Keypair.generate();

    // Fund all accounts with 100 SOL
    for (const kp of [authority, farmer, investor1, investor2]) {
      const sig = await provider.connection.requestAirdrop(
        kp.publicKey,
        100 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);
    }

    [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    [campaignPDA, campaignBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("campaign"),
        farmer.publicKey.toBuffer(),
        Buffer.from(campaignId),
      ],
      program.programId
    );
  });

  // ==================== INITIALIZE CONFIG ====================
  it("Initialize Config", async () => {
    await program.methods
      .initializeConfig(1000)
      .accounts({
        config: configPDA,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    const config = await program.account.programConfig.fetch(configPDA);
    expect(config.authority.toBase58()).to.equal(
      authority.publicKey.toBase58()
    );
    expect(config.insuranceDeductionBps).to.equal(1000);
  });

  it("Fails to initialize config twice", async () => {
    try {
      await program.methods
        .initializeConfig(1000)
        .accounts({
          config: configPDA,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();
      expect.fail("Should have failed");
    } catch (error) {
      expect(error).to.exist;
    }
  });

  // ==================== INITIALIZE CAMPAIGN ====================
  it("Initialize Campaign", async () => {
    await program.methods
      .initializeCampaign(
        campaignId,
        cropType,
        fundingGoal,
        profitSplitBps,
        seasonStart,
        seasonEnd,
        ipfsHash
      )
      .accounts({
        campaign: campaignPDA,
        farmer: farmer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([farmer])
      .rpc();

    const campaign = await program.account.farmCampaign.fetch(campaignPDA);
    expect(campaign.farmer.toBase58()).to.equal(farmer.publicKey.toBase58());
    expect(campaign.campaignId).to.equal(campaignId);
    expect(campaign.cropType).to.equal(cropType);
    expect(campaign.fundingGoal.toString()).to.equal(fundingGoal.toString());
    expect(campaign.totalRaised.toString()).to.equal("0");
    expect(campaign.totalReleased.toString()).to.equal("0");
    expect(campaign.milestoneCount).to.equal(6);
    expect(campaign.milestonesCompleted).to.equal(0);
    expect(campaign.status).to.equal(0);
    expect(campaign.profitSplitBps).to.equal(profitSplitBps);
    expect(campaign.investorCount).to.equal(0);
  });

  it("Fails to create campaign with invalid parameters", async () => {
    try {
      const badId = "a".repeat(33); // exceeds 32 chars
      const [badPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("campaign"),
          farmer.publicKey.toBuffer(),
          Buffer.from(badId),
        ],
        program.programId
      );
      await program.methods
        .initializeCampaign(
          badId,
          cropType,
          fundingGoal,
          profitSplitBps,
          seasonStart,
          seasonEnd,
          ipfsHash
        )
        .accounts({
          campaign: badPDA,
          farmer: farmer.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([farmer])
        .rpc();
      expect.fail("Should have failed");
    } catch (error) {
      expect(error).to.exist;
    }
  });

  // ==================== INITIALIZE MILESTONES ====================
  it("Initialize all 6 milestones", async () => {
    for (let i = 0; i < 6; i++) {
      const [milestonePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("milestone"), campaignPDA.toBuffer(), Buffer.from([i])],
        program.programId
      );

      await program.methods
        .initializeMilestone(i, milestoneNames[i], milestoneBps[i])
        .accounts({
          milestone: milestonePDA,
          campaign: campaignPDA,
          farmer: farmer.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([farmer])
        .rpc();

      const milestone = await program.account.milestone.fetch(milestonePDA);
      expect(milestone.campaign.toBase58()).to.equal(campaignPDA.toBase58());
      expect(milestone.index).to.equal(i);
      expect(milestone.name).to.equal(milestoneNames[i]);
      expect(milestone.releaseBps).to.equal(milestoneBps[i]);
      expect(milestone.verified).to.be.false;
    }
  });

  it("Fails to create milestone with wrong farmer", async () => {
    try {
      const [milestonePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("milestone"), campaignPDA.toBuffer(), Buffer.from([6])],
        program.programId
      );
      await program.methods
        .initializeMilestone(6, "Bad Milestone", 1000)
        .accounts({
          milestone: milestonePDA,
          campaign: campaignPDA,
          farmer: investor1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([investor1])
        .rpc();
      expect.fail("Should have failed");
    } catch (error) {
      expect(error).to.exist;
    }
  });

  // ==================== INVEST ====================
  it("Investor 1 invests in campaign", async () => {
    const investAmount = new BN(6 * LAMPORTS_PER_SOL);
    const [investmentPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("investment"),
        campaignPDA.toBuffer(),
        investor1.publicKey.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .invest(investAmount)
      .accounts({
        investment: investmentPDA,
        campaign: campaignPDA,
        investor: investor1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([investor1])
      .rpc();

    const investment = await program.account.investment.fetch(investmentPDA);
    expect(investment.investor.toBase58()).to.equal(
      investor1.publicKey.toBase58()
    );
    expect(investment.amount.toString()).to.equal(investAmount.toString());
    expect(investment.claimed).to.be.false;

    const campaign = await program.account.farmCampaign.fetch(campaignPDA);
    expect(campaign.totalRaised.toString()).to.equal(investAmount.toString());
    expect(campaign.investorCount).to.equal(1);
    expect(campaign.status).to.equal(0); // Still Active
  });

  it("Investor 2 invests and campaign becomes Funded", async () => {
    const investAmount = new BN(5 * LAMPORTS_PER_SOL);
    const [investmentPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("investment"),
        campaignPDA.toBuffer(),
        investor2.publicKey.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .invest(investAmount)
      .accounts({
        investment: investmentPDA,
        campaign: campaignPDA,
        investor: investor2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([investor2])
      .rpc();

    const campaign = await program.account.farmCampaign.fetch(campaignPDA);
    expect(Number(campaign.totalRaised.toString())).to.be.greaterThanOrEqual(
      Number(fundingGoal.toString())
    );
    expect(campaign.investorCount).to.equal(2);
    expect(campaign.status).to.equal(1); // Funded
  });

  it("Fails to invest zero amount", async () => {
    try {
      const badInvestor = Keypair.generate();
      const sig = await provider.connection.requestAirdrop(
        badInvestor.publicKey,
        10 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);

      const [investmentPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("investment"),
          campaignPDA.toBuffer(),
          badInvestor.publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.methods
        .invest(new BN(0))
        .accounts({
          investment: investmentPDA,
          campaign: campaignPDA,
          investor: badInvestor.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([badInvestor])
        .rpc();
      expect.fail("Should have failed");
    } catch (error) {
      expect(error).to.exist;
    }
  });

  // ==================== VERIFY MILESTONES ====================
  it("Verify milestone 0 - Land Preparation", async () => {
    const [milestonePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("milestone"), campaignPDA.toBuffer(), Buffer.from([0])],
      program.programId
    );

    const farmerBefore = await provider.connection.getBalance(
      farmer.publicKey
    );

    await program.methods
      .verifyMilestone("QmAiProofHash_LandPrep_001")
      .accounts({
        config: configPDA,
        campaign: campaignPDA,
        milestone: milestonePDA,
        farmer: farmer.publicKey,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    const milestone = await program.account.milestone.fetch(milestonePDA);
    expect(milestone.verified).to.be.true;
    expect(milestone.aiProofHash).to.equal("QmAiProofHash_LandPrep_001");
    expect(Number(milestone.verifiedAt.toString())).to.be.greaterThan(0);

    const campaign = await program.account.farmCampaign.fetch(campaignPDA);
    expect(campaign.milestonesCompleted).to.equal(1);
    expect(Number(campaign.totalReleased.toString())).to.be.greaterThan(0);

    const farmerAfter = await provider.connection.getBalance(farmer.publicKey);
    expect(farmerAfter).to.be.greaterThan(farmerBefore);
  });

  it("Fails to verify already verified milestone", async () => {
    try {
      const [milestonePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("milestone"), campaignPDA.toBuffer(), Buffer.from([0])],
        program.programId
      );

      await program.methods
        .verifyMilestone("QmDuplicateProof")
        .accounts({
          config: configPDA,
          campaign: campaignPDA,
          milestone: milestonePDA,
          farmer: farmer.publicKey,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();
      expect.fail("Should have failed");
    } catch (error) {
      expect(error).to.exist;
    }
  });

  it("Fails to verify milestone with non-authority signer", async () => {
    try {
      const [milestonePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("milestone"), campaignPDA.toBuffer(), Buffer.from([1])],
        program.programId
      );

      await program.methods
        .verifyMilestone("QmBadAuth")
        .accounts({
          config: configPDA,
          campaign: campaignPDA,
          milestone: milestonePDA,
          farmer: farmer.publicKey,
          authority: investor1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([investor1])
        .rpc();
      expect.fail("Should have failed");
    } catch (error) {
      expect(error).to.exist;
    }
  });

  it("Verify milestones 1-5", async () => {
    for (let i = 1; i <= 5; i++) {
      const [milestonePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("milestone"), campaignPDA.toBuffer(), Buffer.from([i])],
        program.programId
      );

      await program.methods
        .verifyMilestone(`QmAiProofHash_Milestone_${i}`)
        .accounts({
          config: configPDA,
          campaign: campaignPDA,
          milestone: milestonePDA,
          farmer: farmer.publicKey,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      const milestone = await program.account.milestone.fetch(milestonePDA);
      expect(milestone.verified).to.be.true;
    }

    const campaign = await program.account.farmCampaign.fetch(campaignPDA);
    expect(campaign.milestonesCompleted).to.equal(6);
  });

  // ==================== COMPLETE HARVEST ====================
  it("Complete harvest after all milestones verified", async () => {
    await program.methods
      .completeHarvest()
      .accounts({
        config: configPDA,
        campaign: campaignPDA,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();

    const campaign = await program.account.farmCampaign.fetch(campaignPDA);
    expect(campaign.status).to.equal(2); // Harvested
  });

  it("Fails to complete harvest on already harvested campaign", async () => {
    try {
      await program.methods
        .completeHarvest()
        .accounts({
          config: configPDA,
          campaign: campaignPDA,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();
      expect.fail("Should have failed");
    } catch (error) {
      expect(error).to.exist;
    }
  });

  // ==================== LOSS SHARING SCENARIO ====================
  describe("Loss Sharing Scenario", () => {
    let farmer2: Keypair;
    let investor3: Keypair;
    let campaignPDA2: PublicKey;
    const campaignId2 = "maize-2025-fail";

    before(async () => {
      farmer2 = Keypair.generate();
      investor3 = Keypair.generate();

      for (const kp of [farmer2, investor3]) {
        const sig = await provider.connection.requestAirdrop(
          kp.publicKey,
          100 * LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(sig);
      }

      [campaignPDA2] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("campaign"),
          farmer2.publicKey.toBuffer(),
          Buffer.from(campaignId2),
        ],
        program.programId
      );

      // Create campaign
      await program.methods
        .initializeCampaign(
          campaignId2,
          "Maize",
          new BN(5 * LAMPORTS_PER_SOL),
          6000,
          seasonStart,
          seasonEnd,
          "QmFailCampaignHash"
        )
        .accounts({
          campaign: campaignPDA2,
          farmer: farmer2.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([farmer2])
        .rpc();

      // Invest
      const [investmentPDA3] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("investment"),
          campaignPDA2.toBuffer(),
          investor3.publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.methods
        .invest(new BN(5 * LAMPORTS_PER_SOL))
        .accounts({
          investment: investmentPDA3,
          campaign: campaignPDA2,
          investor: investor3.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([investor3])
        .rpc();
    });

    it("Trigger loss sharing on failed campaign", async () => {
      const farmerBefore = await provider.connection.getBalance(
        farmer2.publicKey
      );

      await program.methods
        .triggerLossSharing()
        .accounts({
          config: configPDA,
          campaign: campaignPDA2,
          farmer: farmer2.publicKey,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      const campaign = await program.account.farmCampaign.fetch(campaignPDA2);
      expect(campaign.status).to.equal(3); // Failed

      const farmerAfter = await provider.connection.getBalance(
        farmer2.publicKey
      );
      expect(farmerAfter).to.be.greaterThan(farmerBefore);
    });

    it("Investor withdraws from failed campaign", async () => {
      const [investmentPDA3] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("investment"),
          campaignPDA2.toBuffer(),
          investor3.publicKey.toBuffer(),
        ],
        program.programId
      );

      const investorBefore = await provider.connection.getBalance(
        investor3.publicKey
      );

      await program.methods
        .withdrawInvestment()
        .accounts({
          config: configPDA,
          campaign: campaignPDA2,
          investment: investmentPDA3,
          investor: investor3.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([investor3])
        .rpc();

      const investment = await program.account.investment.fetch(investmentPDA3);
      expect(investment.claimed).to.be.true;

      const investorAfter = await provider.connection.getBalance(
        investor3.publicKey
      );
      expect(investorAfter).to.be.greaterThan(investorBefore);
    });

    it("Fails to withdraw twice", async () => {
      try {
        const [investmentPDA3] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("investment"),
            campaignPDA2.toBuffer(),
            investor3.publicKey.toBuffer(),
          ],
          program.programId
        );

        await program.methods
          .withdrawInvestment()
          .accounts({
            config: configPDA,
            campaign: campaignPDA2,
            investment: investmentPDA3,
            investor: investor3.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([investor3])
          .rpc();
        expect.fail("Should have failed");
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  // ==================== REFUND SCENARIO ====================
  describe("Refund Scenario (Active, not fully funded)", () => {
    let farmer3: Keypair;
    let investor4: Keypair;
    let campaignPDA3: PublicKey;
    const campaignId3 = "maize-2025-refund";

    before(async () => {
      farmer3 = Keypair.generate();
      investor4 = Keypair.generate();

      for (const kp of [farmer3, investor4]) {
        const sig = await provider.connection.requestAirdrop(
          kp.publicKey,
          100 * LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(sig);
      }

      [campaignPDA3] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("campaign"),
          farmer3.publicKey.toBuffer(),
          Buffer.from(campaignId3),
        ],
        program.programId
      );

      await program.methods
        .initializeCampaign(
          campaignId3,
          "Maize",
          new BN(20 * LAMPORTS_PER_SOL),
          6000,
          seasonStart,
          seasonEnd,
          "QmRefundHash"
        )
        .accounts({
          campaign: campaignPDA3,
          farmer: farmer3.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([farmer3])
        .rpc();

      const [investmentPDA4] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("investment"),
          campaignPDA3.toBuffer(),
          investor4.publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.methods
        .invest(new BN(2 * LAMPORTS_PER_SOL))
        .accounts({
          investment: investmentPDA4,
          campaign: campaignPDA3,
          investor: investor4.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([investor4])
        .rpc();
    });

    it("Investor withdraws full refund from active unfunded campaign", async () => {
      const [investmentPDA4] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("investment"),
          campaignPDA3.toBuffer(),
          investor4.publicKey.toBuffer(),
        ],
        program.programId
      );

      const investorBefore = await provider.connection.getBalance(
        investor4.publicKey
      );

      await program.methods
        .withdrawInvestment()
        .accounts({
          config: configPDA,
          campaign: campaignPDA3,
          investment: investmentPDA4,
          investor: investor4.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([investor4])
        .rpc();

      const investment = await program.account.investment.fetch(investmentPDA4);
      expect(investment.claimed).to.be.true;

      const investorAfter = await provider.connection.getBalance(
        investor4.publicKey
      );
      expect(investorAfter).to.be.greaterThan(investorBefore);
    });
  });
});
