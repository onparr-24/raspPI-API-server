# Raspberry Pi API Server

A simple Express.js API server designed to run on a Raspberry Pi with GitHub integration for remote updates.

## Features

- **REST API Endpoints**: Server status, update checking, and remote updates
- **GitHub Integration**: Automatically pull updates from GitHub repository
- **Cross-platform Access**: Access via `.local` domain or IP address from any device on your network
- **PM2 Process Management**: Auto-restart and background running
- **Remote Updates**: Update server code remotely from any device

## API Endpoints

### GET `/api/status`
Returns server status and system information.

```json
{
  "status": "Server is running",
  "platform": "Linux",
  "version": "0.0.9"
}
```

### GET `/api/check-updates`
Checks if updates are available from GitHub.

```json
{
  "success": true,
  "hasUpdates": true,
  "message": "Updates available",
  "gitStatus": "Your branch is behind 'origin/main' by 1 commit"
}
```

### POST `/api/update`
Pulls latest updates from GitHub and automatically restarts the server.

```json
{
  "success": true,
  "message": "Updates pulled successfully. Restarting server...",
  "updated": true,
  "pullResult": "Updating abc123..def456\nFast-forward\n server.js | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)"
}
```

## Setup

### Prerequisites

- Raspberry Pi with Raspberry Pi OS
- Node.js (v14 or higher)
- Git configured with GitHub access
- PM2 (for process management)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/apiServer.git
   cd apiServer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up PM2:**
   ```bash
   sudo npm install -g pm2
   ```

4. **Configure Git (if not already done):**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your-email@example.com"
   ```

5. **Set up SSH key for GitHub (recommended):**
   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   cat ~/.ssh/id_ed25519.pub
   ```
   Add the public key to your GitHub account.

### Running the Server

#### Development Mode
```bash
npm start
```

#### Production Mode with PM2
```bash
npm run pm2-start
pm2 save
pm2 startup
```
Follow the command output to enable auto-startup on boot.

## Usage

### Access the API
### Change raspberrypi-2 to your host name
The server will be accessible at:
- `http://raspberrypi-2.local:3000/api/status` (via mDNS)
- `http://[PI_IP_ADDRESS]:3000/api/status` (via IP)

### NPM Scripts

#### Local Commands (run on Raspberry Pi)
- `npm start` - Start server normally
- `npm run pm2-start` - Start with PM2
- `npm run pm2-stop` - Stop PM2 process
- `npm run pm2-restart` - Restart PM2 process
- `npm run status` - Check PM2 status
- `npm run logs` - View PM2 logs

#### Remote Commands (run from any device)
- `npm run update` - Pull updates from GitHub and restart server
- `npm run check-updates` - Check if updates are available

### Remote Updates

From any device on your network (Windows, Mac, etc.):

1. **Check for updates:**
   ```bash
   npm run check-updates
   ```

2. **Update the server:**
   ```bash
   npm run update
   ```

The server will automatically:
- Fetch latest changes from GitHub
- Pull updates if available
- Restart itself via PM2

## Configuration

### Changing Hostname

To change the Raspberry Pi hostname:
```bash
sudo hostnamectl set-hostname your-new-hostname
sudo reboot
```

Update the hostname in `package.json` scripts if changed.

### Firewall Configuration

Ensure port 3000 is accessible:
```bash
sudo ufw allow 3000
```

For home network only, configure Windows Firewall to allow Node.js on Private networks only.

## Troubleshooting

### mDNS Issues

If `.local` domains don't work:

1. **Install Avahi:**
   ```bash
   sudo apt install avahi-daemon avahi-utils -y
   sudo systemctl restart avahi-daemon
   ```

2. **Check NSS configuration:**
   ```bash
   sudo nano /etc/nsswitch.conf
   ```
   Ensure hosts line includes: `hosts: files mdns4_minimal [NOTFOUND=return] dns`

3. **Use IP address as fallback:**
   ```bash
   hostname -I
   ```

### Git Issues

If updates fail due to authentication:
1. Set up SSH keys (see installation steps)
2. Update remote URL: `git remote set-url origin git@github.com:USERNAME/REPO.git`

## License

MIT

## Author

Justin