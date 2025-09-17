# Repository Secrets Setup Guide

This document outlines all the secrets that need to be configured in the GitHub repository for the CI/CD workflows to function properly.

## Required Secrets

### GitHub Token
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

### Desktop App Distribution

#### Windows (Winget)
- `WINGET_TOKEN`: Token for updating Windows Package Manager

#### macOS (Homebrew)
- `HOMEBREW_TOKEN`: Token for updating Homebrew formula

#### Linux (Snap)
- `SNAP_TOKEN`: Snapcraft store credentials for publishing

### Mobile App Distribution

#### Android (Google Play)
- `ANDROID_SIGNING_KEY`: Base64 encoded Android signing key
- `ANDROID_KEY_ALIAS`: Key alias for Android signing
- `ANDROID_KEYSTORE_PASSWORD`: Keystore password
- `ANDROID_KEY_PASSWORD`: Key password
- `GOOGLE_PLAY_SERVICE_ACCOUNT`: Service account JSON for Google Play Console

#### iOS (App Store)
- `IOS_CODE_SIGN_IDENTITY`: iOS code signing identity
- `IOS_PROVISIONING_PROFILE`: iOS provisioning profile
- `APPLE_ID`: Apple ID for App Store Connect
- `APPLE_APP_PASSWORD`: App-specific password for App Store Connect

### Python Library (PyPI)
- `PYPI_API_TOKEN`: API token for PyPI publishing
- `TEST_PYPI_API_TOKEN`: API token for Test PyPI

### Docker Hub
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub access token

### Social Media & Notifications
- `DISCORD_WEBHOOK`: Discord webhook URL for release notifications
- `TWITTER_CONSUMER_KEY`: Twitter API consumer key
- `TWITTER_CONSUMER_SECRET`: Twitter API consumer secret
- `TWITTER_ACCESS_TOKEN`: Twitter API access token
- `TWITTER_ACCESS_TOKEN_SECRET`: Twitter API access token secret

### Website Updates
- `WEBSITE_TOKEN`: GitHub token for updating website repository

## Setup Instructions

### 1. GitHub Repository Settings

1. Go to your repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add each secret listed above

### 2. Desktop App Secrets

#### Winget Token
```bash
# Create Winget package publisher account
# Get token from https://partner.microsoft.com/
```

#### Homebrew Token
```bash
# Create GitHub personal access token with repo permissions
# For updating Homebrew formula repository
```

#### Snap Token
```bash
# Install snapcraft CLI
snap install snapcraft --classic

# Login to Snap Store
snapcraft login

# Export credentials
snapcraft export-login snap-credentials.txt
cat snap-credentials.txt
# Copy output to SNAP_TOKEN secret
```

### 3. Mobile App Secrets

#### Android Secrets
```bash
# Generate signing key
keytool -genkey -v -keystore smartpaste-release-key.keystore \
  -alias smartpaste -keyalg RSA -keysize 2048 -validity 10000

# Encode keystore to base64
base64 smartpaste-release-key.keystore > keystore.base64
# Copy content to ANDROID_SIGNING_KEY

# Set other Android secrets:
# ANDROID_KEY_ALIAS: smartpaste
# ANDROID_KEYSTORE_PASSWORD: your keystore password
# ANDROID_KEY_PASSWORD: your key password
```

#### Google Play Service Account
```bash
# Go to Google Play Console
# Setup → API access → Create Service Account
# Download JSON file and copy content to GOOGLE_PLAY_SERVICE_ACCOUNT
```

#### iOS Secrets
```bash
# iOS secrets are obtained from Apple Developer Account
# and Xcode signing configuration
```

### 4. Python Library Secrets

#### PyPI Tokens
```bash
# Go to https://pypi.org/manage/account/token/
# Create API token with project scope
# Copy token to PYPI_API_TOKEN

# Same for https://test.pypi.org/
# Copy token to TEST_PYPI_API_TOKEN
```

### 5. Docker Hub Secrets

```bash
# Go to https://hub.docker.com/settings/security
# Create access token
# Set DOCKER_USERNAME to your username
# Set DOCKER_PASSWORD to the access token
```

### 6. Social Media Secrets

#### Discord Webhook
```bash
# In Discord server settings
# Integrations → Webhooks → Create Webhook
# Copy webhook URL to DISCORD_WEBHOOK
```

#### Twitter API
```bash
# Go to https://developer.twitter.com/
# Create app and get API keys
# Set all four Twitter secrets
```

### 7. Website Token

```bash
# Create GitHub personal access token
# With repo permissions for website repository
# Set as WEBSITE_TOKEN
```

## Environment-Specific Secrets

Some secrets are environment-specific and should be configured in GitHub Environments:

### Production Environment
- All PyPI, App Store, Google Play secrets
- Social media notification secrets

### Test Environment  
- Test PyPI tokens
- Test Discord webhooks

### Development Environment
- Development API keys
- Test service accounts

## Security Best Practices

1. **Rotate secrets regularly**: Update tokens and keys periodically
2. **Use least privilege**: Grant minimum necessary permissions
3. **Monitor usage**: Check secret usage in workflow logs
4. **Backup secrets**: Keep secure backups of critical keys
5. **Use environments**: Separate production and test secrets
6. **Review access**: Regularly audit who has access to secrets

## Troubleshooting

### Common Issues

1. **Secret not found**: Ensure secret name matches exactly in workflow
2. **Permission denied**: Check token permissions and scopes
3. **Invalid format**: Verify secret format (base64, JSON, etc.)
4. **Expired tokens**: Update expired API tokens and certificates

### Testing Secrets

Use the workflow dispatch feature to test individual workflows:

```bash
# Test desktop build
gh workflow run desktop.yml

# Test mobile build  
gh workflow run mobile.yml

# Test Python library
gh workflow run python-lib.yml
```

### Secret Validation

Create a simple workflow to validate secrets:

```yaml
name: Validate Secrets
on: workflow_dispatch

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
    - name: Check secrets
      run: |
        echo "Checking required secrets..."
        [ -n "${{ secrets.PYPI_API_TOKEN }}" ] && echo "✓ PYPI_API_TOKEN" || echo "✗ PYPI_API_TOKEN missing"
        [ -n "${{ secrets.DOCKER_USERNAME }}" ] && echo "✓ DOCKER_USERNAME" || echo "✗ DOCKER_USERNAME missing"
        # Add other secret checks
```

## Support

If you encounter issues with secret configuration:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
2. Review platform-specific documentation (PyPI, Google Play, App Store)
3. Open an issue in this repository with details about the problem