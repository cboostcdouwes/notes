#!/bin/bash
# End-to-end run of this example: two service repos (example_app, example_driver: packages under source/, a Dockerfile
# each, both using the package repo example_common) and the integration repo of their machine. It builds a service's
# image without the integration repo, sets up each service's dev box, then locks, releases and runs the release as a
# machine would. The repos are served by a local git daemon.
# Needs on PATH: flexcompose, cdr, vcs (vcs2l), docker with buildx; the Docker bridge at 172.17.0.1; the base image
# cboost-c-nas:5100/cboost-ros2-jazzy:0.2.0; and nl-cboost-ros-tools/tools (CDR_TOOLS) for the stand-in base image.
# Usage: ./test.sh SCRATCH_DIR   (a new folder, or an earlier scratch folder of this test)
set -euo pipefail
S=$(realpath -m "${1:?usage: $0 SCRATCH_DIR}")
HERE=$(cd "$(dirname "$0")" && pwd)
CDR_TOOLS=${CDR_TOOLS:-$HOME/Cboost/nl-cboost-ros-tools/tools}
PORT=${PORT:-9419}
GIT_URL=git://172.17.0.1:$PORT
BASE=example-base:0.3.0
REGISTRY=cboost-c-nas:5100
MACHINE=$S/machine/releases
G=(git -c user.name=test -c user.email=test@example.com -c commit.gpgsign=false -c tag.gpgsign=false)
fails=0
step() { echo; echo "=== $*"; }
run() { echo "\$ $*"; eval "$@"; }
check() { if eval "$2"; then echo "PASS $1"; else echo "FAIL $1"; fails=$((fails + 1)); fi; }

cleanup() {
  [ -f "$S/gitd.pid" ] && kill "$(cat "$S/gitd.pid")" 2>/dev/null
  [ -n "${SSH_AGENT_PID:-}" ] && ssh-agent -k >/dev/null
  [ -f "$S/example_integration/compose.generated.yaml" ] &&
    (cd "$S/example_integration" && docker compose -f compose.generated.yaml down -v >/dev/null 2>&1)
  [ -L "$MACHINE/current" ] && (cd "$MACHINE/current" && docker compose -f compose.release.yaml down >/dev/null 2>&1)
  docker image rm example-app-alone $REGISTRY/example-app:1.0.0 $REGISTRY/example-driver:1.0.0 >/dev/null 2>&1 || true
}

# serve NAME DIR: commit DIR as a new repo on main and serve it as $GIT_URL/NAME.
serve() {
  (cd "$2" && git init -q -b main && git add -A && "${G[@]}" commit -qm "$1")
  git clone -q --bare "$2" "$S/git/$1.git"
}

# repos_file FILE NAME...: a dependencies.repos naming the fixture repos, each following main.
repos_file() {
  local f=$1 name; shift
  echo "repositories:" > "$f"
  for name in "$@"; do printf '  %s:\n    type: git\n    url: %s/%s\n    version: main\n' "$name" "$GIT_URL" "$name" >> "$f"; done
}

# py_package DIR NAME [USES]: a Python package NAME in DIR/NAME whose node hello prints a greeting: its own, or the
# one of the package USES.
py_package() {
  local P=$1/$2 uses=${3:-}
  mkdir -p "$P/$2" "$P/resource"; touch "$P/resource/$2"
  cat > "$P/package.xml" <<X
<?xml version="1.0"?>
<package format="3">
  <name>$2</name><version>1.0.0</version><description>Example.</description>
  <maintainer email="test@example.com">test</maintainer><license>Proprietary</license>
  ${uses:+<depend>$uses</depend>}
  <exec_depend>rclpy</exec_depend>
  <export><build_type>ament_python</build_type></export>
</package>
X
  printf '[develop]\nscript_dir=$base/lib/%s\n[install]\ninstall_scripts=$base/lib/%s\n' "$2" "$2" > "$P/setup.cfg"
  cat > "$P/setup.py" <<X
from setuptools import setup
setup(name='$2', version='1.0.0', packages=['$2'],
      data_files=[('share/ament_index/resource_index/packages', ['resource/$2']), ('share/$2', ['package.xml'])],
      entry_points={'console_scripts': ['hello = $2.hello:main']})
X
  if [ -n "$uses" ]; then
    touch "$P/$2/__init__.py"
    printf 'from %s import greeting\n\n\ndef main():\n    print("%s says:", greeting())\n' "$uses" "$2" > "$P/$2/hello.py"
  else
    printf 'def greeting():\n    return "hello from %s"\n' "$2" > "$P/$2/__init__.py"
    printf 'from %s import greeting\n\n\ndef main():\n    print(greeting())\n' "$2" > "$P/$2/hello.py"
  fi
}

# service_repo NAME: a service repo from the starter service/, with the package NAME_node under source/.
service_repo() {
  local F=$S/fixtures/$1
  cp -r "$HERE/service" "$F"
  py_package "$F/source" "$1_node" example_common
  repos_file "$F/dependencies.repos" example_common
}

# box SERVICE CMD: run CMD in that service's dev box, as cboost-user in ~/workspaces, with ROS sourced.
box() {
  (cd "$S/example_integration" && docker compose -f compose.generated.yaml exec -T "$1" bash -c \
    "source /opt/ros/\$ROS_DISTRO/setup.bash && cd ~/workspaces && $2")
}

if [ -e "$S" ] && [ ! -f "$S/.test-scratch" ]; then
  echo "$S exists but is not an earlier scratch folder of this test: pass a new folder." >&2
  exit 1
fi
for tool in flexcompose cdr vcs docker; do
  command -v "$tool" >/dev/null || { echo "$tool is not on PATH." >&2; exit 1; }
done
rm -rf "$S"; mkdir -p "$S/git" "$S/fixtures" "$MACHINE"; touch "$S/.test-scratch"
trap cleanup EXIT

step "The stand-in base image $BASE (0.2.0 plus cdr)"
run "docker build -q -t $BASE -f '$HERE/base/Dockerfile' '$CDR_TOOLS' >/dev/null"

step "Fixtures: package repo example_common, service repos example_app and example_driver, the integration repo"
py_package "$S/fixtures/example_common" example_common
serve example_common "$S/fixtures/example_common"
service_repo example_app
serve example_app "$S/fixtures/example_app"
service_repo example_driver
sed -i 's|^# This service.s own build steps go here.*|&\nRUN echo calibration > /opt/app/share/example-driver-own-step|' "$S/fixtures/example_driver/Dockerfile"
serve example_driver "$S/fixtures/example_driver"
F=$S/fixtures/example_integration; cp -r "$HERE/integration" "$F"
sed -i "s|image: $REGISTRY/cboost-ros2-jazzy:0.3.0|image: $BASE|" "$F/flexcompose.yaml"
repos_file "$F/dependencies.repos" example_app example_driver
sed -i 's|ros2 launch example_\(.*\)_bringup .*|ros2 run example_\1_node hello|' "$F/flexcompose.release.yaml"
serve example_integration "$F"
git daemon --reuseaddr --base-path="$S/git" --export-all --enable=receive-pack --listen=172.17.0.1 --port="$PORT" \
  --detach --pid-file="$S/gitd.pid" "$S/git"
sleep 1; git ls-remote "$GIT_URL/example_common" main >/dev/null
eval "$(ssh-agent -s)" >/dev/null

step "A service's image without an integration repo: docker build in a clone"
run "git clone -q $GIT_URL/example_app '$S/example_app_alone'"
run "docker build -q --build-arg BASE_IMAGE=$BASE -t example-app-alone '$S/example_app_alone' >/dev/null"
check "the image built alone runs the service with its dependency" \
  "docker run --rm example-app-alone ros2 run example_app_node hello | grep -q 'example_app_node says: hello from example_common'"

step "Developer: clone the integration repo, start the dev boxes"
W=$S/example_integration
run "git clone -q $GIT_URL/example_integration '$W'"
(cd "$W" && run flexcompose generate --target devbox:host-src && run 'docker compose -f compose.generated.yaml up -d 2>&1 | tail -1')
for service in example_app example_driver; do
  check "$service has a devcontainer config naming its service and its bootstrap" \
    "grep -q '\"service\": \"$service\"' '$W/.devcontainer/$service/devcontainer.json' && grep -q 'bootstrap.sh $service ' '$W/.devcontainer/$service/devcontainer.json'"
done
check "an open before the first --update fails and names the command" \
  "! box example_app 'bash src/bootstrap.sh example_app' 2>'$S/first-open.log' && grep -q -- '--update' '$S/first-open.log'"
run "box example_app 'bash src/bootstrap.sh example_app --update' 2>&1 | tail -3"
check "cdr cloned the services and their dependency next to each other" \
  "[ -d '$W/example_app/.git' ] && [ -d '$W/example_driver/.git' ] && [ -d '$W/example_common/.git' ]"
check "the checkouts leave the integration repo clean" "[ -z \"\$(git -C '$W' status --porcelain)\" ]"
check "the other service's box opens on the shared checkouts without --update" "box example_driver 'bash src/bootstrap.sh example_driver'"
for service in example_app example_driver; do
  echo "\$ (in $service's box) cd $service && colcon build"; box $service "cd $service && colcon build 2>&1 | tail -1"
  check "$service's box builds and runs its service" \
    "box $service 'cd $service && source install/setup.bash && ros2 run ${service}_node hello' | grep -q '${service}_node says: hello from example_common'"
done
check "a service's workspace holds its own packages and their dependency, not the other service's" \
  "box example_app '[ -d example_app/install/example_app_node ] && [ -d example_app/install/example_common ] && [ ! -e example_app/install/example_driver_node ]'"
run "git -C '$W/example_app' switch -qc feature"
check "an open leaves a checkout on its branch" \
  "box example_app 'bash src/bootstrap.sh example_app' && [ \"\$(git -C '$W/example_app' branch --show-current)\" = feature ]"
run "git -C '$W/example_app' switch -q main"

step "Developer: lock, tag and release"
cd "$W"
run "./lock.sh"
check "the lock holds the services and their dependency, by commit" "[ \$(grep -cE 'version: [0-9a-f]{40}' lock.repos) = 3 ]"
run "git add lock.repos && ${G[*]} commit -qm 'Lock 1.0.0' && ${G[*]} tag -a -m v1.0.0 v1.0.0"
run "./release.sh > '$S/release.log' 2>&1; tail -2 '$S/release.log'"
B=$W/release-v1.0.0
check "the bundle is complete" "(cd '$B' && sha256sum -c --quiet SHA256SUMS)"
check "each service's image holds its own packages and their dependency, not the other service's" \
  "docker run --rm $REGISTRY/example-app:1.0.0 ros2 pkg list > '$S/app-packages' && grep -qx example_app_node '$S/app-packages' && grep -qx example_common '$S/app-packages' && ! grep -qx example_driver_node '$S/app-packages'"
check "a service's own build step is in its image only" \
  "docker run --rm $REGISTRY/example-driver:1.0.0 test -f /opt/app/share/example-driver-own-step && ! docker run --rm $REGISTRY/example-app:1.0.0 test -f /opt/app/share/example-driver-own-step"

step "Machine: install the bundle"
run "cp -r '$B' '$MACHINE/' && docker image rm $REGISTRY/example-app:1.0.0 $REGISTRY/example-driver:1.0.0 >/dev/null"
run "'$MACHINE/release-v1.0.0/update.sh' 2>&1 | tail -1"
for service in example_app example_driver; do
  for _ in $(seq 20); do (cd "$MACHINE/current" && docker compose -f compose.release.yaml logs $service 2>/dev/null) | grep -q 'hello from' && break; sleep 1; done
  check "the machine runs $service in its own container" \
    "(cd '$MACHINE/current' && docker compose -f compose.release.yaml logs $service) | grep -q '${service}_node says: hello from example_common'"
done
run "'$MACHINE/current/stop.sh' 2>&1 | tail -1"

echo
if [ $fails = 0 ]; then echo "ALL PASS"; else echo "$fails FAILED"; exit 1; fi
