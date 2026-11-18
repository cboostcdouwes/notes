ip link add ecm type veth peer name ring; ip link set ecm up; ip link set ring up
python3 /tmp/claude-1000/-home-cboost-Cboost-nl-cboost-ethercat-lib/a9c39350-1637-4667-af03-992f4d34be79/scratchpad/x4/reflector_one.py ring & R=$!
sleep 0.3
timeout 30 /tmp/claude-1000/-home-cboost-Cboost-nl-cboost-ethercat-lib/a9c39350-1637-4667-af03-992f4d34be79/scratchpad/exp/target/release/examples/x4_discover ecm || echo "exit $?"
kill $R
