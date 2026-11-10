#!/bin/bash
# End-to-end run of this example: two service repos, each with its own FlexCompose template, Dockerfile and
# dependencies (example_app runs from source in a dev box, example_driver as the image its repo builds; both use the
# package repo example_common), and the integration repo of their machine, which imports them. It runs a service's
# own dev box and builds its image without the integration repo; then the machine's dev boxes; then it locks,
# releases and runs the release as a machine would. The repos are served by a local git daemon.
# Needs on PATH: flexcompose (with imports), cdr, vcs (vcs2l), docker with buildx; the Docker bridge at 172.17.0.1;
# the base image cboost-c-nas:5100/cboost-ros2-jazzy:0.2.0; and nl-cboost-ros-tools/tools (CDR_TOOLS) for the
# stand-in base image.
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
  local box; for box in "$S/example_app_alone" "$S/example_integration"; do
    [ -f "$box/compose.generated.yaml" ] && (cd "$box" && docker compose -f compose.generated.yaml down -v >/dev/null 2>&1)
  done
  [ -L "$MACHINE/current" ] && (cd "$MACHINE/current" && docker compose -f compose.release.yaml down >/dev/null 2>&1)
  docker image rm example-app-alone $REGISTRY/example-app:1.0.0 $REGISTRY/example-driver:1.0.0 $REGISTRY/example-driver:dev >/dev/null 2>&1 || true
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

# service_files NAME FROM...: the fixture repo of the service NAME: the files FROM of this example, the package NAME_node
# under source/ and the fixture's dependency, with the stand-in base image and a command that runs the package.
service_files() {
  local name=$1 F=$S/fixtures/$1; shift
  mkdir -p "$F"; cp -r "$@" "$F/"
  py_package "$F/source" "${name}_node" example_common
  repos_file "$F/dependencies.repos" example_common
  sed -i "s|$REGISTRY/cboost-ros2-jazzy:0.3.0|$BASE|" "$F/flexcompose.yaml"
  sed -i "s|ros2 launch ${name}_bringup .*|ros2 run ${name}_node hello|" "$F"/flexcompose*.yaml
}

# box DIR SERVICE CMD: run CMD in the dev box of SERVICE in DIR's Compose project, as cboost-user in ~/workspaces,
# with ROS sourced.
box() {
  (cd "$1" && docker compose -f compose.generated.yaml exec -T "$2" bash -c \
    "source /opt/ros/\$ROS_DISTRO/setup.bash && cd ~/workspaces && $3")
}

# says SERVICE: what the node of SERVICE prints.
says() { echo "$1_node says: hello from example_common"; }

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

step "Fixtures: package repo example_common, service repos example_app (from source) and example_driver (as an image), the integration repo"
py_package "$S/fixtures/example_common" example_common
serve example_common "$S/fixtures/example_common"
service_files example_app "$HERE/service/."
serve example_app "$S/fixtures/example_app"
service_files example_driver "$HERE/service/Dockerfile" "$HERE/service/.dockerignore" "$HERE/service/.gitattributes" "$HERE/service-as-image/."
sed -i 's|^# This service.s own build steps go here.*|&\nRUN echo calibration > /opt/app/share/example-driver-own-step|' "$S/fixtures/example_driver/Dockerfile"
serve example_driver "$S/fixtures/example_driver"
F=$S/fixtures/example_integration; cp -r "$HERE/integration" "$F"
repos_file "$F/dependencies.repos" example_app example_driver
serve example_integration "$F"
git daemon --reuseaddr --base-path="$S/git" --export-all --enable=receive-pack --listen=172.17.0.1 --port="$PORT" \
  --detach --pid-file="$S/gitd.pid" "$S/git"
sleep 1; git ls-remote "$GIT_URL/example_common" main >/dev/null
eval "$(ssh-agent -s)" >/dev/null

step "A service on its own: its dev box and its image, from a clone of its repo"
A=$S/example_app_alone
run "git clone -q $GIT_URL/example_app '$A'"
(cd "$A" && run flexcompose generate --target devbox:host-src && run 'docker compose -f compose.generated.yaml up -d 2>&1 | tail -1')
check "an open before the first --update fails and names the command" \
  "! box '$A' example_app 'bash src/bootstrap.sh' 2>'$S/first-open.log' && grep -q -- '--update' '$S/first-open.log'"
run "box '$A' example_app 'bash src/bootstrap.sh --update' 2>&1 | tail -2"
check "its dependency is cloned inside its checkout, which stays clean" \
  "[ -d '$A/deps/example_common/.git' ] && [ -z \"\$(git -C '$A' status --porcelain)\" ]"
echo "\$ (in the box) colcon build"; box "$A" example_app 'colcon build 2>&1 | tail -1'
check "its own box builds and runs it" \
  "box '$A' example_app 'source install/setup.bash && ros2 run example_app_node hello' | grep -q '$(says example_app)'"
run "docker build -q --build-arg BASE_IMAGE=$BASE -t example-app-alone '$A' >/dev/null"
check "its image, built in that clone, runs it" "docker run --rm example-app-alone ros2 run example_app_node hello | grep -q '$(says example_app)'"

step "Developer: clone the integration repo and its services, start the machine's dev boxes"
W=$S/example_integration
run "git clone -q $GIT_URL/example_integration '$W'"
cd "$W"
check "generate is refused while a service is not checked out, naming it" \
  "! flexcompose generate --target devbox:host-src 2>'$S/no-service.log' && grep -q example_app '$S/no-service.log'"
run "vcs import --skip-existing --input dependencies.repos . 2>&1 | tail -1"
run "flexcompose generate --target devbox:host-src"
run "docker compose -f compose.generated.yaml up -d 2>&1 | tail -1"
check "the checkouts leave the integration repo clean" "[ -z \"\$(git status --porcelain)\" ]"
check "example_app has a devcontainer config naming its service" "grep -q '\"service\": \"example_app\"' .devcontainer/example_app/devcontainer.json"
run "box '$W' example_app 'bash src/bootstrap.sh --update' 2>&1 | tail -2"
echo "\$ (in example_app's box) colcon build"; box "$W" example_app 'colcon build 2>&1 | tail -1'
check "the service's box in the machine builds and runs it" \
  "box '$W' example_app 'source install/setup.bash && ros2 run example_app_node hello' | grep -q '$(says example_app)'"
check "that box holds the service's checkout as src/, with its dependencies in it, and no other service" \
  "box '$W' example_app '[ -d src/source/example_app_node ] && [ -d src/deps/example_common ] && [ ! -e src/example_driver ]'"
for _ in $(seq 20); do docker compose -f compose.generated.yaml logs example_driver 2>/dev/null | grep -q 'hello from' && break; sleep 1; done
check "the other service runs next to it as the image its repo builds" \
  "docker compose -f compose.generated.yaml logs example_driver | grep -q '$(says example_driver)' && ! docker compose -f compose.generated.yaml exec -T example_driver test -e /home/cboost-user/workspaces/src"
run "git -C example_app switch -qc feature"
check "an open leaves a checkout on its branch" \
  "box '$W' example_app 'bash src/bootstrap.sh' && [ \"\$(git -C example_app branch --show-current)\" = feature ]"
run "git -C example_app switch -q main"

step "Developer: lock, tag and release"
run "./lock.sh"
check "the lock holds the services and their dependency, by commit" "[ \$(grep -cE 'version: [0-9a-f]{40}' lock.repos) = 3 ]"
run "git add lock.repos && ${G[*]} commit -qm 'Lock 1.0.0' && ${G[*]} tag -a -m v1.0.0 v1.0.0"
run "./release.sh > '$S/release.log' 2>&1; tail -2 '$S/release.log'"
B=$W/release-v1.0.0
check "the bundle is complete" "(cd '$B' && sha256sum -c --quiet SHA256SUMS)"
check "the release leaves the integration repo and its checkouts clean" "[ -z \"\$(git status --porcelain)\" ] && [ -z \"\$(git -C example_app status --porcelain)\" ]"
check "each service's image holds its own packages and their dependency, not the other service's" \
  "docker run --rm $REGISTRY/example-app:1.0.0 ros2 pkg list > '$S/app-packages' && grep -qx example_app_node '$S/app-packages' && grep -qx example_common '$S/app-packages' && ! grep -qx example_driver_node '$S/app-packages'"
check "a service's own build step is in its image only" \
  "docker run --rm $REGISTRY/example-driver:1.0.0 test -f /opt/app/share/example-driver-own-step && ! docker run --rm $REGISTRY/example-app:1.0.0 test -f /opt/app/share/example-driver-own-step"

step "Machine: install the bundle"
# A hard-linked copy: images.tar holds the whole base image.
run "cp -al '$B' '$MACHINE/' && docker image rm $REGISTRY/example-app:1.0.0 $REGISTRY/example-driver:1.0.0 >/dev/null"
run "'$MACHINE/release-v1.0.0/update.sh' 2>&1 | tail -1"
for service in example_app example_driver; do
  for _ in $(seq 20); do (cd "$MACHINE/current" && docker compose -f compose.release.yaml logs $service 2>/dev/null) | grep -q 'hello from' && break; sleep 1; done
  check "the machine runs $service in its own container" \
    "(cd '$MACHINE/current' && docker compose -f compose.release.yaml logs $service) | grep -q '$(says $service)'"
done
run "'$MACHINE/current/stop.sh' 2>&1 | tail -1"

echo
if [ $fails = 0 ]; then echo "ALL PASS"; else echo "$fails FAILED"; exit 1; fi
