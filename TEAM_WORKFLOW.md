# Area Project CI/CD Workflow

## 🚀 Team Development Process

### Overview
This project uses a **staging → production CI/CD workflow** to ensure code quality and safe deployments.

```
Team Members → Personal Repo (Staging/CI) → Organization Repo (Production)
```

### 📋 Workflow Steps

1. **Team Development**: All team members work on features/fixes
2. **Pull Request to Personal Repo**: Submit PR to `EthanBranchereau/area-cicd-mirror`
3. **Automated CI/Testing**: CircleCI runs full test suite on personal repo
4. **Manual Review**: Code review and approval
5. **Merge to Staging**: Changes merged to personal repo `main` branch
6. **Staging Deployment**: Automatic deployment to staging server for verification
7. **Production Promotion**: If staging tests pass, automatically:
   - Push changes to organization repo (`EpitechPGE3-2025/G-DEV-500-MPL-5-1-area-2`)
   - Deploy to production server
   - Restart production services

### 👥 For Team Members

#### Setting Up Your Development Environment

1. **Fork the personal staging repo**:
   ```bash
   git clone https://github.com/EthanBranchereau/area-cicd-mirror.git
   cd area-cicd-mirror
   ```

2. **Add personal repo as upstream**:
   ```bash
   git remote add upstream https://github.com/EthanBranchereau/area-cicd-mirror.git
   ```

3. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Workflow

1. **Develop your feature**:
   ```bash
   # Make your changes
   git add .
   git commit -m "feat: implement new feature"
   git push origin feature/your-feature-name
   ```

2. **Submit Pull Request**:
   - Go to `https://github.com/EthanBranchereau/area-cicd-mirror`
   - Create PR from your fork to the main branch
   - Add descriptive title and description
   - Request review

3. **After PR Approval**:
   - PR will be merged to `main`
   - CircleCI automatically triggers staging deployment
   - If staging tests pass, production deployment begins
   - Monitor pipeline at: https://circleci.com/gh/EthanBranchereau/area-cicd-mirror

### 🔧 For Repository Admin (Ethan)

#### Required Environment Variables in CircleCI

Add these in CircleCI Project Settings → Environment Variables:

```
GITHUB_TOKEN=<personal_access_token_with_repo_scope>
SSH_HOST=144.24.201.112
SSH_USERNAME=ethanl
DB_PASSWORD=<your_production_db_password>
```

#### GitHub Token Setup

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope
3. Add as `GITHUB_TOKEN` environment variable in CircleCI

### 📊 Monitoring and Troubleshooting

#### Pipeline Status
- **Staging CI**: https://circleci.com/gh/EthanBranchereau/area-cicd-mirror
- **Production Status**: Check server at http://144.24.201.112/health

#### Pipeline Stages
1. **Backend CI**: PHP tests, Laravel setup
2. **Frontend CI**: Node build, ESLint, React tests  
3. **Staging Deploy**: Deploy to staging server for testing
4. **Production Deploy**: Push to org repo + production deployment

#### Troubleshooting
- **Failed Tests**: Check CircleCI logs for specific test failures
- **Deployment Issues**: SSH into server and check logs:
  ```bash
  ssh ethanl@144.24.201.112
  sudo systemctl status nginx
  sudo systemctl status php8.2-fpm
  tail -f /var/log/nginx/error.log
  ```

### 🔒 Security Notes

- Never commit sensitive data (API keys, passwords, etc.)
- Use environment variables for configuration
- SSH keys are managed by CircleCI
- Production deployments are automated and audited

### 🎯 Benefits of This Workflow

✅ **Quality Assurance**: All code tested before production
✅ **Safe Deployments**: Staging environment catches issues
✅ **Automated Process**: Minimal manual intervention
✅ **Audit Trail**: Complete history of deployments
✅ **Team Collaboration**: Standard PR process
✅ **Production Stability**: Validated changes only

---

## Quick Commands Reference

```bash
# Clone and setup
git clone https://github.com/EthanBranchereau/area-cicd-mirror.git
cd area-cicd-mirror

# Create feature branch
git checkout -b feature/feature-name

# Commit changes
git add .
git commit -m "feat: description"
git push origin feature/feature-name

# After PR merged, sync your fork
git checkout main
git pull upstream main
git push origin main
```

For questions or issues, contact the repository admin.