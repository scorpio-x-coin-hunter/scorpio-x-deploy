const fs = require('fs');
const path = require('path');

class VaultKeeper {
  constructor(vaultFilePath) {
    this.vaultFilePath = vaultFilePath || path.join(__dirname, 'vault.json');
    this.vault = this.loadVault();
  }

  loadVault() {
    try {
      if (fs.existsSync(this.vaultFilePath)) {
        const data = fs.readFileSync(this.vaultFilePath, 'utf8');
        return JSON.parse(data);
      } else {
        // Initialize vault with empty accounts
        const initialVault = { accounts: {} };
        fs.writeFileSync(this.vaultFilePath, JSON.stringify(initialVault, null, 2));
        return initialVault;
      }
    } catch (error) {
      console.error('Error loading vault:', error);
      return { accounts: {} };
    }
  }

  saveVault() {
    try {
      fs.writeFileSync(this.vaultFilePath, JSON.stringify(this.vault, null, 2));
    } catch (error) {
      console.error('Error saving vault:', error);
    }
  }

  createAccount(accountId) {
    if (!this.vault.accounts[accountId]) {
      this.vault.accounts[accountId] = {
        balance: 0,
        transactions: []
      };
      this.saveVault();
      return true;
    }
    return false; // Account already exists
  }

  getBalance(accountId) {
    if (this.vault.accounts[accountId]) {
      return this.vault.accounts[accountId].balance;
    }
    return null; // Account not found
  }

  deposit(accountId, amount, description = 'Deposit') {
    if (!this.vault.accounts[accountId]) {
      this.createAccount(accountId);
    }
    this.vault.accounts[accountId].balance += amount;
    this.vault.accounts[accountId].transactions.push({
      type: 'deposit',
      amount,
      description,
      date: new Date().toISOString()
    });
    this.saveVault();
    return this.vault.accounts[accountId].balance;
  }

  withdraw(accountId, amount, description = 'Withdrawal') {
    if (!this.vault.accounts[accountId]) {
      return false; // No account
    }
    if (this.vault.accounts[accountId].balance >= amount) {
      this.vault.accounts[accountId].balance -= amount;
      this.vault.accounts[accountId].transactions.push({
        type: 'withdrawal',
        amount,
        description,
        date: new Date().toISOString()
      });
      this.saveVault();
      return true;
    }
    return false; // Insufficient funds
  }

  getTransactions(accountId, limit = 50) {
    if (this.vault.accounts[accountId]) {
      return this.vault.accounts[accountId].transactions.slice(-limit);
    }
    return null; // No account
  }
}

module.exports = VaultKeeper;