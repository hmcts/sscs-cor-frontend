locals {
  aseName = "${data.terraform_remote_state.core_apps_compute.ase_name[0]}"

  localApiUrl = "http://sscs-cor-backend-${var.env}.service.${local.aseName}.internal"
  ApiUrl      = "${var.env == "preview" ? "http://sscs-cor-backend-aat.service.core-compute-aat.internal" : local.localApiUrl}"
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
  asp_rg               = "${var.product}-${var.component}-${var.env}"
  asp_name             = "${var.product}-${var.component}-${var.env}"

  app_settings = {
    SSCS_API_URL                 = "${local.ApiUrl}"
    WEBSITE_NODE_DEFAULT_VERSION = "8.11.1"
    NODE_ENV                     = "${var.infrastructure_env}"
    REDIS_URL                    = "redis://ignore:${urlencode(module.redis-cache.access_key)}@${module.redis-cache.host_name}:${module.redis-cache.redis_port}?tls=true"
    SESSION_SECRET               = "${module.redis-cache.access_key}"
    SECURE_SESSION               = "${var.secure_session}"
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
