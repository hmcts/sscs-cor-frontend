provider "azurerm" {
  features {}
}

locals {
  azureVaultName = "sscs-${var.env}"
}

data "azurerm_key_vault" "sscs_key_vault" {
  name                = local.azureVaultName
  resource_group_name = local.azureVaultName
}

data "azurerm_subnet" "core_infra_redis_subnet" {
  name                 = "core-infra-subnet-1-${var.env}"
  virtual_network_name = "core-infra-vnet-${var.env}"
  resource_group_name  = "core-infra-${var.env}"
}

module "redis-cache-v2" {
  source                        = "git@github.com:hmcts/cnp-module-redis?ref=data_persistence_authentication_method"
  product                       = var.product
  location                      = var.location
  env                           = var.env
  name                          = "${var.product}-frontend-v6-${var.env}"
  redis_version                 = "6"
  business_area                 = "cft"
  common_tags                   = var.common_tags
  public_network_access_enabled = false
  private_endpoint_enabled      = true
}

resource "azurerm_key_vault_secret" "redis_access_key" {
  name         = "${var.product}-redis-access-key"
  value        = module.redis-cache-v2.access_key
  key_vault_id = data.azurerm_key_vault.sscs_key_vault.id

  content_type = "secret"
  tags = merge(var.common_tags, {
    "source" : "redis ${module.redis-cache-v2.host_name}"
  })
}

resource "azurerm_key_vault_secret" "redis_connection_string" {
  name         = "${var.product}-redis-connection-string"
  value        = "redis://:${urlencode(module.redis-cache-v2.access_key)}@${module.redis-cache-v2.host_name}:${module.redis-cache-v2.redis_port}?tls=true"
  key_vault_id = data.azurerm_key_vault.sscs_key_vault.id

  content_type = "secret"
  tags = merge(var.common_tags, {
    "source" : "redis ${module.redis-cache-v2.host_name}"
  })
}
