$feature_name = Read-Host "Enter feature name (e.g., auth-page)"
git checkout develop
git pull origin develop
git checkout -b "feature/$feature_name"
Write-Host "Created and switched to feature/$feature_name"