# Starship MCP server

## What it does

Automate starship setup process as much as possible

## Main steps

### 1. Install dependencies

```sh
npm install -g @starship-ci/cli

starship install
```

### 2. Setup with Docker Desktop

Enable Kubernetes in Docker Desktop:

- From the Docker Dashboard, select the Settings.
- Select **Kubernetes** from the left sidebar.
- Next to **Enable Kubernetes**, select the checkbox.
- Select **Apply & Restart** to save the settings and then click Install to confirm.

Connect with kubectl

```sh
# list of all the contexts
kubectl config get-contexts

# set the context to docker-desktop
kubectl config use-context docker-desktop
```

### 3. Add `config.yaml`

Add simple static content at the start.

Use AI to dynamically generate the content later according to the rules defined [here](https://docs.hyperweb.io/starship/config)

### 4. Add npm scripts (optional)

```json
  "scripts": {
    "starship": "starship --config starship/configs/config.yaml",
    "starship:test": "jest --config ./jest.starship.config.js --verbose --bail",
    "starship:debug": "jest --config ./jest.starship.config.js --runInBand --verbose --bail",
    "starship:watch": "jest --watch --config ./jest.starship.config.js"
  }
```

### 5. Run starship

```sh
starship start --config config.yaml

# check status
kubectl get pods
# OR
starship get-pods
# OR, to watch the pods
watch kubectl get pods
```

### 6. Interact with the chains

You can then interact with the chain on localhost at

- Osmosis: http://localhost:26653/status
- Cosmos: http://localhost:26657/status

And open up the explorer at http://localhost:8080

### 7. Cleanup

Once you are done with playing around, cleanup the resources with

```sh
# delete helm chart
starship stop --config config.yaml
# cleanup port forwarding
pkill -f "port-forward"
```

If you are using Docker Desktop for kubernetes cluster, please Disable it in Settings, Kubernetes.

## Scenarios

Existing setup level:

- No starship setup at all
- Partially setup starship
- Already have everything setup

Project:

- js/ts
- python
- go

Operating system:

- mac/linux
- windows

## Special considerations

- Provide instructions for setup for Docker Desktop manually
- Dynamically generate config.yaml content
- Tools execute order
- Write tests for tx/query
- Error handling
- Check existing setup
- Upgrade starship

## Tools (draft)

`check-starship-setup`:
Check existing project and identify missing setup steps, return setup info for further use.

`install-dependencies`:
Install all starship dependencies

`setup-docker-desktop`:
Setup docker desktop to enable kubernetes

`connect-kubectl`:
Run `kubectl config use-context docker-desktop`

`check-nodes`:
Run `kubectl get nodes`

`generate-config`:
Generate and add `config.yaml` to the project

`start-starship`:
Run `starship start --config config.yaml` or a npm script

`check-status`:
Run `kubectl get pods` or `starship get-pods`

`list-endpoints`:
Display the endpoints to interact with based on the config after successful running

`check-logs`:
Run the logs checking command (e.g. `kubectl logs osmosis-1-genesis-0`)

`stop-starship`:
Run `starship stop --config config.yaml` or a npm script
