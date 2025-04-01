# Starship MCP Tool - Automated Setup Guide

## Overview
This guide provides a step-by-step automation process for setting up Starship MCP. For each step, we'll first check if it's already completed, and if not, provide the commands or instructions to complete it, collect the info of each step and use it for the next steps.

## IMPORTANT RULES

### Execution Rules
When following this guide:
1. ALWAYS execute steps in the exact order specified
2. Do not skip steps even if you think they might be already completed
3. Do not add additional checks or steps not specified in the guide
4. Before executing any step, verify the previous step was completed successfully

### Behavior Rules
You have one mission: execute *exactly* what is requested.
For every step, use command line to complete it whenever possible, if not, instruct user to do it manually.

### Verification Rules
Before executing each step:
1. State the step number and description from the guide
2. Confirm it's the next step in sequence
3. Verify all previous steps were completed successfully

## Setup Flow
┌─ 1️⃣ Prerequisites Check (REQUIRED)
│   ├─ Run: npx @starship-ci/cli install
│   │  ✓ Docker
│   │  ✓ kubectl
│   │  ✓ Helm
│   │
│   └─ Verify Docker Running
│      ✓ Check Docker status
│      ✓ Start if needed
│
├─ 2️⃣ Project Setup
│   ├─ Package Installation
│   │  └─ pnpm/npm/yarn add --save-dev @starship-ci/cli
│   │
│   └─ Configuration
│      ├─ starship/config.yaml
│      └─ package.json scripts
│
└─ 3️⃣ Launch & Verify
    ├─ Start: pnpm run starship start
    └─ Verify: Check endpoints

====== Setup Steps Start ======

## 1️⃣ Prerequisites Check (REQUIRED)

### 1.1 Check Dependencies

Before proceeding with ANY other steps, you MUST run:
```bash
npx @starship-ci/cli install
```

This command will:
- Check if Docker is installed
- Check if kubectl is installed
- Check if Helm is installed
- Install kubectl and Helm if needed
- Inform you if Docker needs to be installed manually

If Docker needs to be installed manually:
- For macOS: Download and install Docker Desktop from https://www.docker.com/products/docker-desktop
- For Linux: Follow distribution-specific instructions (Ubuntu: `sudo apt-get install docker-ce docker-ce-cli containerd.io`)
- For Windows: Download and install Docker Desktop from https://www.docker.com/products/docker-desktop

After Docker installation, restart your terminal and run the install command again.

### 1.2 Verify Docker Running

Run this command to check if Docker daemon is running:
```bash
docker ps
```

If the command fails or shows an error, Docker needs to be started:
- For macOS: Run this command to start Docker Desktop:
  ```bash
  open -a Docker
  ```
- For Linux: Run this command to start Docker daemon:
  ```bash
  sudo systemctl start docker
  ```
- For Windows: Run this command to start Docker Desktop:
  ```bash
  start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
  ```

Wait about 5 seconds after starting Docker, then run `docker ps` again to verify it's running.

### 1.3 Enable Kubernetes

Run this command to check the available Kubernetes contexts:
```bash
kubectl config get-contexts
kubectl config current-context
```

If Kubernetes is not enabled, instruct user: 
"Please enable Kubernetes in Docker Desktop:
- Open Docker Desktop
- Go to Settings
- Select Kubernetes from the left sidebar
- Check 'Enable Kubernetes'
- Click 'Apply & Restart' and then 'Install' to confirm"

### 1.4 Set Docker Desktop as context 

Run this command to set Docker Desktop as the current Kubernetes context:
```bash
kubectl config use-context docker-desktop
```

Run this command to verify Kubernetes nodes are running:
```bash
kubectl get nodes
```

⚠️ DO NOT PROCEED until all prerequisite checks pass ⚠️

## 2️⃣ Project Setup

### 2.1 Check package manager and install dependencies (Required)
Check if package.json exists and determine the package manager (npm, yarn, or pnpm) by looking for lock files, remember the detected package manager and use it for the next steps.

If using pnpm (default):
```bash
pnpm add --save-dev @starship-ci/cli
```

If using yarn:
```bash
yarn add --dev @starship-ci/cli
```

If using npm:
```bash
npm install --save-dev @starship-ci/cli
```

### 2.2 Check if config.yaml exists and create it if it doesn't
Below is a basic config.yaml file, first check if it exists in the project (which might have different content), if it doesn't exist, add it to the root of the project under `starship/config.yaml` with the content below:

```yaml
name: starship-getting-started
 
chains:
  - id: osmosis-1
    name: osmosis
    numValidators: 1
    ports:
      rest: 1313
      rpc: 26653
  - id: gaia-1
    name: cosmoshub
    numValidators: 1
    ports:
      rest: 1317
      rpc: 26657
```

## 2.3 Add npm scripts

Check if relevant scripts exist in package.json. The script should look like this: `"starship": "starship --config starship/config.yaml"`.
If the above script is not in the `package.json` file, add it to the `scripts` section of the `package.json` file.

## 3️⃣ Launch & Verify

### 3.1 Start Starship

Run this command to start Starship:
```bash
pnpm run starship start
```

This step will take a while to complete. The successful output should look like this:
```bash
NAME                        READY   STATUS    RESTARTS   AGE
explorer-5dd48ffc8d-jrtsh   1/1     Running   0          37m
gaia-1-genesis-0            2/2     Running   0          37m
hermes-osmos-gaia-0         1/1     Running   0          37m
osmosis-1-genesis-0         2/2     Running   0          37m
registry-7f9f9f9f9f-2q2q2   1/1     Running   0          37m
```

### 3.2 Interact with the chains

#### Inform user about endpoints
The specific endpoints will depend on the config.yaml file, so read that first then determine the chains and endpoints, no need to check if the endpoints are working, just give the output which should look like this:

"You can now interact with the chains at:
- Osmosis: http://localhost:26653/status
- Cosmos: http://localhost:26657/status
- Explorer: http://localhost:8080"

#### Inform user how to cleanup
Tell the user if they want to stop Starship, they can run `pnpm run starship stop`.

====== Setup Steps End ======

## Error Handling

For each command execution, check the return code and provide appropriate error messages and recovery steps.

## Operating System Specific Instructions

### For macOS/Linux
- No additional steps required, all commands should work as-is

### For Windows
- Docker Desktop installation may differ
- Use PowerShell commands instead of bash
- Path separators will use backslashes instead of forward slashes

## Project Type Specific Instructions

### JavaScript/TypeScript
- Make sure Node.js and npm are installed
- Add the npm scripts to package.json

### Python/Go
- Skip the npm scripts step
- Execute starship commands directly 