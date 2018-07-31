provider "vault" {
  address = "https://vault.reform.hmcts.net:6200"
}

data "vault_generic_secret" "cookiesecret" {
  path = "secret/${var.infrastructure_env}/sscs/sscscorcookiesecret"
}

data "vault_generic_secret" "hpkp_cor_sha_1" {
  path = "secret/${var.infrastructure_env}/sscs/hpkp_cor_sha_1"
}

data "vault_generic_secret" "hpkp_cor_sha_2" {
  path = "secret/${var.infrastructure_env}/sscs/hpkp_cor_sha_2"
}

locals {
  aseName = "${data.terraform_remote_state.core_apps_compute.ase_name[0]}"

  localApiUrl = "http://sscs-cor-api-${var.env}.service.${local.aseName}.internal"
  ApiUrl = "${var.env == "preview" ? "http://sscs-cor-api-aat.service.core-compute-aat.internal" : local.localApiUrl}"
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
  https_only           = "${var.env != "preview" ? "true" : "true"}"
  common_tags          = "${var.common_tags}"

  app_settings = {
    SSCS_API_URL                 = "${local.ApiUrl}"
    WEBSITE_NODE_DEFAULT_VERSION = "8.11.3"
    NODE_ENV                     = "${var.infrastructure_env}"
    COOKIE_SECRET                = "${data.vault_generic_secret.cookiesecret.data["value"]}"
    HPKP_SHA256                  = "${data.vault_generic_secret.hpkp_cor_sha_1.data["value"]}"
    HPKP_SHA256_BACKUP           = "${data.vault_generic_secret.hpkp_cor_sha_2.data["value"]}"
  }
}


