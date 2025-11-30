use anchor_lang::prelude::*;
use anchor_lang::system_program;

// 1. Declare the Program ID (You will update this after your first build)
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod outland_escrow {
    use super::*;

    // --- INSTRUCTION 1: DEPOSIT ---
    // Player calls this to put money into the pot
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let tx = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.signer.key(),
            &ctx.accounts.vault.key(),
            amount,
        );
        
        anchor_lang::solana_program::program::invoke(
            &tx,
            &[
                ctx.accounts.signer.to_account_info(),
                ctx.accounts.vault.to_account_info(),
            ],
        )?;
        
        msg!("Deposit successful: {} lamports", amount);
        Ok(())
    }

    // --- INSTRUCTION 2: PAYOUT (ADMIN ONLY) ---
    // You call this to send money to the winner
    pub fn payout(ctx: Context<Payout>, amount: u64) -> Result<()> {
        // The vault pays the winner
        **ctx.accounts.vault.try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.winner.try_borrow_mut_lamports()? += amount;

        msg!("Payout successful: {} lamports sent to winner", amount);
        Ok(())
    }
}

// --- CONTEXTS (Validation Logic) ---

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub signer: Signer<'info>, // The Player
    
    // The Vault is a PDA seeded with "escrow"
    #[account(
        init_if_needed,
        payer = signer,
        space = 8, // No data, just holding SOL
        seeds = [b"escrow_vault"],
        bump
    )]
    pub vault: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Payout<'info> {
    #[account(mut)]
    pub admin: Signer<'info>, // YOU (Must sign to approve payout)
    
    /// CHECK: We just send money here, we don't read data
    #[account(mut)]
    pub winner: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"escrow_vault"],
        bump
    )]
    pub vault: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}