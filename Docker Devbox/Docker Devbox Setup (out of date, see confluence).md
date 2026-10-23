Assuming Arch Linux, adapt as required

- install prerequisites
```sh
# Arch
sudo pacman -S tailscale docker docker-compose nvidia-container-toolkit go
# Ubuntu
sudo apt install golang # etc.
```
  
- set up tailscale
```sh
tailscale up
```

- set up docker config
```sh
sudo mkdir /etc/docker
sudo nano /ect/docker/daemon.json
```
```json
{ "insecure-registries":["cboost-c-nas:5180"] }
```
```sh
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker.service
```

- add user to the docker group
- THIS IS EXTREMELY UNSAFE, IT GIVES PASSWORDLESS ROOT ACCESS TO THE USER
- but VS Code requires it
```sh
sudo usermod -a -G docker [user]
```

- set up flexcompose
```sh
# if you don't have it already:
mkdir ~/.local/bin/
# then add it to your PATH
# when using fish shell, check fish_add_path -U

git clone git@github.com:Cboostbv/nl-cboost-sccots-docker-templates.git
cd nl-cboost-sccots-docker-templates/flexcompose-cli/

go build -o ~/.local/bin/flexcompose .
```

- clone the target repo
```sh
git clone git@github.com:Cboostbv/example-devbox-repo
```

- have a look at the flexcompose target options in [the docs](https://github.com/Cboostbv/nl-cboost-sccots-docker-templates/tree/dev/remove-ytt#quickstart) and generate the compose file
```sh
flexcompose generate --target [target] --os linux
```

- start and log in to the container
```sh
sudo docker compose -f compose.generated.yaml up -d
sudo docker compose -f compose.generated.yaml exec dev-box bash
```