provider "azurerm" {
    version = "1.19.0"
}

resource "azurerm_resource_group" "rg" {
  name     = "${var.product}-${var.component}-${var.env}"
  location = "${var.location}"

  tags = "${merge(var.common_tags,
    map("lastUpdated", "${timestamp()}")
    )}"
}

locals {
  aseName = "${data.terraform_remote_state.core_apps_compute.ase_name[0]}"

  localApiUrl = "http://sscs-cor-backend-${var.env}.service.${local.aseName}.internal"
  ApiUrl      = "${var.env == "preview" ? "http://sscs-cor-backend-aat.service.core-compute-aat.internal" : local.localApiUrl}"

  local_env = "${(var.env == "preview") ? "aat" : (var.env == "spreview") ? "saat" : var.env}"
  azureVaultName = "sscs-${local.local_env}"

  s2sUrl = "http://rpe-service-auth-provider-${local.local_env}.service.${local.aseName}.internal"
}

data "azurerm_key_vault" "sscs_key_vault" {
  name                = "${local.azureVaultName}"
  resource_group_name = "${local.azureVaultName}"
}

data "azurerm_key_vault_secret" "sscs-cor-idam-client-secret" {
  name      = "sscs-cor-idam-client-secret"
  vault_uri = "${data.azurerm_key_vault.sscs_key_vault.vault_uri}"
}

data "azurerm_key_vault_secret" "sscs-s2s-secret" {
  name = "sscs-s2s-secret"
  vault_uri = "${data.azurerm_key_vault.sscs_key_vault.vault_uri}"
}

module "sscs-cor-frontend" {
  source               = "git@github.com:contino/moj-module-webapp?ref=master"
  product              = "${var.product}-${var.component}"
  location             = "${var.location}"
  env                  = "${var.env}"
  ilbIp                = "${var.ilbIp}"
  is_frontend          = "${var.env != "preview" ? 1: 0}"
  subscription         = "${var.subscription}"
  additional_host_name = "${var.env != "preview" ? var.additional_hostname : "null"}"
  https_only           = "${var.https_only_flag}"
  common_tags          = "${var.common_tags}"
  asp_rg               = "${var.product}-${var.component}-${var.env}"
  asp_name             = "${var.product}-${var.component}-${var.env}"

  app_settings = {
    SSCS_API_URL                                   = "${local.ApiUrl}"
    WEBSITE_NODE_DEFAULT_VERSION                   = "8.11.1"
    NODE_ENV                                       = "${var.infrastructure_env}"
    REDIS_URL                                      = "redis://ignore:${urlencode(module.redis-cache.access_key)}@${module.redis-cache.host_name}:${module.redis-cache.redis_port}?tls=true"
    SESSION_SECRET                                 = "${module.redis-cache.access_key}"
    SECURE_SESSION                                 = "${var.secure_session}"
    IDAM_URL                                       = "${var.idam_url}"
    IDAM_API_URL                                   = "${var.idam_api_url}"
    IDAM_ENABLE_STUB                               = "${var.idam_enable_stub}"
    IDAM_CLIENT_SECRET                             = "${data.azurerm_key_vault_secret.sscs-cor-idam-client-secret.value}"
    EVIDENCE_UPLOAD_QUESTION_PAGE_ENABLED          = "${var.evidence_upload_question_page_enabled}"
    EVIDENCE_UPLOAD_QUESTION_PAGE_OVERRIDE_ALLOWED = "${var.evidence_upload_question_page_override_allowed}"
    S2S_URL                                        = "${local.s2sUrl}"
    S2S_SECRET                                     = "${data.azurerm_key_vault_secret.sscs-s2s-secret.value}"
    MYA_FEATURE_FLAG                               = "${var.mya_feature_flag}"
    ADDITIONAL_EVIDENCE_FEATURE_FLAG               = "${var.additional_evidence_feature_flag}"
    FORCE_CHANGE                                   = "true"
    TRIBUNALS_API_URL                              = "${var.tribunals_api_url}"
  }
}

module "redis-cache" {
  source      = "git@github.com:contino/moj-module-redis?ref=master"
  product     = "${var.product}-redis"
  location    = "${var.location}"
  env         = "${var.env}"
  subnetid    = "${data.terraform_remote_state.core_apps_infrastructure.subnet_ids[1]}"
  common_tags = "${var.common_tags}"
}
