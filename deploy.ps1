# $archive = "../jftools.zip"
#
# Remove-Item $archive
#
# $exclude = @(".*", "deploy.ps1")
#
# $files = Get-ChildItem -Path . -Exclude $exclude
#
# Compress-Archive -Path $files -DestinationPath $archive
#
# az webapp deployment source config-zip --resource-group jfbilodeau.tools --name jftools --src $archive
func azure functionapp publish jftools
