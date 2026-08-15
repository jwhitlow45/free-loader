#!/bin/sh
# Steam Deck setup for password-less `make it` deploys. Run via `make deck-setup`.
#
# NOTE: SteamOS keeps a separate /etc overlay per A/B update slot, so every
# SteamOS update reverts these changes. When `make it` starts failing with a
# "deploy prep failed" message, just re-run `make deck-setup`.
set -e

# Helper the Makefile invokes before each rsync: creates the dev plugin dir
# (plugins/ itself is root-owned on modern Decky, and Decky re-chowns the
# plugin dir + plugin.json to root on every restart) and hands it back to deck.
cat > /etc/decky-dev-prep <<'EOF'
#!/bin/sh
mkdir -p /home/deck/homebrew/plugins/free-loader
chown -R deck:deck /home/deck/homebrew/plugins/free-loader
EOF
chmod 755 /etc/decky-dev-prep

# Scoped password-less sudo: the prep helper + restarting Decky.
# Validate with visudo before installing so a typo can't break sudo.
cat > /tmp/decky-dev.sudoers <<'EOF'
deck ALL=(ALL) NOPASSWD: /etc/decky-dev-prep, /usr/bin/systemctl restart plugin_loader.service
EOF
visudo -c -f /tmp/decky-dev.sudoers
# "zz-" prefix: sudoers.d files apply in alphabetical order and the LAST
# matching rule wins. SteamOS's "wheel" file ((ALL) ALL, with password)
# matches every command, so our NOPASSWD rule must sort after it.
install -m 440 /tmp/decky-dev.sudoers /etc/sudoers.d/zz-decky-dev
rm -f /tmp/decky-dev.sudoers /etc/sudoers.d/decky-restart /etc/sudoers.d/decky-dev

echo "decky dev deploy setup complete"
