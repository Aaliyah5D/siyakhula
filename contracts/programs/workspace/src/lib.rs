use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("4k8UjX74M3hbkLugsJFypVrqMviKTQqt51Y715QLSghp");

#[program]
pub mod workspace {
    use super::*;

    // insurance_deduction_bps: u16, Insurance deduction in basis points, 1000 = 10%
    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        insurance_deduction_bps: u16,
    ) -> Result<()> {
        require!(insurance_deduction_bps <= 10000, ErrorCode::InvalidParameter);
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.insurance_deduction_bps = insurance_deduction_bps;
        config.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn initialize_campaign(
        ctx: Context<InitializeCampaign>,
        campaign_id: String,
        crop_type: String,
        funding_goal: u64,
        profit_split_bps: u16,
        season_start: i64,
        season_end: i64,
        ipfs_hash: String,
    ) -> Result<()> {
        require!(campaign_id.len() <= 32, ErrorCode::InvalidParameter);
        require!(crop_type.len() <= 32, ErrorCode::InvalidParameter);
        require!(ipfs_hash.len() <= 128, ErrorCode::InvalidParameter);
        require!(funding_goal > 0, ErrorCode::InvalidAmount);
        require!(profit_split_bps <= 10000, ErrorCode::InvalidParameter);
        require!(season_end > season_start, ErrorCode::InvalidParameter);

        let campaign = &mut ctx.accounts.campaign;
        campaign.farmer = ctx.accounts.farmer.key();
        campaign.campaign_id = campaign_id;
        campaign.crop_type = crop_type;
        campaign.funding_goal = funding_goal;
        campaign.total_raised = 0;
        campaign.total_released = 0;
        campaign.milestone_count = 6;
        campaign.milestones_completed = 0;
        campaign.status = 0; // Active
        campaign.profit_split_bps = profit_split_bps;
        campaign.season_start = season_start;
        campaign.season_end = season_end;
        campaign.ipfs_hash = ipfs_hash;
        campaign.investor_count = 0;
        campaign.bump = ctx.bumps.campaign;
        Ok(())
    }

    pub fn initialize_milestone(
        ctx: Context<InitializeMilestone>,
        index: u8,
        name: String,
        release_bps: u16,
    ) -> Result<()> {
        require!(name.len() <= 64, ErrorCode::InvalidParameter);
        require!(index < 6, ErrorCode::InvalidParameter);
        require!(release_bps <= 10000, ErrorCode::InvalidParameter);

        let milestone = &mut ctx.accounts.milestone;
        milestone.campaign = ctx.accounts.campaign.key();
        milestone.index = index;
        milestone.name = name;
        milestone.release_bps = release_bps;
        milestone.verified = false;
        milestone.verified_at = 0;
        milestone.ai_proof_hash = String::new();
        milestone.bump = ctx.bumps.milestone;
        Ok(())
    }

    pub fn invest(ctx: Context<Invest>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        let campaign = &ctx.accounts.campaign;
        require!(
            campaign.status == 0 || campaign.status == 1,
            ErrorCode::CampaignNotActive
        );

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.investor.to_account_info(),
                    to: ctx.accounts.campaign.to_account_info(),
                },
            ),
            amount,
        )?;

        let investment = &mut ctx.accounts.investment;
        investment.investor = ctx.accounts.investor.key();
        investment.campaign = ctx.accounts.campaign.key();
        investment.amount = amount;
        investment.claimed = false;
        investment.bump = ctx.bumps.investment;

        let campaign = &mut ctx.accounts.campaign;
        campaign.total_raised = campaign
            .total_raised
            .checked_add(amount)
            .ok_or(ErrorCode::MathOverflow)?;
        campaign.investor_count = campaign
            .investor_count
            .checked_add(1)
            .ok_or(ErrorCode::MathOverflow)?;

        if campaign.total_raised >= campaign.funding_goal {
            campaign.status = 1; // Funded
        }
        Ok(())
    }

    pub fn verify_milestone(ctx: Context<VerifyMilestone>, ai_proof_hash: String) -> Result<()> {
        require!(ai_proof_hash.len() <= 128, ErrorCode::InvalidParameter);
        let milestone = &ctx.accounts.milestone;
        require!(!milestone.verified, ErrorCode::AlreadyVerified);

        let campaign = &ctx.accounts.campaign;
        require!(
            campaign.status == 1 || campaign.status == 0,
            ErrorCode::CampaignNotActive
        );

        let release_amount = (campaign.total_raised as u128)
            .checked_mul(milestone.release_bps as u128)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(10000u128)
            .ok_or(ErrorCode::MathOverflow)? as u64;

        let farmer_key = campaign.farmer;
        let campaign_id = campaign.campaign_id.clone();
        let bump = campaign.bump;

        let campaign_info = ctx.accounts.campaign.to_account_info();
        let farmer_info = ctx.accounts.farmer.to_account_info();

        if release_amount > 0 {
            let signer_seeds: &[&[u8]] = &[
                b"campaign",
                farmer_key.as_ref(),
                campaign_id.as_bytes(),
                &[bump],
            ];

            **campaign_info.try_borrow_mut_lamports()? = campaign_info
                .lamports()
                .checked_sub(release_amount)
                .ok_or(ErrorCode::InsufficientFunds)?;
            **farmer_info.try_borrow_mut_lamports()? = farmer_info
                .lamports()
                .checked_add(release_amount)
                .ok_or(ErrorCode::MathOverflow)?;

            let _ = signer_seeds;
        }

        let milestone = &mut ctx.accounts.milestone;
        milestone.verified = true;
        milestone.verified_at = Clock::get()?.unix_timestamp;
        milestone.ai_proof_hash = ai_proof_hash;

        let campaign = &mut ctx.accounts.campaign;
        campaign.milestones_completed = campaign
            .milestones_completed
            .checked_add(1)
            .ok_or(ErrorCode::MathOverflow)?;
        campaign.total_released = campaign
            .total_released
            .checked_add(release_amount)
            .ok_or(ErrorCode::MathOverflow)?;

        Ok(())
    }

    pub fn complete_harvest(ctx: Context<CompleteHarvest>) -> Result<()> {
        let campaign = &ctx.accounts.campaign;
        require!(campaign.milestones_completed == 6, ErrorCode::MilestonesIncomplete);
        require!(
            campaign.status == 1 || campaign.status == 0,
            ErrorCode::CampaignNotActive
        );

        let campaign = &mut ctx.accounts.campaign;
        campaign.status = 2; // Harvested
        Ok(())
    }

    pub fn trigger_loss_sharing(ctx: Context<TriggerLossSharing>) -> Result<()> {
        let campaign = &ctx.accounts.campaign;
        require!(
            campaign.status == 0 || campaign.status == 1,
            ErrorCode::CampaignNotActive
        );

        let remaining = campaign
            .total_raised
            .checked_sub(campaign.total_released)
            .ok_or(ErrorCode::MathOverflow)?;

        let config = &ctx.accounts.config;
        let farmer_compensation = (remaining as u128)
            .checked_mul(config.insurance_deduction_bps as u128)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(10000u128)
            .ok_or(ErrorCode::MathOverflow)? as u64;

        let farmer_key = campaign.farmer;
        let campaign_id = campaign.campaign_id.clone();
        let bump = campaign.bump;

        let campaign_info = ctx.accounts.campaign.to_account_info();
        let farmer_info = ctx.accounts.farmer.to_account_info();

        if farmer_compensation > 0 {
            let rent_exempt = Rent::get()?.minimum_balance(campaign_info.data_len());
            let available = campaign_info
                .lamports()
                .checked_sub(rent_exempt)
                .ok_or(ErrorCode::InsufficientFunds)?;
            let transfer_amount = farmer_compensation.min(available);

            if transfer_amount > 0 {
                **campaign_info.try_borrow_mut_lamports()? = campaign_info
                    .lamports()
                    .checked_sub(transfer_amount)
                    .ok_or(ErrorCode::InsufficientFunds)?;
                **farmer_info.try_borrow_mut_lamports()? = farmer_info
                    .lamports()
                    .checked_add(transfer_amount)
                    .ok_or(ErrorCode::MathOverflow)?;
            }

            let _ = (farmer_key, campaign_id, bump);
        }

        let campaign = &mut ctx.accounts.campaign;
        campaign.status = 3; // Failed
        Ok(())
    }

    pub fn withdraw_investment(ctx: Context<WithdrawInvestment>) -> Result<()> {
        let investment = &ctx.accounts.investment;
        require!(!investment.claimed, ErrorCode::AlreadyClaimed);

        let campaign = &ctx.accounts.campaign;
        let inv_amount = investment.amount;

        let withdraw_amount = if campaign.status == 0 && campaign.total_raised < campaign.funding_goal {
            inv_amount
        } else if campaign.status == 3 {
            let remaining_after_release = campaign
                .total_raised
                .checked_sub(campaign.total_released)
                .ok_or(ErrorCode::MathOverflow)?;

            let config = &ctx.accounts.config;
            let farmer_comp = (remaining_after_release as u128)
                .checked_mul(config.insurance_deduction_bps as u128)
                .ok_or(ErrorCode::MathOverflow)?
                .checked_div(10000u128)
                .ok_or(ErrorCode::MathOverflow)? as u64;

            let pool_for_investors = remaining_after_release
                .checked_sub(farmer_comp)
                .ok_or(ErrorCode::MathOverflow)?;

            (pool_for_investors as u128)
                .checked_mul(inv_amount as u128)
                .ok_or(ErrorCode::MathOverflow)?
                .checked_div(campaign.total_raised as u128)
                .ok_or(ErrorCode::MathOverflow)? as u64
        } else {
            return Err(ErrorCode::WithdrawNotAllowed.into());
        };

        if withdraw_amount > 0 {
            let campaign_info = ctx.accounts.campaign.to_account_info();
            let investor_info = ctx.accounts.investor.to_account_info();

            let rent_exempt = Rent::get()?.minimum_balance(campaign_info.data_len());
            let available = campaign_info
                .lamports()
                .checked_sub(rent_exempt)
                .ok_or(ErrorCode::InsufficientFunds)?;
            let transfer_amount = withdraw_amount.min(available);

            if transfer_amount > 0 {
                **campaign_info.try_borrow_mut_lamports()? = campaign_info
                    .lamports()
                    .checked_sub(transfer_amount)
                    .ok_or(ErrorCode::InsufficientFunds)?;
                **investor_info.try_borrow_mut_lamports()? = investor_info
                    .lamports()
                    .checked_add(transfer_amount)
                    .ok_or(ErrorCode::MathOverflow)?;
            }
        }

        let investment = &mut ctx.accounts.investment;
        investment.claimed = true;
        Ok(())
    }
}

// ==================== CONTEXT STRUCTS ====================

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        seeds = [b"config"],
        bump,
        payer = authority,
        space = 8 + ProgramConfig::LEN
    )]
    pub config: Account<'info, ProgramConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(campaign_id: String)]
pub struct InitializeCampaign<'info> {
    #[account(
        init,
        seeds = [b"campaign", farmer.key().as_ref(), campaign_id.as_bytes()],
        bump,
        payer = farmer,
        space = 8 + FarmCampaign::LEN
    )]
    pub campaign: Account<'info, FarmCampaign>,
    #[account(mut)]
    pub farmer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(index: u8)]
pub struct InitializeMilestone<'info> {
    #[account(
        init,
        seeds = [b"milestone", campaign.key().as_ref(), &[index]],
        bump,
        payer = farmer,
        space = 8 + Milestone::LEN
    )]
    pub milestone: Account<'info, Milestone>,
    #[account(
        mut,
        has_one = farmer @ ErrorCode::Unauthorized,
    )]
    pub campaign: Account<'info, FarmCampaign>,
    #[account(mut)]
    pub farmer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Invest<'info> {
    #[account(
        init,
        seeds = [b"investment", campaign.key().as_ref(), investor.key().as_ref()],
        bump,
        payer = investor,
        space = 8 + Investment::LEN
    )]
    pub investment: Account<'info, Investment>,
    #[account(mut)]
    pub campaign: Account<'info, FarmCampaign>,
    #[account(mut)]
    pub investor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyMilestone<'info> {
    #[account(
        seeds = [b"config"],
        bump = config.bump,
        has_one = authority @ ErrorCode::Unauthorized,
    )]
    pub config: Account<'info, ProgramConfig>,
    #[account(
        mut,
        has_one = farmer @ ErrorCode::Unauthorized,
    )]
    pub campaign: Account<'info, FarmCampaign>,
    #[account(
        mut,
        constraint = milestone.campaign == campaign.key() @ ErrorCode::InvalidParameter,
        constraint = !milestone.verified @ ErrorCode::AlreadyVerified,
    )]
    pub milestone: Account<'info, Milestone>,
    /// CHECK: Verified via campaign.farmer constraint
    #[account(mut)]
    pub farmer: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteHarvest<'info> {
    #[account(
        seeds = [b"config"],
        bump = config.bump,
        has_one = authority @ ErrorCode::Unauthorized,
    )]
    pub config: Account<'info, ProgramConfig>,
    #[account(mut)]
    pub campaign: Account<'info, FarmCampaign>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct TriggerLossSharing<'info> {
    #[account(
        seeds = [b"config"],
        bump = config.bump,
        has_one = authority @ ErrorCode::Unauthorized,
    )]
    pub config: Account<'info, ProgramConfig>,
    #[account(
        mut,
        has_one = farmer @ ErrorCode::Unauthorized,
    )]
    pub campaign: Account<'info, FarmCampaign>,
    /// CHECK: Verified via campaign.farmer constraint
    #[account(mut)]
    pub farmer: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawInvestment<'info> {
    #[account(
        seeds = [b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, ProgramConfig>,
    #[account(mut)]
    pub campaign: Account<'info, FarmCampaign>,
    #[account(
        mut,
        constraint = investment.campaign == campaign.key() @ ErrorCode::InvalidParameter,
        constraint = investment.investor == investor.key() @ ErrorCode::Unauthorized,
        constraint = !investment.claimed @ ErrorCode::AlreadyClaimed,
    )]
    pub investment: Account<'info, Investment>,
    #[account(mut)]
    pub investor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// ==================== ACCOUNT STRUCTS ====================

#[account]
pub struct ProgramConfig {
    pub authority: Pubkey,
    pub insurance_deduction_bps: u16,
    pub bump: u8,
}

impl ProgramConfig {
    pub const LEN: usize = 32 + 2 + 1;
}

#[account]
pub struct FarmCampaign {
    pub farmer: Pubkey,
    pub campaign_id: String,
    pub crop_type: String,
    pub funding_goal: u64,
    pub total_raised: u64,
    pub total_released: u64,
    pub milestone_count: u8,
    pub milestones_completed: u8,
    pub status: u8,
    pub profit_split_bps: u16,
    pub season_start: i64,
    pub season_end: i64,
    pub ipfs_hash: String,
    pub investor_count: u32,
    pub bump: u8,
}

impl FarmCampaign {
    pub const LEN: usize = 32 + (4 + 32) + (4 + 32) + 8 + 8 + 8 + 1 + 1 + 1 + 2 + 8 + 8 + (4 + 128) + 4 + 1;
}

#[account]
pub struct Investment {
    pub investor: Pubkey,
    pub campaign: Pubkey,
    pub amount: u64,
    pub claimed: bool,
    pub bump: u8,
}

impl Investment {
    pub const LEN: usize = 32 + 32 + 8 + 1 + 1;
}

#[account]
pub struct Milestone {
    pub campaign: Pubkey,
    pub index: u8,
    pub name: String,
    pub release_bps: u16,
    pub verified: bool,
    pub verified_at: i64,
    pub ai_proof_hash: String,
    pub bump: u8,
}

impl Milestone {
    pub const LEN: usize = 32 + 1 + (4 + 64) + 2 + 1 + 8 + (4 + 128) + 1;
}

// ==================== ERROR CODES ====================

#[error_code]
pub enum ErrorCode {
    #[msg("Math overflow occurred")]
    MathOverflow,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid parameter")]
    InvalidParameter,
    #[msg("Campaign is not active")]
    CampaignNotActive,
    #[msg("Milestone already verified")]
    AlreadyVerified,
    #[msg("Not all milestones completed")]
    MilestonesIncomplete,
    #[msg("Investment already claimed")]
    AlreadyClaimed,
    #[msg("Withdrawal not allowed in current state")]
    WithdrawNotAllowed,
}
