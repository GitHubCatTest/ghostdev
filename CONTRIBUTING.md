# Contributing to GhostDev

Thank you for your interest in contributing to GhostDev! GhostDev is an open-source project dedicated to keeping developers' Macs running fast by reclaiming memory and CPU from abandoned dev servers and idle VMs.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/GitHubCatTest/ghostdev.git
   cd ghostdev
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development CLI:
   ```bash
   npm run dev -- scan
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Adding New Scanners

We welcome contributions to add detection for additional frameworks, runtimes, and VM providers!

- Dev server detection logic lives in `src/scanners/devServers.ts`.
- Virtual machine detection lives in `src/scanners/virtualMachines.ts`.
- Memory leak detection lives in `src/scanners/systemLeaks.ts`.

## Code Guidelines

- Keep it lightweight: No heavy native binaries or unnecessary runtime dependencies.
- Zero cost & privacy first: Never send system metrics or process data over the network.
- Safety first: Always ensure non-dev applications (browsers, editors, terminals) are protected from accidental termination.
