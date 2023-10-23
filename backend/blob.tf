provider "azurerm" {
   features {}
}

# Create a resource group
resource "azurerm_resource_group" "primary" {
  name     = "blobrg"           # Name of the resource group
  location = "eastus"         # Location/region for the resource group
}

resource "azurerm_storage_account" "primary" {
  name                     = "blobapp1996kc"                               # Name of the storage account
  resource_group_name      = azurerm_resource_group.primary.name     # Reference to the resource group's name
  location                 = azurerm_resource_group.primary.location # Reference to the resource group's location
  account_tier             = "Standard"                              # Storage account tier
  account_replication_type = "GRS"                                   # Replication type for redundancy
}

resource "azurerm_storage_container" "primary" {
  name                  = "content"                                  # Name of the storage container
  storage_account_name  = azurerm_storage_account.primary.name       # Reference to the storage account's name
  container_access_type = "private"                                 # Access type for the container
}

