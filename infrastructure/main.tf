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
  source                        = "git@github.com:hmcts/cnp-module-redis?ref=4.x"
  product                       = var.product
  location                      = var.location
  env                           = var.env
  name                          = "${var.product}-frontend-v6-${var.env}"
  redis_version                 = "6"
  business_area                 = "cft"
  common_tags                   = var.common_tags
  public_network_access_enabled = false
  private_endpoint_enabled      = true
  sku_name                      = var.sku_name
  family                        = var.family
  capacity                      = var.capacity
}

module "managed_redis" {
  # foreach conditional allows selective deployment to desired environments
  source = "git@github.com:hmcts/terraform-module-azure-managed-redis?ref=main"

  product     = var.product
  component   = var.component
  env         = var.env
  location    = var.location
  common_tags = var.common_tags

  # Performance:
  sku_name                  = var.managed_redis_sku
  high_availability_enabled = var.managed_redis_high_availability_enabled
  # Networking:
  public_network_access   = "Disabled"
  create_private_endpoint = true
  subnet_id               = data.azurerm_subnet.redis_private_endpoint.id
  private_dns_zone_ids    = ["/subscriptions/${var.private_dns_subscription_id}/resourceGroups/core-infra-intsvc-rg/providers/Microsoft.Network/privateDnsZones/privatelink.redis.azure.net"]

  access_keys_authentication_enabled = true
  persistence_rdb_backup_frequency   = var.managed_redis_persistence_rdb_backup_frequency

}

resource "azurerm_key_vault_secret" "managed_redis_access_key" {
  name         = "${var.product}-managed-redis-access-key"
  value        = module.managed_redis.primary_access_key
  key_vault_id = data.azurerm_key_vault.sscs_key_vault.id
}

resource "azurerm_key_vault_secret" "managed_redis_connection_string" {
  name         = "${var.product}-managed-redis-connection-string"
  value        = "rediss://:${urlencode(module.managed_redis.primary_access_key)}@${module.managed_redis.hostname}:${module.managed_redis.port}"
  key_vault_id = data.azurerm_key_vault.sscs_key_vault.id
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
