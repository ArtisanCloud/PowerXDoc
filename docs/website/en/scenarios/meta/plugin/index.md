# Plugin Ecosystem Scenarios

This document showcases the core scenarios of the PowerX Plugin development and distribution system.

## Publishing Modes

### 1️⃣ Local Debug Mode
**Purpose**: Enable developers to quickly validate plugin functionality and interfaces in a local environment.

**Process**:
1. Build plugin using `px-plugin` in the PowerXPlugin repository, generating compilation output directory (e.g., `dist/`)
2. Open **PowerX Web Admin** backend page (PowerX Core repository module)
3. Select "Install from Local Directory" in the plugin management area
4. System calls **PowerX Backend (px)** to complete plugin installation and activation
5. Plugin takes effect locally and can be directly debugged and modified

**Characteristics**:
- No dependency on Marketplace
- Suitable for development phase
- Efficient debugging with immediate feedback

### 2️⃣ Offline Package Upload Mode
**Purpose**: Used for plugin distribution in enterprise intranet or no-public-network scenarios.

**Process**:
1. Developer packages plugin using `px-plugin`, generating compressed package (e.g., `PowerXPluginNote-v1.0.0.zip`)
2. Log in to **PowerX Marketplace** management page
3. Select "Offline Installation Package Upload" feature
4. Upload plugin compressed package and fill in version information
5. System automatically extracts, verifies, and completes installation

**Characteristics**:
- Suitable for intranet environments
- Supports batch distribution
- Ideal for enterprise customization scenarios

### 3️⃣ Online Publishing Mode
**Purpose**: Public ecosystem plugin publishing and distribution.

**Process**:
1. Developer completes plugin development and testing
2. Use `px-plugin publish` command to publish to Marketplace
3. Fill in plugin information: name, description, version, icon, etc.
4. Submit for review (automated security checks + manual review)
5. After approval, listed on Marketplace
6. Users can directly search, install, and use

**Characteristics**:
- Public ecosystem distribution
- Standardized publishing process
- Supports version updates and rollbacks

## Development Tools

### CLI Tools
- **`px-plugin`** - Plugin development CLI
  - Plugin creation, building, debugging
  - Local testing, simulated running
  - Packaging, signing, publishing

- **`px-admin`** - Management backend CLI
  - Plugin management, start/stop control
  - Permission configuration, log viewing
  - Performance monitoring, diagnostic tools

- **`px-market`** - Marketplace management CLI
  - Plugin listing, version management
  - Sales data, revenue statistics
  - Review process, quality monitoring

## Technical Architecture

### Plugin Development Stack
- **Language**: Based on PowerXPlugin SDK
- **Framework**: Supports multiple frontend/backend tech stacks
- **Interface**: Standardized plugin interface protocols
- **Security**: Plugin signing, sandbox isolation

### Distribution Mechanisms
- **Local Mode**: Direct file system loading
- **Offline Mode**: Compressed package upload and installation
- **Online Mode**: Marketplace ecosystem distribution
