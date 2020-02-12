variable "product" {
}

variable "component" {
}

variable "location" {
  default = "UK South"
}

variable "env" {
}

variable "node_environment" {
  default     = "dev"
  description = "Infrastructure environment to point to"
}

variable "subscription" {
}

variable "ilbIp" {}

variable "additional_hostname" {
  default = "sscs-cor.sandbox.platform.hmcts.net"
}

variable "common_tags" {
  type = "map"
}

variable "secure_session" {
  description = "Whether a secure session is required"
  default     = "true"
}

variable "idam_url" {
  description = "url to redirect to for login via idam"
  default    = "https://idam-web-public.demo.platform.hmcts.net"
}

variable "idam_api_url" {
  description = "url for idam api"
  default    = "https://idam-api.demo.platform.hmcts.net"
}

variable "tribunals_api_url" {
  description = "URL for Tribunals api"
  default  = "http://sscs-tribunals-api-demo.service.core-compute-demo.internal"
}

variable "idam_enable_stub" {
  description = "Mount idam stub routes on the app or not"
  default     = "false"
}

variable "evidence_upload_question_page_enabled" {
  description = "Feature switch for evidence upload per question"
  default     = "false"
}

variable "mya_feature_flag" {
  description = "Feature switch for enabling Manage your appeal application"
  default     = "false"
}

variable "additional_evidence_feature_flag" {
  description = "Feature switch for enabling additional evidence upload per case"
  default     = "false"
}

variable "post_bulk_scan" {
  description = "Feature switch for enabling bulk scan cover sheet"
  default     = "false"
}

variable "evidence_upload_question_page_override_allowed" {
  description = "Feature switch for enabling evidence upload per question to be enabled using a cookie"
  default     = "false"
}

variable "https_only_flag" {
  default = "true"
}
